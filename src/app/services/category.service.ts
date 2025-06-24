// src/app/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private url = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.url);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  search(term: string): Observable<any> {
    const params = new HttpParams().set('termino', term);
    return this.http.get(`${this.url}/buscar`, { params });
  }

  create(category: Category): Observable<any> {
    return this.http.post<any>(this.url, category);
  }

  update(id: number, category: Category): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, category);
  }

  delete(id: number): Observable<any> {
    return this.http.put<any>(`${this.url}/eliminar/${id}`, {});
  }
}
