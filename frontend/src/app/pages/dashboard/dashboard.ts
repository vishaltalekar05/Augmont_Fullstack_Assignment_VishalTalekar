import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  downloadCSV() {

    window.open(
      'http://localhost:5000/api/products/report?format=csv',
      '_blank'
    );

  }

  downloadXLSX() {

    window.open(
      'http://localhost:5000/api/products/report?format=xlsx',
      '_blank'
    );

  }

}