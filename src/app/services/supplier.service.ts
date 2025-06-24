import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = 'http://localhost:8080/api/suppliers';

  constructor(private http: HttpClient) { }

  getAllSuppliers(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  search(term: string): Observable<any> {
    const params = new HttpParams().set('termino', term);
    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }
  getSupplierById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getSupplierByRuc(ruc: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/ruc?ruc=${ruc}`);
  }

  createSupplier(supplier: Supplier): Observable<any> {
    return this.http.post(this.apiUrl, supplier);
  }

  updateSupplier(id: number, supplier: Supplier): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
