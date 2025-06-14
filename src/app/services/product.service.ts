import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  id?: number;
  cod: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  year?: string;
  sede: string;
  costPrice?: number;
  costDealer?: number;
  salePrice?: number;
  stock?: number;
  imageUrl?: string;
  idCategory: number;
  idSupplier: number;
  enabled?: boolean;
}

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

  saveProduct(product: Product, imageFile?: File): Observable<any> {
    const formData = this.convertToFormData(product, imageFile);
    return this.http.post(`${this.apiUrl}`, formData);
  }

  updateProduct(id: number, product: Product, imageFile?: File): Observable<any> {
    const formData = this.convertToFormData(product, imageFile);
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private convertToFormData(product: Product, imageFile?: File): FormData {
    const formData = new FormData();
    for (const key in product) {
      if (product[key as keyof Product] !== null && product[key as keyof Product] !== undefined) {
        formData.append(key, String(product[key as keyof Product]));
      }
    }
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }
    return formData;
  }
}
