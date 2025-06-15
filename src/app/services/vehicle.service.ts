import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private baseUrl = 'http://localhost:8080/api/vehiculos';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  create(vehicle: Vehicle): Observable<any> {
    return this.http.post(this.baseUrl, vehicle);
  }

  update(id: number, vehicle: Vehicle): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, vehicle);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getByPlaca(placa: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/placa?placa=${placa}`);
  }
}
