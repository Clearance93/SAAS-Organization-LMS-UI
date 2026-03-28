import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventDto, UpdateEventDto } from '../interfaces/schools/admin-dashboard/event';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/OrganizationActivities';

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
