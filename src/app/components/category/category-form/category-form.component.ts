// src/app/components/category/category-form/category-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CategoryService, Category } from '../../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    private router: Router
  ) {}

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
    if (this.isEditMode && this.category.id) {
      this.categoryService.update(this.category.id, this.category).subscribe(() => {
        this.router.navigate(['/categorias']);
      });
    } else {
      this.categoryService.create(this.category).subscribe(() => {
        this.router.navigate(['/categorias']);
      });
    }
  }
}
