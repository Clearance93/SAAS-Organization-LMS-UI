# Thutonet Organization Phase Two - AI Agent Instructions

## Project Overview
**ThutonetOrganizationPhaseTwo** is an Angular 19 SSR (Server-Side Rendering) application for managing educational organizations including schools, churches, and NGOs. The platform handles admin dashboards, student/teacher management, communication, libraries, compliance, and workshops.

**Key Tech Stack**: Angular 19.2, Express SSR, RxJS, Angular Material, Bootstrap 5, TypeScript 5.7

---

## Architecture Overview

### High-Level Structure
```
src/app/
├── pages/          # Standalone components (routes)
├── services/       # @Injectable root-level services with APIs
├── features/       # Domain models and organization-specific logic
├── interfaces/     # Data transfer objects & TypeScript interfaces
├── components/     # Reusable child components
├── shared/         # Pipes, utilities
└── pipes/          # Custom pipes
```

### Critical Design Patterns

**Angular 19 Standalone Model**:
- All components are standalone (no NgModule declarations)
- Services use `@Injectable({ providedIn: 'root' })` for DI
- Components import dependencies directly: `imports: [CommonModule, ReactiveFormsModule, ...]`
- Example: `src/app/pages/organization-setup/organization-setup.component.ts`

**API Layer Architecture**:
- Base URL: `https://localhost:7270/api` (hardcoded in services, switch to environment configs for prod)
- Services abstract HTTP calls and error handling
- Common pattern in `OrganizationService`, `AdminDashboardService`, `CommunicationService`

**Reactive Forms Pattern**:
- All forms use `FormBuilder` and `ReactiveFormsModule`
- Validation includes `Validators.required`, patterns, min/max length
- Form state tracked in component (submitted flag, loading states)

**RxJS State Management**:
- `BehaviorSubject` used for observable state (e.g., `unreadCount$`, `messages$`)
- Services expose observables; components subscribe via `takeUntil` pattern with `OnDestroy`
- Error handling: `catchError` with logging and user-facing messages via Swal alerts

---

## Developer Workflows

### Local Development
```powershell
npm start              # Runs ng serve on http://localhost:4200
npm run watch         # ng build --watch development
npm test              # Karma + Jasmine
```

### Running the Project
- **Dev Server**: `npm start` starts Angular dev server with SSR enabled
- **Build**: `ng build` creates production bundle (check budgets in `angular.json`)
- **Watch Mode**: Used for concurrent development with backend API at `https://localhost:7270`

### Key Debugging
- Router debug instrumentation in `AppComponent` logs navigation; remove after diagnosis (commented with "NOTE: Temporary debug")
- Console logs use `console.debug()` for API payloads (e.g., in `OrganizationService`)
- Error messages extracted from nested API responses (see `AdminDashboardService.handleError()`)

---

## Project-Specific Conventions & Patterns

### File Naming & Organization
- **Pages**: `{name}.component.ts` with full HTML/CSS alongside
- **Services**: One service per domain (`organization.service.ts`, `admin-dashboard.service.ts`, `communication.service.ts`)
- **Interfaces**: Organized by domain under `src/app/interfaces/{domain}/`
- **Models**: Domain models in `src/app/features/organization/models/` (rarely directly used; DTOs preferred)

### Data Flow Pattern (typical page)
1. **Component initializes** → OnInit calls `ngOnInit()`
2. **Service calls** → `this.service.getMethod().pipe(catchError(...)).subscribe(...)`
3. **BehaviorSubjects updated** → State available to template via `async` pipe or component properties
4. **Error handling** → `Swal.fire()` alerts (SweetAlert2) or toast notifications (ngx-toastr)
5. **Navigation** → `this.router.navigate(['/route'], { state: { data } })`

### Enum Usage
- Organization & service types defined as `OrganizationType`, `ServiceType`, `ServiceDuration` enums
- Stringified for API payloads (see `OrganizationService.stringifyOrganizationType()`)
- UI displays use `Object.values(EnumName)` for dropdowns

### Form Handling Specifics
- Multi-checkbox pattern in `organization-setup.component.ts`: `onServiceTypeChange()` manages array-typed form controls
- Website URL validated with regex pattern (optional field with URL validation)
- Phone numbers validated with `/^[0-9+\-\s()]+$/` pattern

### Media & File Handling
- `MediaOptimizationService` compresses images to 600x600 @ 0.6 quality (60-80% reduction)
- `MediaCompressionUtil` in `src/app/utils/media-compression.util.ts` handles binary conversion
- Files uploaded with `compressed: boolean` flag for backend differentiation

---

## Service Boundaries & API Integration

### Core Services Organization
| Service | Domain | Key Endpoints | Pattern |
|---------|--------|---------------|---------|
| `OrganizationService` | Organization Setup | POST `/Organization/Add-New-Organization` | DTO mapping |
| `AdminDashboardService` | School Admin | GET `/SchoolDashboards/adminDashboard/{id}` | BehaviorSubject caching |
| `CommunicationService` | Messaging | GET/POST `/SchoolDashboards/messages` | Observable streams |
| `SchoolsService` | School Mgmt | CRUD operations | Standard HTTP |
| `TeacherService` | Teacher Data | Teacher endpoints | Includes stream data |
| `SettingsService` | Admin Settings | Settings CRUD | Domain-specific configs |

### Error Handling Pattern
```typescript
// Standard pattern seen across services:
catchError((error: HttpErrorResponse) => {
  const message = error.error?.message || error.message || 'Default error';
  console.error('Service Error:', message);
  return throwError(() => new Error(message));
})
```

---

## Key Integration Points & Configuration

### Routing Structure
- All routes defined in `app.routes.ts` (no lazy loading currently)
- Navigation extras used to pass state: `{ state: { userEmail, data } }`
- Wildcard route redirects to `/login`

### SSR Configuration
- Enabled in `angular.json` (`"ssr": true`, `"server": "src/main.server.ts"`)
- Platform checking via `@Inject(PLATFORM_ID)` for browser-only code (localStorage, DOM APIs)
- See `AdminDashboardService.constructor()` for SSR-safe pattern

### Environment Variables
- API URL hardcoded in services (refactor to `environment.ts` for prod-readiness)
- HTTPS localhost certificate required for `https://localhost:7270`

### Dependencies & Versions
- `Angular Material 19` for UI components
- `Bootstrap 5.3` for grid/layout (alongside Material)
- `SweetAlert2` for confirmations and error modals
- `ngx-toastr` for toast notifications
- `@ng-bootstrap/ng-bootstrap` for modal/overlay components

---

## Common Patterns & Anti-Patterns

### ✅ DO:
- Use standalone components with direct imports
- Leverage BehaviorSubject for component-to-service communication
- Implement `OnDestroy` with `Subject` for unsubscribe cleanup (`takeUntil(this.destroy$)`)
- Validate forms declaratively with Validators in FormBuilder
- Log API payloads with `console.debug()` for development

### ❌ DON'T:
- Import `CommonModule` in standalone components marked with `imports` (Angular 19 best practice: only import what's needed)
- Mix template-driven and reactive forms
- Create new HTTP services without error handling
- Forget unsubscribe pattern; use `takeUntil()` with `OnDestroy`
- Hardcode API URLs; use dependency injection or environment configs

---

## Testing & Validation

### Test Structure
- Spec files (`*.spec.ts`) use Karma + Jasmine
- Basic setup: `TestBed.configureTestingModule()` with service injection
- Example: `src/app/services/app-config.service.spec.ts`

### Form Validation Examples
- Email: `Validators.email`
- Phone: `Validators.pattern(/^[0-9+\-\s()]+$/)`
- URL: `Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)`
- Min length: `Validators.minLength(3)`

---

## Before You Start: Critical Context

1. **API Dependency**: All services depend on backend at `https://localhost:7270`. Ensure backend is running.
2. **Debug Mode**: `AppComponent` has temporary router debug logging—remove once navigation issues resolved.
3. **SSR Gotchas**: Use `isPlatformBrowser()` check for localStorage/sessionStorage access.
4. **Media Optimization**: Implemented for performance; compression disabled for videos/PDFs (only images compressed).
5. **Multi-Tenancy Ready**: Organization setup flow creates isolated org contexts; not yet multi-tenant in dashboard.

---

## Quick Reference: Code Examples

**Creating a new page component**:
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { YourService } from '../../services/your.service';

@Component({
  selector: 'app-your-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './your-page.component.html',
  styleUrl: './your-page.component.css'
})
export class YourPageComponent implements OnInit {
  form!: FormGroup;
  
  constructor(private fb: FormBuilder, private service: YourService, private router: Router) {}
  
  ngOnInit(): void {
    this.initForm();
  }
  
  private initForm(): void {
    this.form = this.fb.group({ /* controls */ });
  }
}
```

**Service with error handling**:
```typescript
@Injectable({ providedIn: 'root' })
export class YourService {
  constructor(private http: HttpClient) {}
  
  fetchData(): Observable<YourData> {
    return this.http.get<YourData>(`${this.apiUrl}/endpoint`).pipe(
      catchError(err => {
        console.error('Error:', err.error?.message);
        return throwError(() => new Error(err.error?.message || 'Failed'));
      })
    );
  }
}
```
