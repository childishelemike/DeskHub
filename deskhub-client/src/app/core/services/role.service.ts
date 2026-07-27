import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/dashboard.modules';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly apiUrl = 'https://localhost:7290/api/Roles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }
}
