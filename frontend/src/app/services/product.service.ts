import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);

  private api = "http://localhost:5000/api/products";

  getProducts(page = 1, limit = 10) {
    return this.http.get(`${this.api}?page=${page}&limit=${limit}`);
  }

  addProduct(data: FormData) {
    return this.http.post(this.api, data);
  }

  updateProduct(id: number, data: FormData) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  getProduct(id: number) {
    return this.http.get(`${this.api}/${id}`);
  }

}