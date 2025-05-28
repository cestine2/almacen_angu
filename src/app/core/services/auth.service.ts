import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserEntity } from '../../domain/entities/UserEntity';
import { AuthStore } from '../../../stores/AuthStore';
import { AuthResponse } from '../../domain/dtos/AuthResponse';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authStore = inject(AuthStore)
  http = inject(HttpClient)
  router = inject(Router)
   
  private readonly TOKEN_STORAGE_KEY = 'authToken';
  private readonly USER_STORAGE_KEY = 'authUser'; // Opcional: si quieres guardar el user en localStorage

  constructor() {
    // La lógica de carga y validación al inicio ahora se gestiona con checkSession()
    // llamada por el APP_INITIALIZER.
  }
    

  /**
   * Intenta cargar el token de localStorage y validar la sesión con el backend.
   * Se llama al iniciar la aplicación (típicamente por un APP_INITIALIZER).
   * @returns Observable<boolean> Emite true si la sesión es válida, false si no.
   */
  checkSession(): Observable<boolean> {
    const token = localStorage.getItem(this.TOKEN_STORAGE_KEY);

    if (!token) {
      // No hay token almacenado, no hay sesión que restaurar.
      console.log('checkSession: No token found in localStorage.');
      this.authStore.logout(); // Asegura que el store esté limpio
      return of(false);
    }

    // Si hay un token en localStorage, lo cargamos temporalmente en el store.
    // Esto permite que el authInterceptor adjunte la cabecera Authorization
    // a la siguiente llamada a /auth/me.
    this.authStore.setToken(token);
    console.log('checkSession: Token found in localStorage. Attempting validation via /auth/me...');

    // Intenta obtener los datos del usuario para validar si el token es válido en el backend.
    // El interceptor añadirá la cabecera Authorization porque el token está en el store.
    // Asegúrate de que tu UserEntity coincida con la respuesta del backend para /auth/me.
    return this.http.get<UserEntity>(`${environment.apiUrl}/auth/me`).pipe(
      tap(userResponse => {
        // Si la llamada a /me es exitosa, el token es válido y obtuvimos los datos del usuario.
        // Actualizamos el store con el token (ya cargado) y los datos del usuario validados.
        this.authStore.loginSuccess(token, userResponse);
        // Opcional: Actualizar localStorage con los datos de usuario más recientes
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(userResponse));
        console.log('checkSession: /auth/me successful. Session restored.');
      }),
      map(() => true), // Si tap tiene éxito, emitimos true (sesión válida)
      catchError((error: HttpErrorResponse) => {
        console.error('checkSession: /auth/me failed. Token invalid?', error);
        // Si /me falla (ej: 401), el token no es válido.
        // Limpiamos todo el estado local.
        this.clearAuthStateFromLocalStorage();
        this.authStore.logout(); // Limpiar el store reactivo
        // No navegamos aquí; el APP_INITIALIZER no debe redirigir, solo indicar el estado.
        // El authGuard se encargará de la redirección si checkSession devuelve false.
        return of(false); // Emitir false (sesión inválida)
      })
    );
  }


  /**
   * Intenta loguear al usuario.
   * @param credentials Credenciales del usuario.
   * @returns Observable<UserEntity> Emite el usuario autenticado si es exitoso.
   */
  login(credentials: {email: string, password: string}): Observable<UserEntity>{
    this.authStore.setLoading(true); // Inicia carga
    this.authStore.setError(null); // Limpia errores previos

    // Paso 1: Llamar al endpoint de login de Laravel para obtener el token
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        const token = response.access_token;
        if (!token) {
          // Si el login fue 200 pero no hay token, es un error inesperado.
          throw new Error('Login successful but no token received from backend.');
        }
        localStorage.setItem(this.TOKEN_STORAGE_KEY, token); // Guarda token en localStorage
        this.authStore.setToken(token); // Actualiza el store temporalmente
        console.log('Login Step 1: Token obtained and saved locally.');
      }),
      // Paso 2: Usar switchMap para encadenar la llamada a /me con el token recién obtenido
      switchMap(() => {
        console.log('Login Step 2: Calling /auth/me to get user data.');
        // El interceptor añadirá la cabecera Authorization porque el token está en el store/localStorage.
        // Asegúrate de que este GET no envíe un cuerpo ({}) a menos que tu backend lo necesite (inusual para GET).
        return this.http.get<UserEntity>(`${environment.apiUrl}/auth/me`); // <-- Llamada GET Corregida
      }),
      tap(userResponse => {
        // Si la segunda llamada (/me) es exitosa, la autenticación es completa.
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(userResponse)); // Guarda usuario en localStorage
        this.authStore.loginSuccess(this.authStore.token()!, userResponse); // Actualiza el store con token y usuario
        console.log('Login Step 2: User data obtained and saved. Login complete.');

        // Redirige al dashboard después del login exitoso completo
        // AJUSTA ESTA RUTA a la ruta de tu dashboard principal
        this.router.navigate(['/system/dashboard'], { replaceUrl: true });
      }),
      catchError((error: HttpErrorResponse | Error) => { // Captura errores de cualquiera de las dos llamadas o errores lanzados
        console.error('Login process failed:', error);
        // Limpiar estado local en caso de cualquier fallo en el proceso de login
        this.clearAuthStateFromLocalStorage();

        let errorMessage = 'Login failed. Please try again.'; // Mensaje por defecto más amigable

        if (error instanceof HttpErrorResponse) {
          // Manejar errores HTTP específicos
          if (error.status === 401) {
            // Error 401 del /login endpoint (credenciales inválidas)
            errorMessage = 'Credenciales inválidas.';
          } else if (error.error && typeof error.error === 'object' && error.error.message) {
            // Intentar obtener el mensaje de error del cuerpo de la respuesta del backend
            errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
               // Mensaje de error si el cuerpo de la respuesta es solo un string
               errorMessage = error.error;
          }
           else {
             // Otros errores HTTP o de red sin un cuerpo de error específico
             errorMessage = `Error de conexión: ${error.statusText || 'Desconocido'}`;
          }
        } else if (error instanceof Error) {
             // Manejar errores de JavaScript lanzados manualmente
             errorMessage = error.message;
        }


        this.authStore.loginFailure(errorMessage); // Limpiar store y setear el error
        // Re-lanzar un observable de error con el mensaje procesado para que el componente lo maneje
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Cierra la sesión del usuario.
   * Llama al backend para invalidar el token y limpia el estado local.
   */
  logout(): void {
    const currentToken = this.authStore.token();

    // Llama al backend para invalidar el token si hay uno.
    // No bloqueamos la limpieza local si la llamada al backend falla.
    if (currentToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        next: () => console.log('Logged out on backend successfully.'),
        error: (err) => console.error('Error calling backend logout:', err)
      });
    }

    // Siempre limpiar el estado localmente y redirigir
    this.clearAuthStateFromLocalStorage(); // Limpia localStorage
    this.authStore.logout(); // Limpia el store reactivo
    console.log('Auth state cleared in store and local storage.');

    // Redirige a la página de login (AJUSTA ESTA RUTA si tu login no está en la raíz)
    this.router.navigate(['/'], { replaceUrl: true });
  }

  /**
   * Refresca el token JWT.
   * @returns Observable<any> Emite la respuesta del refresh si es exitoso.
   */
  refreshToken(): Observable<any> {
       const currentToken = this.authStore.token();
       if (!currentToken) {
           console.warn('refreshToken: No token in store, cannot refresh.');
           this.logout(); // Asegura limpieza si no hay token para refrescar
           // Retorna un observable de error para que el llamador sepa que falló.
           return throwError(() => new Error('No token available to refresh.'));
       }

      this.authStore.setLoading(true); // Opcional: mostrar carga durante el refresh

      // Llama al backend para obtener un nuevo token
      return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {}).pipe(
        tap(response => {
          const newToken = response.access_token;
          if (!newToken) {
              throw new Error('Refresh successful but no new token received.');
          }
          // Guarda el nuevo token en localStorage y actualiza el store
          localStorage.setItem(this.TOKEN_STORAGE_KEY, newToken);
          this.authStore.setToken(newToken);
          console.log('Token refreshed successfully.');

          // Opcional pero recomendado: Llamar a /auth/me de nuevo para obtener datos de usuario actualizados
          this.getAuthenticatedUser().subscribe({ // Reutiliza el método para obtener usuario
                 next: userResponse => {
                     localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(userResponse)); // Actualiza usuario en localStorage
                     // Solo parcheamos el estado del store con el usuario actualizado
                     this.authStore.setUserAndLoadingState(userResponse, false, null);
                     console.log('User data updated in store after token refresh.');
                 },
                 error: err => {
                     console.error('Failed to fetch user after token refresh:', err);
                     // Si falla obtener el usuario después del refresh, la sesión está rota.
                     this.logout(); // Forzar logout completo
                 }
             });
        }),
        catchError((error: HttpErrorResponse | Error) => {
          console.error('Token refresh failed:', error);
          // Si falla el refresh (ej: token expirado o inválido), la sesión termina.
          this.logout(); // Limpia todo y redirige

             let errorMessage = 'Session expired. Please login again.';
              if (error instanceof HttpErrorResponse && error.error?.message) {
                 errorMessage = error.error.message;
             } else if (error instanceof Error) {
                 errorMessage = error.message;
             }
             this.authStore.loginFailure(errorMessage); // Actualiza store con error

          return throwError(() => new Error(errorMessage)); // Re-lanzar el error
        })
      );
  }

   /**
    * Obtiene los datos del usuario autenticado del backend.
    * Asume que el token ya está en el store para que el interceptor lo adjunte.
    * @returns Observable<UserEntity> Emite los datos del usuario.
    */
   getAuthenticatedUser(): Observable<UserEntity> {
       // Usa GET para el endpoint /auth/me
       return this.http.get<UserEntity>(`${environment.apiUrl}/auth/me`).pipe(
           catchError((error: HttpErrorResponse) => {
                console.error('API call to /auth/me failed:', error);
                // Si /me falla con 401/419, el interceptor ya llama a logout.
                // Si falla con otro error, lo re-lanzamos para manejo adicional si es necesario.
                return throwError(() => error);
           })
       );
   }

  /**
   * Método interno para limpiar localStorage (token y usuario).
   */
  private clearAuthStateFromLocalStorage(): void {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    localStorage.removeItem(this.USER_STORAGE_KEY); // Limpia también el usuario si lo guardas
    console.log('Local storage auth items cleared.');
  }
}



