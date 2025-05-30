import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthStore } from '../../../stores/AuthStore'; // Ajusta la ruta
import { MessageService } from 'primeng/api'; // Para mostrar un mensaje de acceso denegado

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const messageService = inject(MessageService);

  // Primero, verifica si el usuario está autenticado.
  // Tu authGuard ya debería hacer esto para rutas protegidas en general.
  // Este permissionGuard asume que se usa DESPUÉS del authGuard o en rutas que ya requieren autenticación.
  if (!authStore.isAuthenticated()) {
    console.warn('[PermissionGuard] User not authenticated. Redirecting to login.');
    router.navigate(['/'], { queryParams: { returnUrl: state.url }, replaceUrl: true }); // Ajusta '/login' si es diferente
    return false;
  }

  // Obtener el permiso requerido de los datos de la ruta
  const requiredPermission = route.data['permission'] as string | string[] | undefined;

  // Si no se define ningún permiso para la ruta, permitir el acceso
  // (o podrías denegarlo por defecto si quieres que todas las rutas protegidas definan un permiso)
  if (!requiredPermission) {
    console.log('[PermissionGuard] No specific permission required for this route. Allowing access.');
    return true;
  }

  // Verificar si el usuario tiene el permiso/permisos
  if (authStore.hasPermission(requiredPermission)) {
    console.log(`[PermissionGuard] User has required permission(s): '${Array.isArray(requiredPermission) ? requiredPermission.join(', ') : requiredPermission}'. Allowing access.`);
    return true;
  } else {
    console.warn(`[PermissionGuard] User does NOT have required permission(s): '${Array.isArray(requiredPermission) ? requiredPermission.join(', ') : requiredPermission}'. Access denied.`);
    messageService.add({
      severity: 'error',
      summary: 'Acceso Denegado',
      detail: 'No tienes los permisos necesarios para acceder a esta sección.',
      life: 5000
    });
    // Redirigir a una página de "acceso denegado" o al dashboard
    router.navigate(['/system/dashboard'], { replaceUrl: true }); // Ajusta esta ruta
    return false;
  }
};
