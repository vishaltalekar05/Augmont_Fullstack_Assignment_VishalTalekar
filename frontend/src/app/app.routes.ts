import { Routes } from '@angular/router';
import { BulkUpload } from './pages/bulk-upload/bulk-upload';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Users } from './pages/users/users';
import { Categories } from './pages/categories/categories';
import { Products } from './pages/products/products';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'users', component: Users },
  { path: 'categories', component: Categories },
  { path: 'products', component: Products },
  { path: 'bulk-upload',component: BulkUpload },
  { path: '**', redirectTo: '' }
];