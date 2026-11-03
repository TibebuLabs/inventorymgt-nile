import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmployeeModule } from 'src/employee/employee.module';
import { PrismaModule } from 'prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { resolveJwtSecret } from './jwt-secret';

@Module({
  imports: [
    forwardRef(() => EmployeeModule),
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // resolveJwtSecret fails fast in production when the secret is
        // missing instead of silently using a forgeable fallback.
        secret: resolveJwtSecret(),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '8h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
