import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  private categoryService = inject(CategoryService);

  categories: any[] = [];

  categoryName = '';

  editId: number | null = null;

  constructor() {
  console.log("Constructor Called");}

  ngOnInit() {
    this.loadCategories();
  }


 loadCategories() {

  this.categoryService.getCategories().subscribe({

    next: (res: any) => {

      this.categories = [...res];

      this.cdr.detectChanges();

      console.log("Categories Loaded:", this.categories);

    },

    error: (err) => {

      console.error(err);

    }

  });

}
  saveCategory() {

    if (!this.categoryName.trim()) {
      alert("Enter Category Name");
      return;
    }

    if (this.editId) {

      this.categoryService.updateCategory(this.editId, {
        name: this.categoryName
      }).subscribe(() => {

        alert("Category Updated");

        this.editId = null;
        this.categoryName = '';

        this.loadCategories();

      });

    } else {

      this.categoryService.addCategory({
        name: this.categoryName
      }).subscribe(() => {

        alert("Category Added");

        this.categoryName = '';

        this.loadCategories();

      });

    }

  }

  edit(category: any) {

    this.editId = category.id;

    this.categoryName = category.name;

  }

  delete(id: number) {

    if (confirm("Delete this category?")) {

      this.categoryService.deleteCategory(id).subscribe(() => {

        alert("Category Deleted");

        this.loadCategories();

      });

    }

  }

}