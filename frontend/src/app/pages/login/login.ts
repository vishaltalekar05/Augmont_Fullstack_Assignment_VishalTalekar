import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email='';
  password='';

  auth=inject(AuthService);
  router=inject(Router);

  login(){

    this.auth.login({

      email:this.email,
      password:this.password

    }).subscribe({

      next:(res:any)=>{

        localStorage.setItem("token",res.token);

        alert("Login Success");

        this.router.navigate(['/dashboard']);

      },

      error:(err)=>{

        alert(err.error.message);

      }

    });

  }

}