import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CotizacionResponse } from '../models/cotizacion-response.model';
import { Observable } from 'rxjs';
import { CotizacionDto } from '../models/CotizacionDTO.model.';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})

export class CotizacionService {

  private baseUrl = 'http://localhost:8080/api/cotizaciones';

  constructor(private http: HttpClient, private authService: AuthService) { }

  crearCotizacion(dto: CotizacionDto): Observable<any> {
    console.log('COTIZACION A ENVIAR:', JSON.stringify(dto, null, 2));
    return this.http.post(`${this.baseUrl}`, dto);
  }
  listarCotizaciones(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  obtenerCotizacionPorId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  actualizarCotizacion(id: number, dto: CotizacionDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, dto);
  }

  eliminarCotizacion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  buscarVehiculoPorPlaca(placa: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/vehiculo/placa/${placa}`);
  }

  guardarVehiculo(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/vehiculo`, dto);
  }

  buscarClientePorDocumento(dni: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/cliente/documento/${dni}`);
  }

  guardarCliente(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cliente`, dto);
  }

  buscarProductos(termino: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/productos/buscar/${termino}`);
  }

  search(term: string): Observable<any> {
    const params = new HttpParams().set('termino', term);
    return this.http.get(`${this.baseUrl}/buscar`, { params });
  }




}
