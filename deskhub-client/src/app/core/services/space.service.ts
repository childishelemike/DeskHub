import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Space } from '../models/dashboard.modules';
import { environment } from '../../../environments/environment';

export interface SpaceCreateRequest {
  name: string;
  capacity: number;
  isActive: boolean;
  positionX: number;
  positionY: number;
  officeId: number;
  spaceTypeId: number;
}

@Injectable({ providedIn: 'root' })
export class SpaceService {
  private readonly apiUrl = `${environment.apiUrl}/Spaces`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Space[]> {
    return this.http.get<Space[]>(this.apiUrl);
  }

  create(space: SpaceCreateRequest): Observable<Space> {
    return this.http.post<Space>(this.apiUrl, space);
  }

  update(id: number, space: SpaceCreateRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, space);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
