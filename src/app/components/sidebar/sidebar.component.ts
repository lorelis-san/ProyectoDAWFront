import { Component, HostListener, OnInit } from '@angular/core';
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
    sidebarActive = false;

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

   // Detectar cambios en el tamaño de ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth > 768) {
      this.sidebarActive = false; // Cerrar sidebar en pantallas grandes
    }
  }

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
  }

  closeSidebar() {
    this.sidebarActive = false;
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
        this.closeSidebar();
      }
    });
  }
}
