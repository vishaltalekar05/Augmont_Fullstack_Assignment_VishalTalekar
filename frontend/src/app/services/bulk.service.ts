import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BulkService {

  private http = inject(HttpClient);

  private api = "http://localhost:5000/api/products";

  upload(file: File) {

    const formData = new FormData();

    formData.append("file", file);

    return this.http.post(
      `${this.api}/bulk-upload`,
      formData
    );

  }

  getStatus(jobId: string) {

    return this.http.get(
      `${this.api}/bulk-upload/status/${jobId}`
    );

  }

}