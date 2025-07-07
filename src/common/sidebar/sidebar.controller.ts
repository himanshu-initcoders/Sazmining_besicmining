import { Controller, Post, Body } from '@nestjs/common';
import { SidebarService } from './sidebar.service';
import { SidebarMenu } from './sidebar.types';
import { GetSidebarDto } from './dto/get-sidebar.dto';

@Controller('sidebar')
export class SidebarController {
  constructor(private readonly sidebarService: SidebarService) {}

  @Post()
  async getSidebar(@Body() getSidebarDto: GetSidebarDto): Promise<SidebarMenu> {
    return this.sidebarService.getUserSidebar(getSidebarDto.userId);
  }
} 