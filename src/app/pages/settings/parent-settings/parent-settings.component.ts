import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-parent-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parent-settings.component.html',
  styleUrls: ['./parent-settings.component.css']
})
export class ParentSettingsComponent implements OnInit {
  activeTab = 'profile';
  parentProfile = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+27 123 456 789',
    address: '123 Main Street, Cape Town',
    emergencyContact: '+27 987 654 321'
  };

  notificationSettings = {
    emailNotifications: true,
    smsNotifications: true,
    gradeUpdates: true,
    attendanceAlerts: true,
    behaviorReports: true,
    eventReminders: true
  };

  privacySettings = {
    shareContactInfo: false,
    allowDirectMessages: true,
    showOnlineStatus: false
  };

  ngOnInit(): void {}

  saveProfile(): void {
    console.log('Profile saved:', this.parentProfile);
  }

  saveNotifications(): void {
    console.log('Notifications saved:', this.notificationSettings);
  }

  savePrivacy(): void {
    console.log('Privacy settings saved:', this.privacySettings);
  }

  changePassword(): void {
    console.log('Change password clicked');
  }

  exportData(): void {
    console.log('Export data clicked');
  }

  deleteAccount(): void {
    console.log('Delete account clicked');
  }
}