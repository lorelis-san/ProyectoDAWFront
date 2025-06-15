import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../../services/product.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  searchTerm: string = '';
  categorias: any[] = [];
  proveedores: any[] = [];

  constructor(private productService: ProductService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadCategorias();
    this.loadProveedores();
    this.getProducts();
  }

  getProducts() {
    this.productService.getEnabled().subscribe(response => {
      this.products = response.data; // asegúrate de que coincide con tu backend
    });
  }

  onSearch(): void {
  if (this.searchTerm.trim()) {
    this.productService.search(this.searchTerm).subscribe({
      next: (response) => {
        this.products = response.data || [];
      },
      error: (err) => console.error(err)
    });
    } else {
      this.getProducts();
    }
  }

  loadCategorias() {
    this.http.get<any>('http://localhost:8080/api/categorias')
      .subscribe(res => this.categorias = res.data);
  }

  loadProveedores() {
    this.http.get<any>('http://localhost:8080/api/suppliers')
      .subscribe(res => this.proveedores = res.data);
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
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.getProducts(); // recargar lista
      });
    }
  }
  editProduct(id: number): void {
  this.router.navigate(['/productos/editar', id]);
  }

  
}
