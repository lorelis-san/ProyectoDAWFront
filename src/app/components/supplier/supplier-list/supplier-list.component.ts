import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';
import { AlertService } from '../../../services/alert.service';

declare var bootstrap: any; // Para manejar el modal de Bootstrap

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  searchTerm: string = '';


  // Propiedades para el modal
  supplier: Supplier = {
    id: undefined,
    name: '',
    ruc: '',
    email: '',
    phone: '',
    enabled: true
  };
  
  isEditMode = false;
  private modalInstance: any;

  constructor(
    private supplierService: SupplierService, 
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
    this.initializeModal();
  }

  private initializeModal(): void {
    // Inicializar el modal de Bootstrap cuando el componente esté listo
    setTimeout(() => {
      const modalElement = document.getElementById('supplierModal');
      if (modalElement) {
        this.modalInstance = new bootstrap.Modal(modalElement);
      }
    }, 100);
  }

 onSearch(): void {
  if (this.searchTerm.trim()) {
    this.supplierService.search(this.searchTerm).subscribe({
      next: (response) => {
        this.suppliers = response.data || [];
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error', 'No se pudo realizar la búsqueda.');
      }
    });
  } else {
    this.loadSuppliers();
  }
}



  loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (response) => {
        this.suppliers = response.data;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        this.alertService.error('Error', 'No se pudieron cargar los proveedores');
      }
    });
  }

  
  openModal(supplier?: Supplier): void {
    if (supplier) {
     
      this.isEditMode = true;
      this.supplier = { ...supplier }; 
    } else {
     
      this.isEditMode = false;
      this.resetSupplier();
    }
   
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  private resetSupplier(): void {
    this.supplier = {
      id: undefined,
      name: '',
      ruc: '',
      email: '',
      phone: '',
      enabled: true
    };
  }


  save(): void {
 
    if (!this.supplier.name || !this.supplier.ruc || !this.supplier.phone) {
      this.alertService.requiredFields();
      return;
    }

    
    if (this.supplier.ruc.length !== 11) {
      this.alertService.error('RUC inválido', 'El RUC debe tener 11 dígitos');
      return;
    }

    if (this.supplier.phone.length !== 9) {
      this.alertService.error('Teléfono inválido', 'El teléfono debe tener 9 dígitos');
      return;
    }

    if (this.supplier.email && !this.isValidEmail(this.supplier.email)) {
      this.alertService.error('Email inválido', 'Por favor ingrese un email válido');
      return;
    }

    if (this.isEditMode && this.supplier.id) {
      this.updateSupplier();
    } else {
      this.createSupplier();
    }
  }

  private createSupplier(): void {
    this.supplierService.createSupplier(this.supplier).subscribe({
      next: () => {
        this.alertService.success('Proveedor creado', 'El proveedor fue registrado exitosamente.');
        this.closeModal();
        this.loadSuppliers(); 
      },
      error: (err) => {
        console.error('Error al crear proveedor:', err);
        this.alertService.error('Error', 'No se pudo registrar el proveedor.');
      }
    });
  }

  private updateSupplier(): void {
    this.supplierService.updateSupplier(this.supplier.id!, this.supplier).subscribe({
      next: () => {
        this.alertService.success('Proveedor actualizado', 'El proveedor fue actualizado correctamente.');
        this.closeModal();
        this.loadSuppliers(); // Recargar la lista
      },
      error: (err) => {
        console.error('Error al actualizar proveedor:', err);
        this.alertService.error('Error', 'No se pudo actualizar el proveedor.');
      }
    });
  }

  private closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetSupplier();
    this.isEditMode = false;
  }

 
  async deleteSupplier(id: number): Promise<void> {
    const confirmed = await this.alertService.confirmDelete('proveedor');

    if (confirmed) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => {
          this.alertService.success('Proveedor eliminado', 'El proveedor ha sido eliminado correctamente.');
          this.loadSuppliers();
        },
        error: (err) => {
          this.alertService.error('Error', 'No se pudo eliminar el proveedor.');
          console.error(err);
        }
      });
    }
  }


  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isFormValid(): boolean {
    return !!(
      this.supplier.name &&
      this.supplier.ruc &&
      this.supplier.phone &&
      this.supplier.ruc.length === 11 &&
      this.supplier.phone.length === 9 &&
      (!this.supplier.email || this.isValidEmail(this.supplier.email))
    );
  }

  onlyNumbers(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}