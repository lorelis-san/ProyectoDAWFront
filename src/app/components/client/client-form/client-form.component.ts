import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  client: Client = {
    id: undefined,
    firstName: '',
    lastName: '',
    typeDocument: 'DNI',
    documentNumber: '',
    businessName: '',
    phoneNumber: '',
    email: '',
    enabled: true
  };
  isEditMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.clientService.getById(id).subscribe(res => {
        this.client = res.data;
      });
    }
  }

   save(): void {
     if (!this.client.typeDocument || !this.client.documentNumber) {
    this.alertService.requiredFields();
    return;
  }

    if (this.isEditMode) {
      this.clientService.update(this.client.id!, this.client).subscribe({
        next: () => {
          this.alertService.success('Cliente actualizado', 'Los datos fueron guardados correctamente');
          this.router.navigate(['/clientes']);
        },
        error: () => {
          this.alertService.error('Error', 'No se pudo actualizar el cliente');
        }
      });
    } else {
      this.clientService.create(this.client).subscribe({
        next: () => {
          this.alertService.success('Cliente creado', 'El cliente fue registrado exitosamente');
          this.router.navigate(['/clientes']);
        },
        error: () => {
          this.alertService.error('Error', 'No se pudo crear el cliente');
        }
      });
    }
  }
}