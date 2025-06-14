import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService, Client } from '../../../services/client.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit {
  client: Client = {
    typeDocument: 'DNI',
    documentNumber: '',
    phoneNumber: '',
    email: ''
  };
  editing: boolean = false;

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editing = true;
      this.clientService.getById(+id).subscribe(res => {
        this.client = res.data;
      });
    }
  }

  onSubmit(): void {
    if (this.editing && this.client.id) {
      this.clientService.update(this.client.id, this.client).subscribe(() => {
        this.router.navigate(['/clientes']);
      });
    } else {
      this.clientService.create(this.client).subscribe(() => {
        this.router.navigate(['/clientes']);
      });
    }
  }
}
