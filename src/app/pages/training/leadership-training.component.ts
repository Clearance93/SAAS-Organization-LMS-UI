import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { LeadershipService } from '../../services/leadership/leadership.service';
import { CreateLeadershipProgramDto, LeadershipProgramDto } from '../../interfaces/leadership/leadership';
import { TeacherService, Teacher } from '../../services/teacher.service';

@Component({
  selector: 'app-leadership-training',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="leadership-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Leadership Training</h1>
        <p>Develop leadership skills and management capabilities</p>
      </header>

      <div class="leadership-grid">
        <div class="leadership-card">
          <div class="leadership-icon">👑</div>
          <h3>Executive Leadership</h3>
          <p>Advanced leadership skills for senior management</p>
          <button class="btn-primary" (click)="createProgram('executive')">Create Program</button>
        </div>

        <div class="leadership-card">
          <div class="leadership-icon">🎯</div>
          <h3>Strategic Planning</h3>
          <p>Strategic thinking and organizational planning</p>
          <button class="btn-primary" (click)="createProgram('strategic')">Create Program</button>
        </div>

        <div class="leadership-card">
          <div class="leadership-icon">🤝</div>
          <h3>Team Leadership</h3>
          <p>Leading and managing effective teams</p>
          <button class="btn-primary" (click)="createProgram('team-leadership')">Create Program</button>
        </div>

        <div class="leadership-card">
          <div class="leadership-icon">💡</div>
          <h3>Innovation Leadership</h3>
          <p>Leading change and fostering innovation</p>
          <button class="btn-primary" (click)="createProgram('innovation')">Create Program</button>
        </div>
      </div>

      <div class="leadership-tracks">
        <h2>Active Leadership Programs</h2>
        <div class="programs-grid">
          <div *ngFor="let program of activePrograms" class="program-card">
            <div class="program-info">
              <h4>{{ program.programName }}</h4>
              <p class="program-type">{{ program.programType | titlecase }} • Starts {{ program.startDate | date:'mediumDate' }}</p>
              <p class="program-description">{{ program.description }}</p>
              <div class="program-details">
                <span class="detail">Max: {{ program.maxParticipants }} participants</span>
                <span class="detail" *ngIf="program.isActive">Active</span>
              </div>
            </div>
            <div class="program-actions">
              <button class="btn-view" (click)="viewEnrolledParticipants(program)">View Enrolled</button>
              <button class="btn-enroll" (click)="enrollParticipants(program.programName)">Enroll Participants</button>
            </div>
          </div>
          
          <div *ngIf="activePrograms.length === 0" class="no-programs">
            <p>No active leadership programs found. Create a new program using the cards above.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leadership-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .back-btn { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
    .leadership-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .leadership-card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .leadership-icon { font-size: 3rem; margin-bottom: 1rem; }
    .btn-primary { background: #7c3aed; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    .leadership-tracks h2 { margin-bottom: 1rem; }
    .programs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .program-card { background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: flex-start; }
    .program-actions { display: flex; flex-direction: column; gap: 0.5rem; min-width: 140px; }
    .btn-view { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; white-space: nowrap; font-size: 0.9rem; }
    .program-info h4 { margin: 0 0 0.5rem 0; color: #374151; }
    .program-type { margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.9rem; }
    .program-description { margin: 0 0 1rem 0; color: #4b5563; font-size: 0.9rem; }
    .program-details { display: flex; gap: 0.5rem; }
    .detail { background: #e0e7ff; color: #3730a3; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; }
    .btn-enroll { background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; white-space: nowrap; font-size: 0.9rem; }
    .no-programs { text-align: center; padding: 2rem; color: #6b7280; grid-column: 1 / -1; }
  `]
})
export class LeadershipTrainingComponent implements OnInit {
  organizationId: string = '';
  adminId: string = '';
  organizationType: string = '';
  programs: LeadershipProgramDto[] = [];
  activePrograms: LeadershipProgramDto[] = [];
  staffMembers: any[] = [];
  teachers: Teacher[] = [];
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private leadershipService: LeadershipService,
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.organizationId = params['organizationId'] || 
        (typeof localStorage !== 'undefined' ? localStorage.getItem('organizationId') : null) || '';
    });
    
    this.adminId = (typeof localStorage !== 'undefined' ? localStorage.getItem('adminId') : null) || '';
    this.organizationType = (typeof localStorage !== 'undefined' ? localStorage.getItem('organizationType') : null) || '';
    
    console.log('Organization details:', {
      organizationId: this.organizationId,
      adminId: this.adminId,
      organizationType: this.organizationType,
      isSchool: this.organizationType.toLowerCase() === 'school'
    });
    
    if (this.organizationId && this.adminId) {
      this.loadPrograms();
      if (this.organizationType.toLowerCase() === 'school') {
        console.log('Loading teachers for school organization');
        this.loadTeachers();
      } else {
        console.log('Loading staff members for non-school organization');
        this.loadStaffMembers();
      }
    }
  }

  loadPrograms(): void {
    this.leadershipService.getPrograms(this.organizationId, this.adminId).subscribe({
      next: (programs) => {
        this.programs = programs;
        this.filterActivePrograms();
      },
      error: (error) => {
        console.error('Error loading programs:', error);
      }
    });
  }

  filterActivePrograms(): void {
    const today = new Date();
    this.activePrograms = this.programs.filter(program => {
      const startDate = new Date(program.startDate);
      return startDate >= today && program.isActive;
    });
  }

  loadTeachers(): void {
    console.log('Loading teachers for organization:', this.organizationId);
    console.log('API URL:', `https://localhost:7270/apiSchool/getAllTeachers/${this.organizationId}`);
    this.teacherService.getAllTeachers(this.organizationId).subscribe({
      next: (teachers) => {
        this.teachers = teachers;
        console.log('Teachers loaded successfully:', teachers);
        console.log('Number of teachers found:', teachers.length);
      },
      error: (error) => {
        console.error('Error loading teachers:', error);
        console.error('Failed API call to:', `https://localhost:7270/apiSchool/getAllTeachers/${this.organizationId}`);
        this.teachers = [];
      }
    });
  }

  loadStaffMembers(): void {
    this.leadershipService.getStaffMembers(this.organizationId).subscribe({
      next: (staff) => {
        this.staffMembers = staff;
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.staffMembers = [];
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }

  createProgram(type: string): void {
    const programs = {
      executive: { name: 'Executive Leadership Program', description: 'Advanced leadership skills for C-level executives and senior management' },
      strategic: { name: 'Strategic Planning Program', description: 'Strategic thinking, planning, and organizational development' },
      'team-leadership': { name: 'Team Leadership Program', description: 'Effective team management and collaborative leadership' },
      innovation: { name: 'Innovation Leadership Program', description: 'Leading change, fostering creativity, and driving innovation' }
    };
    
    const program = programs[type as keyof typeof programs];
    
    Swal.fire({
      title: 'Create Leadership Program',
      html: `
        <div class="leadership-form">
          <div class="form-group">
            <label class="form-label"><i class="icon">📋</i> Program Name</label>
            <input type="text" id="programName" value="${program.name}" readonly class="form-input readonly">
          </div>
          
          <div class="form-group">
            <label class="form-label"><i class="icon">🏷️</i> Program Type</label>
            <input type="text" id="programType" value="${type}" readonly class="form-input readonly">
          </div>
          
          <div class="form-group">
            <label class="form-label"><i class="icon">📝</i> Description</label>
            <textarea id="description" class="form-textarea">${program.description}</textarea>
          </div>
          
          <div class="form-row">
          <div class="form-group">
            <label class="form-label"><i class="icon">⏱️</i> Duration</label>
            <input type="text" id="duration" placeholder="e.g., 6 months" class="form-input">
          </div>
            <div class="form-group">
              <label class="form-label"><i class="icon">📅</i> Start Date</label>
              <input type="date" id="startDate" class="form-input">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label"><i class="icon">👥</i> Max Participants</label>
            <input type="number" id="maxParticipants" placeholder="20" min="5" max="50" class="form-input">
          </div>
        </div>
        
        <style>
          .leadership-form {
            text-align: left;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .form-group {
            margin-bottom: 20px;
          }
          .form-group.half {
            width: 48%;
            display: inline-block;
            margin-right: 4%;
          }
          .form-group.half:last-child {
            margin-right: 0;
          }
          .form-row {
            display: flex;
            gap: 15px;
          }
          .form-label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .icon {
            margin-right: 8px;
            font-size: 16px;
          }
          .form-input, .form-textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
            box-sizing: border-box;
          }
          .form-input:focus, .form-textarea:focus {
            outline: none;
            border-color: #7c3aed;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
          }
          .form-input.readonly {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #64748b;
            cursor: not-allowed;
            border-color: #cbd5e1;
          }
          .form-textarea {
            height: 100px;
            resize: vertical;
            font-family: inherit;
          }
          .form-input[type="number"] {
            text-align: center;
          }
          .form-input[type="date"] {
            cursor: pointer;
          }
        </style>
      `,
      width: 600,
      showCancelButton: true,
      confirmButtonText: 'Create Program',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const programName = (Swal.getPopup()?.querySelector('#programName') as HTMLInputElement)?.value;
        const programType = (Swal.getPopup()?.querySelector('#programType') as HTMLInputElement)?.value;
        const description = (Swal.getPopup()?.querySelector('#description') as HTMLTextAreaElement)?.value;
        const duration = (Swal.getPopup()?.querySelector('#duration') as HTMLInputElement)?.value;
        const startDate = (Swal.getPopup()?.querySelector('#startDate') as HTMLInputElement)?.value;
        const maxParticipants = (Swal.getPopup()?.querySelector('#maxParticipants') as HTMLInputElement)?.value;
        
        if (!programName || !programType || !description || !duration || !startDate || !maxParticipants) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }
        
        return { programName, programType, description, duration, startDate, maxParticipants: parseInt(maxParticipants) };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.saveProgram(result.value, type);
      }
    });
  }

  saveProgram(formData: any, type: string): void {
    const programData: CreateLeadershipProgramDto = {
      programName: formData.programName,
      programType: formData.programType,
      description: formData.description,
      organizationId: this.organizationId,
      adminId: this.adminId,
      startDate: formData.startDate,
      maxParticipants: formData.maxParticipants
    };

    this.leadershipService.createProgram(programData).subscribe({
      next: (response) => {
        Swal.fire({
          title: '🎆 Leadership Program Created!',
          html: `<strong>Program:</strong> ${formData.programName}<br><strong>Type:</strong> ${formData.programType}<br><strong>Start Date:</strong> ${new Date(formData.startDate).toLocaleDateString()}<br><br>Program has been saved to the database.`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.loadPrograms(); // Refresh the programs list
      },
      error: (error) => {
        console.error('Error creating program:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to create leadership program. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  enrollParticipants(programName: string): void {
    const isSchool = this.organizationType.toLowerCase() === 'school';
    const participants = isSchool ? this.teachers : this.staffMembers;
    
    if (participants.length === 0) {
      const message = isSchool ? 
        'No teachers found. Please ensure teachers are added to this organization.' : 
        'No staff members found. Please ensure staff members are added to this organization.';
      
      Swal.fire({
        title: 'No Participants Available',
        text: message,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const participantOptions = participants.map(participant => {
      if (isSchool) {
        const teacher = participant as Teacher;
        return `<label style="display: block; margin: 8px 0; text-align: left;">
          <input type="checkbox" value="${teacher.teacherId}" style="margin-right: 8px;">
          <strong>${teacher.firstName} ${teacher.lastName}</strong> - ${teacher.subject} Teacher
        </label>`;
      } else {
        return `<label style="display: block; margin: 8px 0; text-align: left;">
          <input type="checkbox" value="${participant.id}" style="margin-right: 8px;">
          <strong>${participant.name}</strong> - ${participant.role}, ${participant.department}
        </label>`;
      }
    }).join('');

    Swal.fire({
      title: `📝 Enroll ${isSchool ? 'Teachers' : 'Staff Members'}`,
      html: `
        <div style="text-align: left;">
          <h4 style="margin-bottom: 15px;">Program: ${programName}</h4>
          <p style="margin-bottom: 20px;">Select ${isSchool ? 'teachers' : 'staff members'} to enroll in this leadership program:</p>
          <div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
            ${participantOptions}
          </div>
        </div>
      `,
      width: 600,
      showCancelButton: true,
      confirmButtonText: 'Enroll Selected',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const checkboxes = Swal.getPopup()?.querySelectorAll('input[type="checkbox"]:checked');
        
        if (!checkboxes || checkboxes.length === 0) {
          Swal.showValidationMessage('Please select at least one participant');
          return false;
        }
        
        const selectedIds = Array.from(checkboxes).map(cb => (cb as HTMLInputElement).value);
        const selectedParticipants = participants.filter(participant => {
          const id = isSchool ? (participant as Teacher).teacherId : participant.id.toString();
          return selectedIds.includes(id);
        });
        
        return { selectedParticipants };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.processEnrollment(programName, result.value.selectedParticipants, isSchool);
      }
    });
  }

  processEnrollment(programName: string, participants: any[], isSchool: boolean): void {
    const participantNames = participants.map(p => {
      return isSchool ? `${(p as Teacher).firstName} ${(p as Teacher).lastName}` : p.name;
    }).join(', ');
    
    // Find the program to get its ID
    const program = this.activePrograms.find(p => p.programName === programName);
    if (!program) {
      Swal.fire('Error', 'Program not found', 'error');
      return;
    }

    // Enroll each participant
    const enrollmentPromises = participants.map(participant => {
      let enrollmentData;
      if (isSchool) {
        const teacher = participant as Teacher;
        enrollmentData = {
          programId: program.programeId,
          participantId: teacher.teacherId,
          participantName: `${teacher.firstName} ${teacher.lastName}`,
          participantRole: `${teacher.subject} Teacher`,
          department: teacher.subject,
          organizationId: this.organizationId
        };
      } else {
        enrollmentData = {
          programId: program.programeId,
          participantId: participant.id.toString(),
          participantName: participant.name,
          participantRole: participant.role,
          department: participant.department,
          organizationId: this.organizationId
        };
      }
      return this.leadershipService.enrollParticipant(enrollmentData).toPromise();
    });

    Promise.all(enrollmentPromises).then(() => {
      Swal.fire({
        title: '✅ Enrollment Successful!',
        html: `
          <div style="text-align: left;">
            <p><strong>Program:</strong> ${programName}</p>
            <p><strong>Participants Enrolled:</strong> ${participants.length}</p>
            <p><strong>Names:</strong> ${participantNames}</p>
            <br>
            <p>📧 Enrollment confirmations have been saved to the database.</p>
            <p>📅 Participants will be notified of their enrollment.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    }).catch(error => {
      console.error('Error enrolling participants:', error);
      Swal.fire('Error', 'Failed to enroll participants. Please try again.', 'error');
    });
  }

  viewEnrolledParticipants(program: LeadershipProgramDto): void {
    // Get enrolled participants for this program
    this.leadershipService.getEnrolledParticipants(program.programeId).subscribe({
      next: (enrolledParticipants) => {
        if (enrolledParticipants.length === 0) {
          Swal.fire({
            title: 'No Participants Enrolled',
            text: `No participants have been enrolled in "${program.programName}" yet.`,
            icon: 'info',
            confirmButtonText: 'OK'
          });
          return;
        }

        const participantsList = enrolledParticipants.map(participant => 
          `<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
            <div>
              <strong>${participant.participantName}</strong><br>
              <small style="color: #666;">${participant.participantRole} - ${participant.department}</small>
            </div>
            <span style="color: #10b981; font-size: 0.9rem;">✓ Enrolled</span>
          </div>`
        ).join('');

        Swal.fire({
          title: `👥 Enrolled Participants`,
          html: `
            <div style="text-align: left;">
              <h4 style="margin-bottom: 15px; color: #374151;">Program: ${program.programName}</h4>
              <div style="background: #f8fafc; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin: 0; font-size: 0.9rem; color: #64748b;">
                  <strong>Total Enrolled:</strong> ${enrolledParticipants.length} / ${program.maxParticipants} participants
                </p>
              </div>
              <div style="max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                ${participantsList}
              </div>
            </div>
          `,
          width: 600,
          confirmButtonText: 'Close',
          customClass: {
            popup: 'enrolled-participants-modal'
          }
        });
      },
      error: (error) => {
        console.error('Error loading enrolled participants:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load enrolled participants. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}