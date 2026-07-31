import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  login(data:any){
    return this.http.post(
      'http://localhost:5000/api/users/login',
      data
    );
  }

}