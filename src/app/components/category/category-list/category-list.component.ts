import { Component, OnInit } from '@angular/core';
import { Category } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  category: Category = { name: '', description: '' };
  isEditMode = false;
  showModal = false;
  searchTerm: string = '';
  constructor(
    private categoryService: CategoryService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories = res.data,
      error: () => this.alertService.error('Error', 'No se pudieron cargar las categorías')
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.categoryService.search(this.searchTerm).subscribe({
        next: (response) => {
          this.categories = response.data || [];
        },
        error: (err) => {
          console.error(err);
        }
      });
    } else {
      this.loadCategories();
    }
  }

  openModal(categoria?: Category): void {
    if (categoria) {
      this.category = { ...categoria };
      this.isEditMode = true;
    } else {
      this.category = { name: '', description: '' };
      this.isEditMode = false;
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  save(): void {
    if (!this.category.name || !this.category.description) {
      this.alertService.requiredFields();
      return;
    }

    if (this.isEditMode && this.category.id) {
      this.categoryService.update(this.category.id, this.category).subscribe({
        next: () => {
          this.alertService.success('Categoría actualizada', 'Se actualizó correctamente');
          this.loadCategories();
          this.closeModal();
        },
        error: () => this.alertService.error('Error', 'No se pudo actualizar')
      });
    } else {
      this.categoryService.create(this.category).subscribe({
        next: () => {
          this.alertService.success('Categoría creada', 'Se creó correctamente');
          this.loadCategories();
          this.closeModal();
        },
        error: () => this.alertService.error('Error', 'No se pudo crear')
      });
    }
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
}
