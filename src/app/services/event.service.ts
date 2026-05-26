import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventDto, UpdateEventDto } from '../interfaces/schools/admin-dashboard/event';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/OrganizationActivities`;

  constructor(private http: HttpClient) {}

  createEvent(eventData: CreateEventDto): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/newEvent`, eventData);
  }

  getAllEvents(organizationId: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/allEvents/${organizationId}`);
  }

  updateEvent(eventId: string, eventData: UpdateEventDto): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/updateEvent/${eventId}`, eventData);
  }
}
