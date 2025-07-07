import { Module } from '@nestjs/common';
import { SidebarService } from './sidebar.service';
import { SidebarController } from './sidebar.controller';
import { UsersModule } from '../../users/users.module';
import { StaffModule } from 'src/staff/staff.module';

@Module({
  imports: [UsersModule,StaffModule],
  controllers: [SidebarController],
  providers: [SidebarService],
  exports: [SidebarService],
})
export class SidebarModule {} 