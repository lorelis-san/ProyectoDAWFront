import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../models/product.model';
import { AlertService } from '../../../services/alert.service';
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  searchTerm: string = '';
  categorias: any[] = [];
  proveedores: any[] = [];

  constructor(private productService: ProductService, private router: Router, private http: HttpClient, private alertService: AlertService) { }

  ngOnInit() {
    this.loadCategorias();
    this.loadProveedores();
    this.getProducts();
  }

  getProducts() {
    this.productService.getEnabled().subscribe({
      next: response => {
        this.products = response.data;
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error al cargar productos', err);
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.productService.search(this.searchTerm).subscribe({
        next: (response) => {
          this.products = response.data || [];
        },
        error: (err) => {
          console.error(err);
          this.alertService.error('Error al buscar productos', err);
        }
      });
    } else {
      this.getProducts();
    }
  }

  loadCategorias() {
    this.http.get<any>('http://localhost:8080/api/categorias')
      .subscribe({
        next: res => this.categorias = res.data,
        error: (err) => {
          console.error(err);
          this.alertService.error('Error al cargar categorías', err);
        }
      });
  }

  loadProveedores() {
    this.http.get<any>('http://localhost:8080/api/suppliers')
      .subscribe({
        next: res => this.proveedores = res.data,
        error: (err) => {
          console.error(err);
          this.alertService.error('Error al cargar proveedores', err);
        }
      });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categorias.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.proveedores.find(prov => prov.id === supplierId);
    return supplier ? supplier.name : 'Sin proveedor';
  }

  deleteProduct(id: number) {
    this.alertService.confirmDelete('producto').then(confirmed => {
      if (confirmed) {
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            this.alertService.success('Producto eliminado', 'Se eliminó el producto correctamente');
            this.getProducts();
          },
          error: (err) => {
            console.error(err);
            this.alertService.error('Error al eliminar el producto', err);
          }
        });
      }
    })
  }

  async editProduct(id: number): Promise<void> {
    const confirmed = await this.alertService.confirmEdit(
      '¿Editar producto?',
      'Estás a punto de editar este producto.'
    );

    if (confirmed) {
      this.router.navigate(['/productos/editar', id]);
    }
  }


}
