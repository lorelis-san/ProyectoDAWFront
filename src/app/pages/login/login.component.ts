import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  buttonText: string = 'Validando...';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.buttonText = 'Validando...';

    const user = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>('http://localhost:8080/auth/login', user).subscribe({
      next: (data) => {
        const role = data.message;
        this.buttonText = 'Accediendo...';

        setTimeout(() => this.router.navigate(['/clientes']), 1500);
      },
      error: () => {
        this.showError('Credenciales inválidas');
      }
    });
  }

  showError(message: string) {
    this.errorMessage = message;
    this.loading = false;
    this.buttonText = 'Iniciar sesión';

    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  onFocus(event: FocusEvent) {
    const target = event.target as HTMLElement;
    target.parentElement?.classList.add('focused');
  }

  onBlur(event: FocusEvent) {
    const target = event.target as HTMLElement;
    target.parentElement?.classList.remove('focused');
  }
}
