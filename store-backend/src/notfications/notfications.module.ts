import { Module } from '@nestjs/common';
import { NotificationsService } from './notfications.service';
import { NotificationsController } from './notfications.controller';

import { EmployeeModule } from 'src/employee/employee.module';

import { NotificationsGateway } from './notfications.gateway';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
  imports: [EmployeeModule],
})
export class NotficationsModule {}
