import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { Router } from '@angular/router';
import { Client } from '../../../models/client.model';
import { AlertService } from '../../../services/alert.service';


@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  constructor(private clientService: ClientService, private router: Router, private alertService: AlertService) { }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (res) => {
        this.clients = res.data;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      }
    });
  }


  async edit(id: number): Promise<void> {
    const confirmed = await this.alertService.confirmEdit(
      '¿Editar cliente?',
      'Estás a punto de editar esta cliente.'
    );

    if (confirmed) {
      this.router.navigate(['/clientes/editar', id]);
    }
  }



  delete(id: number): void {
    this.alertService.confirmDelete('cliente').then(confirmed => {
      if (confirmed) {
        this.clientService.delete(id).subscribe({
          next: () => {
            this.alertService.success('Cliente eliminado', 'El cliente fue eliminado correctamente.');
            this.loadClients();
          },
          error: (err) => {
            this.alertService.error('Error', 'No se pudo eliminar el cliente.');
            console.error(err);
          }
        });
      }
    });
  }


}