import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../../../stores/AuthStore';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const authService = inject(AuthService);
  const apiUrl = environment.apiUrl; // Obtiene la URL base de la API desde el entorno

  // Obtiene el token actual de la señal 'token' del store
  const authToken = authStore.token();

  // Clona la petición SÓLO si hay un token Y la petición va dirigida a tu API de Laravel
  let authRequest = req;
  // Verifica que la URL de la petición comience con la URL base de tu API
  const isApiUrl = req.url.startsWith(apiUrl);

   if (authToken && isApiUrl) {
    // Si hay un token y la URL es de nuestra API, clona la petición y añade la cabecera Authorization
    authRequest = req.clone({
      setHeaders: { // setHeaders es el método recomendado para añadir/sobrescribir cabeceras
        Authorization: `Bearer ${authToken}` // Formato estándar para tokens JWT
      }
    });
    console.log('Interceptor: Cabecera Authorization añadida para:', authRequest.url);
  } else {
    // Si no hay token o la URL no es de nuestra API, pasa la petición original sin modificar
    console.log('Interceptor: No se añadió cabecera Authorization para:', req.url, ' (No token o no API URL)');
  }

  // Pasa la petición (original o clonada) al siguiente manejador
  // Pasa la petición (original o clonada) al siguiente manejador (probablemente el errorInterceptor)
  return next(authRequest).pipe(
    // Usa catchError para interceptar errores. Este catchError está ANTES del errorInterceptor
    // si lo configuras así en app.config.ts.
    catchError((error: HttpErrorResponse): Observable<any> => {
      // *** Lógica específica de Autenticación: Manejar 401 y 419 de la API ***
      if (isApiUrl && (error.status === 401 || error.status === 419)) {
        console.warn('AuthInterceptor: 401 or 419 response from API. Triggering logout.');
        // Si recibimos un 401/419 de nuestra API, asumimos que la sesión no es válida.
        // Llamamos al logout del servicio, que limpiará el store y localStorage y redirigirá.
        // Aseguramos que no se redirija si ya estamos en la página de login.
        // Asumimos que la ruta de login es la raíz '/'
        if (!router.url.includes('/')) {
             authService.logout(); // Llama al método logout del servicio
        } else {
            // Si ya estamos en la página de login, solo limpiamos el estado localmente
             (authService as any)['clearAuthStateFromLocalStorage'](); // Limpiar localStorage directamente
             authStore.logout(); // Limpia el store
             console.warn('AuthInterceptor: Already on login page, just clearing auth state locally.');
        }
        // Re-lanzar el error. Será capturado por el siguiente interceptor en la cadena (errorInterceptor)
        // para mostrar el toast de error.
        return throwError(() => error);
      }

      // Si no es un 401/419 específico de la API, simplemente re-lanzamos el error.
      // Será manejado por el siguiente interceptor (errorInterceptor) o por el código que hizo la petición.
      return throwError(() => error);
    })
  );

};
