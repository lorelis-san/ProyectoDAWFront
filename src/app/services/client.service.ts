import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model'; 


@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8080/api/client';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  searchByDocument(documentNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/buscar/${documentNumber}`);
  }

  create(client: Client): Observable<any> {
    return this.http.post(this.apiUrl, client);
  }

  update(id: number, client: Client): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, client);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
