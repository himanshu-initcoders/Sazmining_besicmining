import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { SidebarMenu, SidebarMenuItem } from './sidebar.types';
import { UserRole } from '../../entities/user.entity';
import { StaffRole } from '../../entities/staff.entity';
import { UsersService } from '../../users/users.service';
import { DoctorService } from '../../users/services/doctor.service';
import { AppException } from '../exceptions/app.exception';
import { StaffService } from '../../staff/staff.service';

@Injectable()
export class SidebarService {
  constructor(
    private readonly usersService: UsersService,
    private readonly doctorService: DoctorService,
    private readonly staffService: StaffService,
  ) {}

  async getUserSidebar(userId: number): Promise<SidebarMenu> {
    console.log("Finding staff with ID:", userId);
    try{

    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new AppException('User not found', 'USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (user.role === UserRole.DOCTOR) {
      const doctor = await this.doctorService.findDoctorByUserId(userId);
      return this.getDoctorSidebar();
    } else if (user.role === UserRole.STAFF) {

      const staff = await this.staffService.findByUserId(+userId);
      return this.getSidebar(user.role, staff.role);
    }

    return { items: [] };
    }catch(error) {
      console.error("Error finding staff:", error);
      return { items: [] };
    }

  }

  private getDoctorSidebar(): SidebarMenu {
    return {
      items: [
        {
          title: 'Dashboard',
          url: '/doctor',
          icon: 'BarChart3',
          isActive: false,
        },
        {
          title: 'Patients',
          url: '/doctor/patients',
          icon: 'Users',
          isActive: false,
        },
        {
          title: 'Appointments',
          url: '/doctor/appointments',
          icon: 'Calendar',
          isActive: false,
        },
        {
          title: 'Visits',
          url: '/doctor/visits',
          icon: 'Activity',
          isActive: false,
        },
        {
          title: 'Prescriptions',
          url: '/doctor/prescriptions',
          icon: 'Pill',
          isActive: false,
        },
        {
          title: 'Courses',
          url: '/doctor/courses',
          icon: 'ClipboardList',
          isActive: false,
        },
        {
          title: 'Admissions',
          url: '/doctor/admissions',
          icon: 'Bed',
          isActive: false,
        },
        {
          title: 'Profile',
          url: '/doctor/profile',
          icon: 'UserCheck',
          isActive: false,
        },
      ],
    };
  }

  private getAdminSidebar(): SidebarMenu {
    return {
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: 'LayoutDashboard',
          isActive: false,
        },
        {
          title: 'User Management',
          url: '/doctors',
          icon: 'UserCog',
          isActive: false,
          items: [
            { title: 'Doctors', url: '/doctors', icon: 'UserMd', isActive: false },
            { title: 'Staff', url: '/staff', icon: 'Users', isActive: false },
          ],
        },
        {
          title: 'Department',
          url: '#',
          icon: 'GitBranchPlus',
          isActive: false,
          items: [
            { title: 'All Departments', url: '/departments/list', icon: 'List', isActive: false },
            { title: 'Add Department', url: '/departments/add', icon: 'Plus', isActive: false },
          ],
        },
        {
          title: 'Appointments',
          url: '/appointments',
          icon: 'CalendarPlus2',
          isActive: false,
        },
        {
          title: 'Billing',
          url: '#',
          icon: 'ReceiptText',
          isActive: false,
          items: [
            { title: 'Invoices', url: '/billing/invoices', icon: 'FileText', isActive: false },
            { title: 'Payments', url: '/billing/payments', icon: 'CreditCard', isActive: false },
          ],
        },
        {
          title: 'Reports',
          url: '#',
          icon: 'MessageSquareWarning',
          isActive: false,
          items: [
            { title: 'Revenue', url: '/reports/revenue', icon: 'TrendingUp', isActive: false },
            { title: 'Patient Stats', url: '/reports/patients', icon: 'PieChart', isActive: false },
          ],
        },
        {
          title: 'Settings',
          url: '/settings',
          icon: 'Settings',
          isActive: false,
        },
      ],
    };
  }

  private getNurseSidebar(): SidebarMenu {
    return {
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: 'Home',
          isActive: false,
        },
        {
          title: 'Patient Care',
          url: '#',
          icon: 'SquareActivity',
          isActive: false,
          items: [
            { title: 'Ward Patients', url: '/patients/ward', icon: 'Users', isActive: false },
            { title: 'Vital Signs', url: '/patients/vitals', icon: 'Activity', isActive: false },
            { title: 'Medication', url: '/patients/medication', icon: 'Thermometer', isActive: false },
          ],
        },
        {
          title: 'Appointments',
          url: '/appointments',
          icon: 'Calendar',
          isActive: false,
        },
        {
          title: 'Medical Records',
          url: '/records',
          icon: 'FileText',
          isActive: false,
        },
        {
          title: 'Inventory',
          url: '/inventory',
          icon: 'Package',
          isActive: false,
        },
        {
          title: 'Schedule',
          url: '/schedule',
          icon: 'Clock',
          isActive: false,
        },
      ],
    };
  }

  private getReceptionistSidebar(): SidebarMenu {
    return {
      items: [
        {
          title: 'Dashboard',
          url: '/receptionist',
          icon: 'Activity',
          isActive: true,
        },
        {
          title: 'Patients',
          url: '/receptionist/patients',
          icon: 'Users',
          isActive: false,
        },
        {
          title: 'Appointments',
          url: '/receptionist/appointments',
          icon: 'Calendar',
          isActive: false,
        },
        {
          title: 'OPD Registration',
          url: '/receptionist/opd',
          icon: 'ClipboardList',
          isActive: false,
        },
        {
          title: 'Emergency',
          url: '/receptionist/emergency',
          icon: 'AlertTriangle',
          isActive: false,
        },
        {
          title: 'Admissions',
          url: '/receptionist/admissions',
          icon: 'Bed',
          isActive: false,
        },
        {
          title: 'Billing',
          url: '/receptionist/billing',
          icon: 'Receipt',
          isActive: false,
        },
        { title: "Reports", url: "/receptionist/reports", icon: 'BarChart3', isActive:false },
      ],
    };
  }

  private getPharmacistSidebar(): SidebarMenu {
    return {
      items: [
        {
    title: "Dashboard",
    url: "/pharmacist",
    icon: "Activity",
    isActive: false,
  },
  {
    title: "Medicines",
    url: "/pharmacist/medicines",
    icon: "Pill",
    isActive: false,
  },
  {
    title: "Prescriptions",
    url: "/pharmacist/prescriptions",
    icon: "FileText",
    isActive: false,
  },
  {
    title: "Inventory",
    url: "/pharmacist/inventory",
    icon: "Package",
   isActive:false,
    items: [
      {
        title: "Batches",
        url: "/pharmacist/inventory/batches",
        isActive: false,
        icon:"Package"
      },
      {
        title: "Orders",
        url: "/pharmacist/inventory/orders",
        isActive:false,
        icon:"Package"
      },
      {
        title: "Stock Levels",
        url: "/pharmacist/inventory/stock",
        isActive:false,
        icon:"Package"
      },
    ],
  },
  {
    title: "Reports",
    url: "/pharmacist/reports",
    icon: "BarChart3",
    isActive:false
  },
  {
    title: "Patients",
    url: "/pharmacist/patients",
    icon: "Users",
    isActive:false
  },
      ],
    };
  }

  private getLaboratorySidebar(): SidebarMenu {
    return {
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: 'Home',
          isActive: false,
        },
        {
          title: 'Test Orders',
          url: '#',
          icon: 'FileText',
          isActive: false,
          items: [
            { title: 'New Orders', url: '/lab/new-orders', icon: 'Plus', isActive: false },
            { title: 'Processing', url: '/lab/processing', icon: 'Clock', isActive: false },
            { title: 'Completed', url: '/lab/completed', icon: 'Check', isActive: false },
          ],
        },
        {
          title: 'Test Results',
          url: '/lab/results',
          icon: 'FileText',
          isActive: false,
        },
        {
          title: 'Inventory',
          url: '#',
          icon: 'Package',
          isActive: false,
          items: [
            { title: 'Lab Supplies', url: '/inventory/supplies', icon: 'Box', isActive: false },
            { title: 'Equipment', url: '/inventory/equipment', icon: 'Tool', isActive: false },
          ],
        },
        {
          title: 'Reports',
          url: '/reports',
          icon: 'BarChart2',
          isActive: false,
        },
      ],
    };
  }

  private getSidebar(userRole: UserRole, staffRole?: StaffRole): SidebarMenu {
    switch (userRole) {
      case UserRole.DOCTOR:
        return this.getDoctorSidebar();
      case UserRole.STAFF:
        switch (staffRole) {
          case StaffRole.NURSE:
            return this.getNurseSidebar();
          case StaffRole.RECEPTIONIST:
            return this.getReceptionistSidebar();
          case StaffRole.PHARMACIST:
            return this.getPharmacistSidebar();
          case StaffRole.LAB_TECHNICIAN:
            return this.getLaboratorySidebar();
          case StaffRole.ADMIN:
            return this.getAdminSidebar();
          default:
            return { items: [] };
        }
      default:
        return { items: [] };
    }
  }
} 