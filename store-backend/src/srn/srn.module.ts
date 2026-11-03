import { Module } from '@nestjs/common';
import { SrnService } from './srn.service';
import { SrnController } from './srn.controller';
import { NotficationsModule } from 'src/notfications/notfications.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  controllers: [SrnController],
  providers: [SrnService],
  imports: [NotficationsModule, AuditModule],
  exports: [SrnService],
})
export class SrnModule {}
