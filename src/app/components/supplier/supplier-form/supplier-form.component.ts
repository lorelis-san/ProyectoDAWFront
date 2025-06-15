import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier } from '../../../models/supplier.model';
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
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.supplierService.getSupplierById(+id).subscribe(response => {
        this.supplier = response.data;
      });
    }
  }

  onSubmit(): void {
    if (this.isEdit && this.supplier.id) {
      this.supplierService.updateSupplier(this.supplier.id, this.supplier).subscribe(() => {
        this.router.navigate(['/suppliers']);
      });
    } else {
      this.supplierService.createSupplier(this.supplier).subscribe(() => {
        this.router.navigate(['/suppliers']);
      });
    }
  }
}
