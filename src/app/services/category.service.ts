// src/app/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id?: number;
  name: string;
  description?: string;
  enabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private url = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.url);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
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
