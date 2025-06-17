// src/app/components/category/category-form/category-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../models/category.model';
import { AlertService } from '../../../services/alert.service';


@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  category: Category = {
    name: '',
    description: ''
  };

  isEditMode: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.categoryService.getById(+id).subscribe({
        next: (res) => this.category = res.data,
        error: (err) => console.error('Error al cargar la categoría:', err)
      });
    }
  }
  save(): void {
    if (!this.category.name || !this.category.description) {
      this.alertService.requiredFields();
      return;
    }
    if (this.isEditMode && this.category.id) {
      this.categoryService.update(this.category.id, this.category).subscribe({
        next: () => {
          this.alertService.success('Categoría actualizada', 'La categoría fue modificada exitosamente');
          this.router.navigate(['/categorias']);
        },
        error: () => {
          this.alertService.error('Error', 'No se pudo actualizar la categoría');
        }
      });
    } else {
      this.categoryService.create(this.category).subscribe({
        next: () => {
          this.alertService.success('Categoría creada', 'La categoría fue registrada correctamente');
          this.router.navigate(['/categorias']);
        },
        error: () => {
          this.alertService.error('Error', 'No se pudo crear la categoría');
        }
      });
    }
  }
}