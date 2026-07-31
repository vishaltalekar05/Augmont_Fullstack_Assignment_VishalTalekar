import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);

  private api = 'http://localhost:5000/api/categories';

  getCategories() {
    return this.http.get(this.api);
  }

  addCategory(data: any) {
    return this.http.post(this.api, data);
  }

  updateCategory(id: number, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  deleteCategory(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

}