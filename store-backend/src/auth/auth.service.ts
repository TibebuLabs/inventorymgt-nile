import {
  Injectable,
  Inject,
  forwardRef,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { EmployeeService } from '../employee/employee.service';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => EmployeeService))
    private readonly employeeService: EmployeeService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.employeeService.findByEmailWithPassword(email);

      if (!user) {
        // Record the failed attempt — useful for spotting brute-force attacks.
        void this.audit.log({
          action: 'LOGIN_FAILED',
          entity: 'auth',
          description: `Failed sign-in attempt for unknown account "${email}"`,
          metadata: { email },
        });
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt
        .compare(password, user.password)
        .catch(() => false);

      if (!isPasswordValid) {
        void this.audit.log({
          employee_id: user.id,
          employee_name: user.full_name,
          role: user.role?.role ?? null,
          action: 'LOGIN_FAILED',
          entity: 'auth',
          entity_id: String(user.id),
          description: `Failed sign-in attempt for ${user.email}`,
          metadata: { email: user.email },
        });
        throw new UnauthorizedException('Invalid email or password');
      }

      // Exclude password from the returned object
      const { password: _pw, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const msg = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.error('[auth] validateUser failed:', msg);
      throw new InternalServerErrorException(
        'Failed to validate user. Please try again.',
      );
    }
  }

  async login(user: any): Promise<{
    token: string;
    fullname: string;
    email: string;
    userRole: string;
    userId: number;
  }> {
    try {
      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role?.role ?? 'employee',
        name: user.full_name,
      };

      const token = this.jwtService.sign(payload);

      void this.audit.log({
        employee_id: user.id,
        employee_name: user.full_name,
        role: user.role?.role ?? 'employee',
        action: 'LOGIN',
        entity: 'auth',
        entity_id: String(user.id),
        description: `${user.full_name} signed in`,
        metadata: { email: user.email },
      });

      return {
        token,
        fullname: user.full_name, // fixed: was user.name (field doesn't exist)
        email: user.email,
        userRole: user.role?.role ?? 'employee',
        userId: user.id,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate JWT token.');
    }
  }
}
