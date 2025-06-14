import { Component, OnInit } from '@angular/core';
import { ClientService, Client } from '../../../services/client.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  constructor(private clientService: ClientService) {}

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

  eliminar(id: number): void {
    if (confirm('¿Deseas eliminar este cliente?')) {
      this.clientService.delete(id).subscribe(() => this.loadClients());
    }
  }
}
