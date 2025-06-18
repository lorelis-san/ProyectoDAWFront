import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  role: string = 'USER';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(private router: Router, private authService: AuthService) { }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const usuario = {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      username: this.username,
      password: this.password,
      role: { name: this.role }
    };

    this.authService.registrarUsuario(usuario).subscribe({
      next: () => {
        this.successMessage = '¡Registro exitoso! Redirigiendo al login...';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al registrar';
        this.loading = false;
      }
    });
  }
}
