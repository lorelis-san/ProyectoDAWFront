// register.component.ts
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @ViewChild('registerForm') registerForm!: NgForm;

  nombre: string = '';
  apellido: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  role: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private location: Location
  ) { }

  onSubmit(): void {
    if (this.registerForm) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.controls[key].markAsTouched();
      });
    }

    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente.';
      return;
    }

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
        this.successMessage = '¡Usuario registrado exitosamente!';
        this.loading = false;

        this.resetForm();

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2050);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al registrar el usuario';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  private resetForm(): void {
    this.nombre = '';
    this.apellido = '';
    this.email = '';
    this.username = '';
    this.password = '';
    this.role = '';

    if (this.registerForm) {
      this.registerForm.resetForm();
    }
  }
}
