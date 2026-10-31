import { Module, forwardRef } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [forwardRef(() => AuthModule)], // Use forwardRef to import AuthModule
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
