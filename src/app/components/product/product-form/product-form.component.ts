import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../../services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  imageUrl!: File;
  isEdit = false;
  id!: number;
  imagePreviewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  )  {
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
    });
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
        categoryProductId: prod.categoryProductId?.id,
        supplierProductId: prod.supplierProductId?.id
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
      this.productService.updateProduct(this.id, productData, this.imageUrl).subscribe(() => {
        this.router.navigate(['/productos']);
      });
    } else {
      this.productService.saveProduct(productData, this.imageUrl).subscribe(() => {
        this.router.navigate(['/productos']);
      });
    }
  }

loadCategorias() {
  this.http.get<any>('http://localhost:8080/api/categorias')
    .subscribe(response => this.categorias = response.data);
}
loadProveedores() {
  this.http.get<any>('http://localhost:8080/api/suppliers')
    .subscribe(response => this.proveedores = response.data);
}

}