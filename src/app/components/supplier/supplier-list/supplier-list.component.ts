import { Component, OnInit } from '@angular/core';
import { SupplierService, Supplier } from '../../../services/supplier.service';


@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];

  constructor(private supplierService: SupplierService) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe(response => {
      this.suppliers = response.data;
    });
  }

  deleteSupplier(id: number): void {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      this.supplierService.deleteSupplier(id).subscribe(() => this.loadSuppliers());
    }
  }
}
