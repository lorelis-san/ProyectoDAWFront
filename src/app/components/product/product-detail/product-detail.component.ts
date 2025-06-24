import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { AlertService } from '../../../services/alert.service';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit{
product: Product | null = null;
  loading = true;
  categorias: any[] = [];
  proveedores: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private productService: ProductService,
    private alertService: AlertService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadProveedores();
    this.loadProduct();
  }

  loadProduct(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getById(+id).subscribe({
        next: (response) => {
          this.product = response.producto;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar el producto:', error);
          this.alertService.error('Error', 'No se pudo cargar el producto');
          this.loading = false;
        }
      });
    }
  }

  loadCategorias(): void {
    this.http.get<any>('http://localhost:8080/api/categorias')
      .subscribe({
        next: response => this.categorias = response.data,
        error: (err) => {
          console.error('Error al cargar categorías:', err);
        }
      });
  }

  loadProveedores(): void {
    this.http.get<any>('http://localhost:8080/api/suppliers')
      .subscribe({
        next: response => this.proveedores = response.data,
        error: (err) => {
          console.error('Error al cargar proveedores:', err);
        }
      });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categorias.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.proveedores.find(sup => sup.id === supplierId);
    return supplier ? supplier.name : 'Sin proveedor';
  }

  goBack(): void {
    this.location.back();
  }

  editProduct(): void {
    if (this.product?.id) {
      this.router.navigate(['/productos/editar', this.product.id]);
    }
  }

}
