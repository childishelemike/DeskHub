import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/dashboard.modules';

export interface BookingCreateRequest {
  userId: number;
  spaceId: number;
  startTime: string;
  endTime: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = 'https://localhost:7290/api/Bookings';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  create(booking: BookingCreateRequest): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  cancel(id: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
}
}
