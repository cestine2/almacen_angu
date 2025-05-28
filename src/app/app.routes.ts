import { Routes } from '@angular/router';
import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
    {
        path:'', loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES),
        canActivate: [publicGuard]
    },
    
    {
        path:'system', loadChildren: () => import('./pages/system/system.routes').then(m => m.SYSTEM_ROUTES)
    }
    

];
