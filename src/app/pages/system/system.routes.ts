import { Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SystemLayoutComponent } from './system-layout/system-layout.component';
import { MaterialComponent } from './material/material.component';
import { authGuard } from '../../core/guards/auth.guard'; // Tu guard de autenticación
import { permissionGuard } from '../../core/guards/permission.guard'; // Tu nuevo guard de permisos
import { ColorComponent } from './color/color.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SucursalComponent } from './sucursal/sucursal.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { MovementComponent } from './movement/movement.component'; // MovimientoInventarioComponent
import { UserComponent } from './user/user.component';
import { RolesComponent } from './roles/roles.component';

export const SYSTEM_ROUTES: Routes = [
    {
        path: '', // Ruta base para el layout del sistema (ej. /system)
        component: SystemLayoutComponent,
        canActivate: [authGuard], // Primero, el usuario debe estar autenticado
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent,
                // Opcional: Si el dashboard también requiere un permiso específico para ser visto
                // canActivate: [permissionGuard],
                // data: { permission: 'view-dashboard' } // Ejemplo de permiso
            },
            {
                path: 'product',
                component: ProductComponent,
                canActivate: [permissionGuard],
                data: { permission: 'manage-products' } // Permiso del backend
            },
            {
                path: 'material',
                component: MaterialComponent,
                canActivate: [permissionGuard],
                data: { permission: 'manage-materials' }
            },
            {
                path: 'proveedor',
                component: ProveedorComponent,
                canActivate: [permissionGuard],
                data: { permission: 'manage-suppliers' }
            },
            {
                path: 'color',
                component: ColorComponent,
                canActivate: [permissionGuard],
                data: { permission: 'manage-colors' }
            },
            {
                path: 'inventory', // Gestión de Stock (tabla de inventarios)
                component: InventoryComponent,
                canActivate: [permissionGuard],
                data: { permission: 'register-inventory' } // Permiso para ver/gestionar stock
            },
            {
                path: 'movement', // Historial de Movimientos de Inventario
                component: MovementComponent, // Asegúrate que el nombre del componente sea este
                canActivate: [permissionGuard],
                data: { permission: 'register-inventory-movement' } // Permiso para ver/registrar movimientos
            },
            {
                path: 'sucursal',
                component: SucursalComponent,
                canActivate: [permissionGuard],
                data: { permission: 'manage-branches' }
            },
            {
                path: 'categoria',
                component: CategoriaComponent,
                canActivate: [permissionGuard],
                // Asumimos que hay un permiso general para categorías de producto y material
                // o podrías tener permisos más granulares si las rutas fueran diferentes.
                data: { permission: 'manage-product-categories' } // O 'manage-material-categories' o uno general
            },
            {
                path: 'user', // Gestión de Usuarios
                component: UserComponent,
                canActivate: [permissionGuard],
                data: { permission: 'manage-users' }
            },
            {
                path: 'roles', // Gestión de Roles y Permisos
                component: RolesComponent,
                canActivate: [permissionGuard],
                data: { permission: 'manage-roles' }
            },
            // La ruta 'permission' que tenías apuntando a UserComponent parece un error,
            // la gestión de permisos usualmente se hace dentro de la gestión de Roles.
            // Si tienes una vista separada solo para listar permisos (lo cual es raro para un usuario final),
            // necesitarías un PermissionListComponent y su propio permiso.
            // { path: 'permission', component: UserComponent}, // <<< REVISAR ESTA RUTA

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default dentro de /system
            { path: '**', redirectTo: 'dashboard' } // Wildcard dentro de /system
        ],
    },
];
