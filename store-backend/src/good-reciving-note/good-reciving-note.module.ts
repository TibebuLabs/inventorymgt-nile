import { forwardRef, Module } from '@nestjs/common';
import { GrnController } from './good-reciving-note.controller';
import { GrnService } from './good-reciving-note.service';
import { EmployeeModule } from 'src/employee/employee.module';
import { NotficationsModule } from 'src/notfications/notfications.module';
import { StockModule } from 'src/stock/stock.module';

@Module({
  imports: [forwardRef(() => EmployeeModule), NotficationsModule, StockModule],
  controllers: [GrnController],
  providers: [GrnService],
  exports: [GrnService],
})
export class GrnModule {}
