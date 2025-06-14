import { Component, OnInit } from '@angular/core';
import { ClientService, Client } from '../../../services/client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  constructor(private clientService: ClientService, private router: Router) {}

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

  edit(id: number): void {
    this.router.navigate(['/clientes/editar', id]);
  }

  delete(id: number): void {
    if (confirm('¿Deseas eliminar este cliente?')) {
      this.clientService.delete(id).subscribe(() => this.loadClients());
    }
  }
}