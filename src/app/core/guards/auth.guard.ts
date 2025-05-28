import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../../stores/AuthStore';
import { inject } from '@angular/core';
// import { jwtDecode } from 'jwt-decode';
// import { delay, of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const isAuthenticated = authStore.isAuthenticated();

  // Usa la señal computada isAuthenticated del store
  if (isAuthenticated) {
    console.log("AuthGuard: User authenticated. Allowing access.");
    return true; // Si está autenticado, permite el acceso
  } else {
    // Si no está autenticado (porque checkSession falló o no había token), redirige al login.
    console.warn("AuthGuard: User not authenticated. Redirecting to login page.");
    // Redirige a la página de login (AJUSTA ESTA RUTA si tu login no está en la raíz)
    router.navigate(['/'], { replaceUrl: true });
    return false; // Importante: retorna false para cancelar la navegación actual a la ruta protegida
  }
  // Este guardia es sincrónico porque isAuthenticated es una señal computada sincrónica.
  // Si tu lógica de guardia necesitara ser asíncrona (ej. para verificar permisos específicos
  // que no están en el store), podrías retornar un Observable<boolean> o Promise<boolean>.

};
