import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

declare var Swal: any;

@Component({
  selector: 'app-church-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './church-admin-dashboard.component.html',
  styleUrl: './church-admin-dashboard.component.css'
})
export class ChurchAdminDashboardComponent implements OnInit {
  churchName = 'Grace Community Church';
  adminName = 'Pastor John';
  
  // Stats
  totalMembers = 450;
  activeMembers = 380;
  upcomingServices = 3;
  monthlyDonations = 45000;
  
  // Quick Actions
  quickActions = [
    { title: 'Schedule Service', icon: '⛪', action: 'scheduleService' },
    { title: 'Add Sermon', icon: '📖', action: 'addSermon' },
    { title: 'Member Directory', icon: '👥', action: 'memberDirectory' },
    { title: 'Donations', icon: '💰', action: 'donations' },
    { title: 'Events', icon: '📅', action: 'events' },
    { title: 'Announcements', icon: '📢', action: 'announcements' }
  ];
  
  // Services
  services: any[] = [];
  sermons: any[] = [];
  
  // Modals
  isServiceModalOpen = false;
  isSermonModalOpen = false;
  
  // Forms
  serviceForm: FormGroup;
  sermonForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.serviceForm = this.fb.group({
      serviceName: ['', Validators.required],
      serviceType: ['Sunday Service', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      duration: [90, Validators.required],
      location: ['Main Sanctuary', Validators.required],
      pastor: ['', Validators.required],
      description: ['']
    });
    
    this.sermonForm = this.fb.group({
      title: ['', Validators.required],
      scripture: ['', Validators.required],
      speaker: ['', Validators.required],
      date: ['', Validators.required],
      series: [''],
      notes: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadServices();
    this.loadSermons();
  }
  
  loadServices(): void {
    this.services = [
      {
        id: '1',
        serviceName: 'Sunday Morning Worship',
        serviceType: 'Sunday Service',
        date: '2025-02-16',
        time: '09:00',
        duration: 90,
        location: 'Main Sanctuary',
        pastor: 'Pastor John',
        attendance: 320
      },
      {
        id: '2',
        serviceName: 'Wednesday Bible Study',
        serviceType: 'Bible Study',
        date: '2025-02-19',
        time: '19:00',
        duration: 60,
        location: 'Fellowship Hall',
        pastor: 'Pastor Mark',
        attendance: 85
      }
    ];
  }
  
  loadSermons(): void {
    this.sermons = [
      {
        id: '1',
        title: 'Walking in Faith',
        scripture: 'Hebrews 11:1-6',
        speaker: 'Pastor John',
        date: '2025-02-09',
        series: 'Faith Series'
      }
    ];
  }
  
  handleQuickAction(action: string): void {
    switch(action) {
      case 'scheduleService':
        this.openServiceModal();
        break;
      case 'addSermon':
        this.openSermonModal();
        break;
      case 'memberDirectory':
        Swal.fire('Coming Soon', 'Member directory feature', 'info');
        break;
      case 'donations':
        Swal.fire('Coming Soon', 'Donations management', 'info');
        break;
      case 'events':
        Swal.fire('Coming Soon', 'Events management', 'info');
        break;
      case 'announcements':
        Swal.fire('Coming Soon', 'Announcements feature', 'info');
        break;
    }
  }
  
  openServiceModal(): void {
    this.isServiceModalOpen = true;
    this.serviceForm.reset({
      serviceType: 'Sunday Service',
      location: 'Main Sanctuary',
      duration: 90
    });
  }
  
  closeServiceModal(): void {
    this.isServiceModalOpen = false;
  }
  
  createService(): void {
    if (this.serviceForm.valid) {
      const newService = {
        id: Date.now().toString(),
        ...this.serviceForm.value,
        attendance: 0
      };
      this.services.unshift(newService);
      Swal.fire('Success!', 'Service scheduled successfully!', 'success');
      this.closeServiceModal();
    }
  }
  
  openSermonModal(): void {
    this.isSermonModalOpen = true;
    this.sermonForm.reset();
  }
  
  closeSermonModal(): void {
    this.isSermonModalOpen = false;
  }
  
  createSermon(): void {
    if (this.sermonForm.valid) {
      const newSermon = {
        id: Date.now().toString(),
        ...this.sermonForm.value
      };
      this.sermons.unshift(newSermon);
      Swal.fire('Success!', 'Sermon added successfully!', 'success');
      this.closeSermonModal();
    }
  }
  
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  
  settings(): void {
    Swal.fire('Coming Soon', 'Settings feature', 'info');
  }
}
