
import { Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SystemLayoutComponent } from './system-layout/system-layout.component';
import { MaterialComponent } from './material/material.component';
import { authGuard } from '../../core/guards/auth.guard';
import { ColorComponent } from './color/color.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SucursalComponent } from './sucursal/sucursal.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { MovementComponent } from './movement/movement.component';
import { UserComponent } from './user/user.component';


export const SYSTEM_ROUTES: Routes = [
    {
        path:'',component: SystemLayoutComponent, children:[
            { path: 'dashboard', component: DashboardComponent,},
            { path: 'product', component: ProductComponent},
            { path: 'material', component: MaterialComponent},
            { path: 'proveedor', component: ProveedorComponent},
            { path: 'color', component: ColorComponent},
            { path: 'inventory', component: InventoryComponent},
            { path: 'permission', component: UserComponent},
            { path: 'sucursal', component: SucursalComponent},
            { path: 'categoria', component: CategoriaComponent},
            { path: 'movement', component: MovementComponent},
            
        
        ],
        canActivate: [
          authGuard
        ]
    },
];