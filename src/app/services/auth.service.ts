import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface LoginDTO {
  username: string;
  password: string;
}

interface RegisterDTO {
  username: string;
  password: string;
  email: string;
  // agrega más campos según tu `NewUserDto`
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/auth'; // cambia el puerto si tu backend usa otro

  constructor(private http: HttpClient) { }

  login(data: LoginDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data, { withCredentials: true });
  }

  register(data: RegisterDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }

  checkAuth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/check-auth`, { withCredentials: true });
  }

  getUserDetails(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/details`, { withCredentials: true });
  }
}
