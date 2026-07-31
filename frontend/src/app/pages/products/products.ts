import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cdr = inject(ChangeDetectorRef);

  products: any[] = [];
  categories: any[] = [];

  productName = '';
  productPrice = '';
  categoryId = '';

  selectedFile: any = null;

  editId: number | null = null;

  page = 1;
  limit = 10;

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((res: any) => {
      this.categories = res;
    });
  }

  loadProducts() {

  this.productService.getProducts(this.page, this.limit)
    .subscribe({

      next: (res: any) => {

        this.products = [...res.data];

        this.cdr.detectChanges();

        console.log("Products:", this.products);

      },

      error: (err) => {

        console.error(err);

      }

    });

}
  onFileSelected(event: any) {

    this.selectedFile = event.target.files[0];

  }

  saveProduct() {

    const formData = new FormData();

    formData.append("name", this.productName);
    formData.append("price", this.productPrice);
    formData.append("categoryId", this.categoryId);

    if (this.selectedFile) {

      formData.append("image", this.selectedFile);

    }

    if (this.editId) {

      this.productService.updateProduct(this.editId, formData)
      .subscribe(() => {

        alert("Product Updated");

        this.resetForm();

        this.loadProducts();

      });

    } else {

      this.productService.addProduct(formData)
      .subscribe(() => {

        alert("Product Added");

        this.resetForm();

        this.loadProducts();

      });

    }

  }

  edit(product: any) {

    this.editId = product.id;

    this.productName = product.name;
    this.productPrice = product.price;
    this.categoryId = product.categoryId;

  }

  delete(id: number) {

    if(confirm("Delete Product?")){

      this.productService.deleteProduct(id)
      .subscribe(()=>{

        alert("Deleted");

        this.loadProducts();

      });

    }

  }

  resetForm(){

    this.editId = null;

    this.productName = '';
    this.productPrice = '';
    this.categoryId = '';

    this.selectedFile = null;

  }

}