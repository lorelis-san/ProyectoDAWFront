import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];

  constructor(private supplierService: SupplierService, private alertService: AlertService, private router: Router) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe(response => {
      this.suppliers = response.data;
    });
  }


  async deleteSupplier(id: number): Promise<void> {
    const confirmed = await this.alertService.confirmDelete('proveedor');

    if (confirmed) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => {
          this.alertService.success('Proveedor eliminado', 'El proveedor ha sido eliminada correctamente.');
          this.loadSuppliers();
        },
        error: (err) => {
          this.alertService.error('Error', 'No se pudo eliminar el proveedor.');
          console.error(err);
        }
      });
    }
  }

  async edit(id: number): Promise<void> {
    const confirmed = await this.alertService.confirmEdit(
      '¿Editar proveedor?',
      'Estás a punto de editar este proveedor.'
    );

    if (confirmed) {
      this.router.navigate(['/suppliers/edit', id]);
    }
  }

}
