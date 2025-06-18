import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
username: string = '';

constructor(
  private authService: AuthService
){}

ngOnInit() {
  const tokenData = localStorage.getItem('nombre'); // o donde hayas guardado el nombre
   this.username = this.authService.getUserNameFromToken() || 'Usuario';
}

}
