import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../../stores/AuthStore';
import { inject } from '@angular/core';

export const publicGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Si el usuario ya está autenticado...
  if (authStore.isAuthenticated()) {
    console.log("PublicGuard: User already authenticated. Redirecting to dashboard.");
    // Redirige a la ruta principal protegida (AJUSTA ESTA RUTA si es diferente)
    router.navigate(['/system/dashboard'], { replaceUrl: true });
    return false; // Cancela la navegación a la ruta pública (login)
  } else {
    // Si el usuario no está autenticado, permite el acceso a la ruta pública (login).
    console.log("PublicGuard: User not authenticated. Allowing access to public route.");
    return true;
  }
};
