import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { Router } from '@angular/router';
import { Category } from '../../../models/category.model';
import { AlertService } from '../../../services/alert.service'; 

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private alertService: AlertService 
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories = res.data,
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  async delete(id: number): Promise<void> {
  const confirmed = await this.alertService.confirmDelete('categoría');

  if (confirmed) {
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.alertService.success('Categoría eliminada', 'La categoría ha sido eliminada correctamente.');
        this.loadCategories();
      },
      error: (err) => {
        this.alertService.error('Error', 'No se pudo eliminar la categoría.');
        console.error(err);
      }
    });
  }
}

  async edit(id: number): Promise<void> {
    const confirmed = await this.alertService.confirmEdit(
      '¿Editar categoría?',
      'Estás a punto de editar esta categoría.'
    );

    if (confirmed) {
      this.router.navigate(['/categorias/editar', id]);
    }
  }
}
