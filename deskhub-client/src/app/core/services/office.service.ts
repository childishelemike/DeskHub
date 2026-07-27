import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Office } from '../models/dashboard.modules';

export interface OfficeCreateRequest {
  name: string;
  address: string;
  city: string;
  companyId: number;
  openingTime: string;
  closingTime: string;
  workingDays: string;
}

@Injectable({ providedIn: 'root' })
export class OfficeService {
  private readonly apiUrl = 'https://localhost:7290/api/Offices';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Office[]> {
    return this.http.get<Office[]>(this.apiUrl);
  }

  getById(id: number): Observable<Office> {
    return this.http.get<Office>(`${this.apiUrl}/${id}`);
  }

  create(office: OfficeCreateRequest): Observable<Office> {
    return this.http.post<Office>(this.apiUrl, office);
  }

  update(id: number, office: OfficeCreateRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, office);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
