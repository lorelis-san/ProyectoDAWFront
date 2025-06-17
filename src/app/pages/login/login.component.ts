import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  usuario: any[] = []
  formLogin: FormGroup
  
 constructor(
    private _loginService : AuthService,
    private route: Router,
    private fb: FormBuilder
  )
{
    this.formLogin = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required])
    })
   }

  ngOnInit(): void {
    this.initForm()
  }

  initForm() {
    this.formLogin = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required])
    })
  }

  login(){
    if(this.formLogin.valid){
      console.log("Acceso", this.formLogin.value)
      this._loginService.ingresar(this.formLogin.value)
      .subscribe({
        next: (res) => {
       
          this.route.navigate(['/clientes'])
        },
        error: (err: HttpErrorResponse) => {
          this.alertaError("Correo o contraseña incorrecta ")
        }
      });
    }
  }

  alertaError(message : string){
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: message,
      showConfirmButton: false,
      timer: 1500
    });
    this.formLogin.reset();
  }
}
