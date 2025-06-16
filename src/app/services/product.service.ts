import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/productos'; // Cambia el puerto si tu backend está en otro

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getEnabled(): Observable<any> {
    return this.http.get(`${this.apiUrl}/habilitados`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  search(term: string): Observable<any> {
    const params = new HttpParams().set('termino', term);
    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }

  saveProduct(product: Partial<Product>, imageUrl?: File): Observable<any> {
    const formData = this.convertToFormData(product, imageUrl);
    return this.http.post(`${this.apiUrl}`, formData);
  }

  updateProduct(id: number, product: Partial<Product>, imageUrl?: File): Observable<any> {
    const formData = this.convertToFormData(product, imageUrl);
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

 private convertToFormData(product: Partial<Product>, imageUrl?: File): FormData {
    const formData = new FormData();
    for (const key in product) {
      const value = product[key as keyof Product];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    }
    if (imageUrl) {
      formData.append('imageFile', imageUrl); 
    }
    return formData;
  }
}
