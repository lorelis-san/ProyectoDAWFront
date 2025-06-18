import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private login: string = 'http://localhost:8080/login';
  private register: string = 'http://localhost:8080/api/usuario';

  constructor(
    private http: HttpClient
  ) { }

  ingresar(request: any): Observable<any> {
    return this.http.post(`${this.login}`, request, {
      observe: 'response'
    }).pipe(map((response: HttpResponse<any>) => {
      const body = response.body;
      const headers = response.headers;

      const bearerToken = headers.get('Authorization');
      const token = bearerToken ? bearerToken.replace('Bearer ', '') : null;

      if (token) {
        localStorage.setItem('token', token);

      } else {
        console.error('Error al autentificarse');
      }
      return body;
    }))
  }

  token() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
  getUserNameFromToken(): string | null {
    const token = this.token();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.nombre || null;
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }
  }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(this.register, usuario);
  }

}
