export interface SidebarMenuItem {
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
  items?: SidebarMenuItem[];
}

export interface SidebarMenu {
  items: SidebarMenuItem[];
} 