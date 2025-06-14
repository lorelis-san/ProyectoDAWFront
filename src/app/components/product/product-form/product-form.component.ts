import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  imageFile!: File;
  isEdit = false;
  productId!: number;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      cod: ['', Validators.required],
      name: ['', Validators.required],
      brand: [''],
      salePrice: ['', Validators.required],
      stock: [''],
      // otros campos
    });

    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.isEdit = true;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number) {
    this.productService.getById(id).subscribe(response => {
      this.productForm.patchValue(response.data);
    });
  }

  onFileChange(event: any) {
    this.imageFile = event.target.files[0];
  }

  submit() {
    const formData = new FormData();
    Object.entries(this.productForm.value).forEach(([key, val]) => {
      formData.append(key, val);
    });
    if (this.imageFile) {
      formData.append('imageFile', this.imageFile);
    }

    if (this.isEdit) {
      this.productService.updateProduct(this.productId, formData).subscribe(() => {
        this.router.navigate(['/products']);
      });
    } else {
      this.productService.createProduct(formData).subscribe(() => {
        this.router.navigate(['/products']);
      });
    }
  }
}
