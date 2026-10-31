import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { DepartmentModule } from './department/department.module';
import { ApprovementModule } from './approvement/approvement.module';
import { SccModule } from './scc/scc.module';
import { StockInModule } from './stock-in/stock-in.module';
import { StockOutModule } from './stock-out/stock-out.module';
import { StockBalanceModule } from './stock-balance/stock-balance.module';
import { AuthModule } from './auth/auth.module';
import { GrnItemModule } from './grnitem/grnitem.module';
import { ReferanceSccModule } from './reference-scc/reference-scc.module';
import { GrnModule } from './good-reciving-note/good-reciving-note.module';
import { UnitmesurmentModule } from './unitmesurment/unitmesurment.module';
import { ItemtypeModule } from './itemtype/itemtype.module';
import { RoleModule } from './role/role.module';
import { ItemModule } from './item/item.module';
import { SrnModule } from './srn/srn.module';
import { SrnItemModule } from './srn-item/srn-item.module';
import { StoreIssueVoucherModule } from './store-issue-voucher/store-issue-voucher.module';
import { StoreIssueVoucherItemModule } from './store-issue-voucher-item/store-issue-voucher-item.module';
import { NotficationsModule } from './notfications/notfications.module';
import { AddtostockModule } from './addtostock/addtostock.module';
import { OutStockModule } from './out-stock/out-stock.module';
import { PrismaModule } from 'prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { VendorModule } from './vendor/vendor.module';
import { StockModule } from './stock/stock.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    // Load .env globally — isGlobal makes ConfigService available everywhere
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // One shared PrismaClient for the whole app (avoids pool exhaustion).
    PrismaModule,
    AuditModule,
    EmployeeModule,
    DepartmentModule,
    ApprovementModule,
    GrnModule,
    GrnItemModule,
    SccModule,
    ReferanceSccModule,
    StockInModule,
    StockOutModule,
    StockBalanceModule,
    AuthModule,
    UnitmesurmentModule,
    ItemtypeModule,
    RoleModule,
    ItemModule,
    SrnModule,
    SrnItemModule,
    StoreIssueVoucherModule,
    StoreIssueVoucherItemModule,
    NotficationsModule,
    AddtostockModule,
    OutStockModule,
    VendorModule,
    StockModule,
    DashboardModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
