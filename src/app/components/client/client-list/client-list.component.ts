import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';
import { AlertService } from '../../../services/alert.service';


declare var bootstrap: any;

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  // Propiedades para el modal
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
  private modalInstance: any;

  constructor(
    private clientService: ClientService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadClients();
    this.initializeModal();
  }

  private initializeModal(): void {
    // Inicializar el modal de Bootstrap cuando el componente esté listo
    setTimeout(() => {
      const modalElement = document.getElementById('clienteModal');
      if (modalElement) {
        this.modalInstance = new bootstrap.Modal(modalElement);
      }
    }, 100);
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (res) => {
        this.clients = res.data;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.alertService.error('Error', 'No se pudieron cargar los clientes');
      }
    });
  }

  // Método para abrir el modal (nuevo cliente o editar)
  openModal(cliente?: Client): void {
    if (cliente) {
      // Modo edición
      this.isEditMode = true;
      this.client = { ...cliente }; // Clonar el objeto para evitar modificar el original
    } else {
      // Modo creación
      this.isEditMode = false;
      this.resetClient();
    }

    // Abrir el modal
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }


  private resetClient(): void {
    this.client = {
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
  }


  onDocumentTypeChange(): void {
    if (this.client.typeDocument === 'DNI') {
      this.client.businessName = ''; // Limpiar razón social si cambia a DNI
    }
  }

  // Método para guardar (crear o actualizar)
  save(): void {
  // Validación inicial de campos vacíos
  if (!this.client.typeDocument || !this.client.documentNumber) {
    this.alertService.requiredFields();
    return;
  }

  // Validación de formato de documento
  if (this.client.typeDocument === 'DNI' && !/^\d{8}$/.test(this.client.documentNumber)) {
    this.alertService.error('Error', 'El DNI debe tener 8 dígitos numéricos');
    return;
  }

  if (this.client.typeDocument === 'RUC' && !/^\d{11}$/.test(this.client.documentNumber)) {
    this.alertService.error('Error', 'El RUC debe tener 11 dígitos numéricos');
    return;
  }

  // Validaciones específicas según tipo
  if (this.client.typeDocument === 'DNI') {
    if (!this.client.firstName || !this.client.lastName) {
      this.alertService.error('Campos obligatorios', 'Nombres y apellidos son requeridos');
      return;
    }
  }

  if (this.client.typeDocument === 'RUC' && !this.client.businessName) {
    this.alertService.error('Campo obligatorio', 'Razón social es requerida para RUC');
    return;
  }

  if (!this.client.phoneNumber || !this.client.email) {
    this.alertService.error('Campos obligatorios', 'Teléfono y correo son requeridos');
    return;
  }

  // ✅ Validar si el documento ya existe antes de guardar
  this.clientService.searchByDocument(this.client.documentNumber).subscribe({
    next: (res) => {
      if (res.data && (!this.isEditMode || res.data.id !== this.client.id)) {
        this.alertService.error('Documento duplicado', 'Ya existe un cliente con ese número de documento.');
        return;
      }

      // ✅ Si no hay duplicado o estamos editando el mismo cliente
      if (this.isEditMode) {
        this.updateClient();
      } else {
        this.createClient();
      }
    },
    error: () => {
      // Si da error (ej. 404), significa que no existe, se puede crear
      if (this.isEditMode) {
        this.updateClient();
      } else {
        this.createClient();
      }
    }
  });
}


  private createClient(): void {
    this.clientService.create(this.client).subscribe({
      next: () => {
        this.alertService.success('Cliente creado', 'El cliente fue registrado exitosamente');
        this.closeModal();
        this.loadClients(); // Recargar la lista
      },
      error: (err) => {
        console.error('Error al crear cliente:', err);
        this.alertService.error('Error', 'No se pudo crear el cliente');
      }
    });
  }

  private updateClient(): void {
    this.clientService.update(this.client.id!, this.client).subscribe({
      next: () => {
        this.alertService.success('Cliente actualizado', 'Los datos fueron guardados correctamente');
        this.closeModal();
        this.loadClients(); // Recargar la lista
      },
      error: (err) => {
        console.error('Error al actualizar cliente:', err);
        this.alertService.error('Error', 'No se pudo actualizar el cliente');
      }
    });
  }

  // Método para cerrar el modal
  private closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetClient();
    this.isEditMode = false;
  }

  // Método para eliminar cliente (mantenido del código original)
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

  // Método de utilidad para validar formulario (opcional)
  isFormValid(): boolean {
    return !!(
      this.client.typeDocument &&
      this.client.documentNumber &&
      this.client.firstName &&
      this.client.lastName &&
      this.client.phoneNumber &&
      this.client.email &&
      (this.client.typeDocument === 'DNI' || this.client.businessName)
    );
  }
}