import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { publicGuard } from '../../core/guards/public.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '', component: LoginComponent
  }
];
