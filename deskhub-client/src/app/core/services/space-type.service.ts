import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpaceType } from '../models/dashboard.modules';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SpaceTypeService {
  private readonly apiUrl = `${environment.apiUrl}/SpaceTypes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SpaceType[]> {
    return this.http.get<SpaceType[]>(this.apiUrl);
  }
}
