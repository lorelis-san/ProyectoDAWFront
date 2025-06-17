import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css']
})
export class SupplierFormComponent implements OnInit {
  supplier: Supplier = {
    name: '',
    ruc: '',
    email: '',
    phone: ''
  };

  isEdit = false;

  constructor(
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService

  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.supplierService.getSupplierById(+id).subscribe({
        next: (res) => {
          this.supplier = res.data;
        },
        error: (err) => {
          this.alertService.error('Error', 'No se pudo cargar el proveedor');
          console.error(err);
        }
      });
    }
  }

   onSubmit(): void {
    if (!this.supplier.name || !this.supplier.ruc || !this.supplier.email || !this.supplier.phone) {
      this.alertService.requiredFields();
      return;
    }

    if (this.isEdit && this.supplier.id) {
      this.supplierService.updateSupplier(this.supplier.id, this.supplier).subscribe({
        next: () => {
          this.alertService.success('Proveedor actualizado', 'El proveedor fue actualizado correctamente.');
          this.router.navigate(['/suppliers']);
        },
        error: (err) => {
          this.alertService.error('Error', 'No se pudo actualizar el proveedor.');
          console.error(err);
        }
      });
    } else {
      this.supplierService.createSupplier(this.supplier).subscribe({
        next: () => {
          this.alertService.success('Proveedor creado', 'El proveedor fue registrado exitosamente.');
          this.router.navigate(['/suppliers']);
        },
        error: (err) => {
          this.alertService.error('Error', 'No se pudo registrar el proveedor.');
          console.error(err);
        }
      });
    }
  }
}