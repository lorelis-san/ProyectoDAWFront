import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../models/product.model';
import { AlertService } from '../../../services/alert.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  imageUrl!: File;
  isEdit = false;
  id!: number;
  imagePreviewUrl: string | null = null;
currentYear: number = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService
  ) {
    this.productForm = this.fb.group({
      id: [null],
      cod: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      brand: [''],
      model: [''],
      year: [''],
      sede: ['', Validators.required],
      costPrice: [0],
      dealerPrice: [0],
      salePrice: [0],
      stock: [0],
      categoryProductId: [null, Validators.required],
      supplierProductId: [null, Validators.required],
      imageUrl: [null],
    }, {
      validators: this.priceOrderValidator()
    });
  }

  // Validar que el año sea numérico, de 4 cifras y razonable
yearValidator(control: any): { [key: string]: boolean } | null {
  const value = control.value;
  const year = value;
  const currentYear = new Date().getFullYear();

  if (!value || isNaN(year)) {
    return { invalidYear: true }; // No es un número
  }

  if (year < 1900 || year > currentYear) {
    return { invalidYearRange: true }; // Fuera de rango
  }

  return null;
}


  // Validar que los precios sigan el orden lógico: costo < dealer < venta
  priceOrderValidator(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const cost = group.get('costPrice')?.value;
      const dealer = group.get('dealerPrice')?.value;
      const sale = group.get('salePrice')?.value;

      if (cost > dealer || dealer > sale || cost > sale) {
        return { invalidPriceOrder: true };
      }
      return null;
    };
  }


  categorias: any[] = [];
  sedes: string[] = ['Lima', 'Chiclayo', 'Trujillo', 'Piura', 'Arequipa'];
  proveedores: any[] = [];



  ngOnInit(): void {
    this.loadCategorias();
    this.loadProveedores();
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEdit = true;
      this.id = +id;
      console.log('Editando producto con ID:', this.id);
      this.productService.getById(this.id).subscribe(response => {
        const prod = response.producto;
        this.productForm.patchValue({
          ...prod,
        });
        this.imagePreviewUrl = prod.imageUrl ?? null;
      });
    }

  }

  onFileSelected(event: any): void {
    this.imageUrl = event.target.files[0];
  }

  onSubmit(): void {
    const productData: Partial<Product> = this.productForm.value;

    if (this.isEdit && this.id) {
      this.productService.updateProduct(this.id, productData, this.imageUrl).subscribe({
        next: () => {
          this.alertService.success('Producto actualizado', 'El producto fue actualizado correctamente');
          this.router.navigate(['/productos']);
        },
        error: (err) => {
          console.error(err);
          this.alertService.error('Error al actualizar el producto', err);
        }
      });
    } else {
      this.productService.saveProduct(productData, this.imageUrl).subscribe({
        next: () => {
          this.alertService.success('Producto registrado', 'El producto fue registrado correctamente');
          this.router.navigate(['/productos']);
        },
        error: (err) => {
          console.error(err);
          this.alertService.error('Error al registrar el producto', err);
        }
      });
    }
  }

  loadCategorias() {
    this.http.get<any>('http://localhost:8080/api/categorias')
      .subscribe({
        next: response => this.categorias = response.data,
        error: (err) => {
          console.error(err);
          this.alertService.error('Error al cargar categorías', err);
        }
      });
  }

  loadProveedores() {
    this.http.get<any>('http://localhost:8080/api/suppliers')
      .subscribe({
        next: response => this.proveedores = response.data,
        error: (err) => {
          console.error(err);
          this.alertService.error('Error al cargar proveedores', err);
        }
      });
  }
}