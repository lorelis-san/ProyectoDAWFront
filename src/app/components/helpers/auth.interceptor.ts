import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private _loginService : AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this._loginService.token();

    if(token){
      const clone = request.clone({
        headers : request.headers.set('Authorization', `Bearer ${token}`)
      })
      return next.handle(clone);
    }

    return next.handle(request);
  }
}
