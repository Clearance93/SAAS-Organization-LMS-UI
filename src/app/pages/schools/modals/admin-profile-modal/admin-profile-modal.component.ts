import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnChanges, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { AdminProfileData } from '../../../../interfaces/schools/admin-dashboard/admin-profile-data';
import { AdminProfileModel } from '../../../../features/organization/models/school-dashboards/admin-profile-model';
import { AdminDashboardService } from '../../../../services/schoolDashboards/admin-dashboard.service';

@Component({
  selector: 'app-admin-profile-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile-modal.component.html',
  styleUrl: './admin-profile-modal.component.css'
})
export class AdminProfileModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() adminData: AdminProfileData | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();
  @Output() changePhoto = new EventEmitter<void>();
  @Input() adminEmail: string = '';

  isLoading: boolean = false;
  errorMessage: string = '';
  detailedAdminData: AdminProfileModel | null = null;

  constructor(
    private adminService: AdminDashboardService,
    private router: Router, 
    @Inject(PLATFORM_ID) private platfromId: Object
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (isPlatformBrowser(this.platfromId)) {
      if (changes['isOpen'] && this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else if (changes['isOpen'] && !this.isOpen) {
        document.body.style.overflow = 'auto';
      }
    }
  }

  loadAdminDetailsByEmail(): void {
    if (!this.adminEmail) {
      this.errorMessage = 'Admin email not provided';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getAdminByEmail(this.adminEmail).subscribe({
      next: (adminDetails: AdminProfileModel) => {
        this.detailedAdminData = adminDetails;

        if (this.adminData) {
          this.adminData = {
            ...this.adminData,
            firstName: adminDetails.firstName,
            lastName: adminDetails.lastName,
            adminBusinessEmail: adminDetails.adminBusinessEmail || this.adminData.adminBusinessEmail,
            adminProfilePicture: adminDetails.adminProfilePicture || this.adminData.adminProfilePicture,
            isSuperAdmin: adminDetails.isSuperAdmin,
            organizationName: adminDetails.organizationName || this.adminData.organizationName,
            typeOfService: adminDetails.typeOfService || this.adminData.typeOfService
          };
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading admin details:', err);
        this.errorMessage = err.message || 'Failed to load admin details';
        this.isLoading = false;
      }
    });
  }

  closeModal(): void {
    if (isPlatformBrowser(this.platfromId)) {
      document.body.style.overflow = 'auto';
    }
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  onEditProfile(): void {
    this.closeModal();

    const adminId = this.detailedAdminData?.AdminId || this.adminData?.adminId;

    if (!adminId) {
      console.error('Admin ID not found');
      this.errorMessage = 'Cannot edit profile: Admin ID not found';
      return;
    }

    this.router.navigate(['/edit-admin-profile'], {
      queryParams: {
        adminId: adminId
      }
    });
  }

  onChangePhoto(): void {
    this.changePhoto.emit();
  }

  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }

  getServiceTypes(typeOfService: string): string[] {
    if (!typeOfService) {
      return [];
    }

    try {
      const parsed = JSON.parse(typeOfService);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing service types:', error);

      const match = typeOfService.match(/\[(.*)\]/);
      if (match) {
        return match[1]
          .split(',')
          .map(s => s.trim().replace(/['"']/g, '').replace(/\\u0026/g, '&'));
      }
      return [];
    }
  }

  onImageError(): void {
    if (this.adminData) {
      this.adminData.adminProfilePicture = null;
    }
  }
}