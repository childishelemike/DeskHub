import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpaceType } from '../models/dashboard.modules';

@Injectable({ providedIn: 'root' })
export class SpaceTypeService {
  private readonly apiUrl = 'https://localhost:7290/api/SpaceTypes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SpaceType[]> {
    return this.http.get<SpaceType[]>(this.apiUrl);
  }
}
