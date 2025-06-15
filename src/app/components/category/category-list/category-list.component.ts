// src/app/components/category/category-list/category-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CategoryService} from '../../../services/category.service';
import { Router } from '@angular/router';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];

  constructor(private categoryService: CategoryService, private router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories = res.data,
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  delete(id: number): void {
    if (confirm('¿Deseas eliminar esta categoría?')) {
      this.categoryService.delete(id).subscribe(() => this.loadCategories());
    }
  }

  edit(id: number): void {
    this.router.navigate(['/categorias/editar', id]);
  }
}
