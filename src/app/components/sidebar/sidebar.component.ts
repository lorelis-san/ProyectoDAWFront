import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  username: string | null = '';
  role: string | null = null;
  constructor(
    private _loginService: AuthService,
    private route: Router
  ) { }
  ngOnInit(): void {
    this.username = this._loginService.getUserNameFromToken() || 'Usuario';
    this.role = this._loginService.getUserRole();
  
    console.log('el rol es: '+this.role);
  }


 isAdmin(): boolean {
    return this.role === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    return this.role === 'ROLE_USER';
  }

  logout() {
    Swal.fire({
      title: '¿Estás seguro de cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this._loginService.logout();
        this.route.navigate(['login']);
      }
    });
  }
}
