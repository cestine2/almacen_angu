import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserEntity } from '../../domain/entities/UserEntity';
import { AuthStore } from '../../../stores/AuthStore';
import { AuthResponse } from '../../domain/dtos/AuthResponse';     // Para la respuesta de /login
        // <<< DTO para /auth/me
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { MeResponse } from '../../domain/dtos/MeResponse/MeResponse';
// PermissionEntity no es estrictamente necesario importar aquí si solo pasamos los nombres,
// pero MeResponse sí lo usa.

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStore = inject(AuthStore);
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_STORAGE_KEY = 'authToken';
  private readonly USER_STORAGE_KEY = 'authUser'; // Para el objeto UserEntity plano

  constructor() {}

  checkSession(): Observable<boolean> {
    const token = localStorage.getItem(this.TOKEN_STORAGE_KEY);
    if (!token) {
      console.log('[AuthService] checkSession: No token found.');
      this.authStore.logout(); // Asegura que el store esté limpio
      return of(false);
    }
    this.authStore.setToken(token); // Establece el token para que el interceptor lo use
    console.log('[AuthService] checkSession: Token found. Validating via /auth/me...');

    // Esperar MeResponse del backend
    return this.http.get<MeResponse>(`${environment.apiUrl}/auth/me`).pipe(
      tap(meResponse => { // meResponse es ahora de tipo MeResponse
        console.log('[AuthService] checkSession - /auth/me response:', meResponse);
        if (meResponse && meResponse.data) {
          const user: UserEntity = meResponse.data; // <<< Extraer el UserEntity plano de meResponse.data
          const permissionNames: string[] = meResponse.permissions?.map(p => p.name) || []; // <<< Extraer nombres de permisos

          // Pasa el UserEntity plano y los nombres de los permisos al store
          // Asumimos que loginSuccess en AuthStore espera (token, user, permissionNames)
          this.authStore.loginSuccess(token, user, permissionNames);
          localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user)); // Guarda UserEntity plano
          console.log('[AuthService] checkSession: Session restored. User:', user, 'Permissions:', permissionNames);
        } else {
          console.error('[AuthService] checkSession: Invalid response structure from /auth/me. Response:', meResponse);
          throw new Error('Invalid response structure from /auth/me'); // Lanzar error para el catchError
        }
      }),
      map(() => true), // Si tap tiene éxito, la sesión es válida
      catchError((error: HttpErrorResponse | Error) => { // Captura errores HTTP o errores lanzados en tap/map
        console.error('[AuthService] checkSession: /auth/me failed or processing error.', error);
        this.clearAuthStateFromLocalStorage();
        this.authStore.logout();
        return of(false); // Sesión inválida
      })
    );
  }

  login(credentials: {email: string, password: string}): Observable<UserEntity>{
    this.authStore.setLoading(true);
    this.authStore.setError(null);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      switchMap(authResp => { // authResp es AuthResponse
        const token = authResp.access_token;
        if (!token) throw new Error('Login successful but no token received.');
        localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
        this.authStore.setToken(token);
        console.log('[AuthService] Login Step 1: Token obtained. Calling /auth/me...');
        return this.http.get<MeResponse>(`${environment.apiUrl}/auth/me`); // <<< Esperar MeResponse
      }),
      map(meResponse => { // meResponse es de tipo MeResponse
        console.log('[AuthService] Login - /auth/me response:', meResponse);
        if (meResponse && meResponse.data) {
          const user: UserEntity = meResponse.data; // UserEntity plano
          const permissionNames: string[] = meResponse.permissions?.map(p => p.name) || [];
          const token = this.authStore.token();
          if (!token) {
            // Esto es muy improbable si el primer paso tuvo éxito, pero es una guarda
            console.error('[AuthService] Login: Token became null before loginSuccess.');
            throw new Error('Token missing unexpectedly during login process.');
          }
          return { token, user, permissionNames }; // Objeto con datos planos para el siguiente tap
        } else {
          console.error('[AuthService] Login: Invalid response structure from /auth/me.', meResponse);
          throw new Error('Invalid response structure from /auth/me during login.');
        }
      }),
      tap(loginData => { // loginData es { token, user: UserEntity, permissionNames: string[] }
        this.authStore.loginSuccess(loginData.token, loginData.user, loginData.permissionNames); // Pasa user plano y nombres de permisos
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(loginData.user)); // Guarda UserEntity plano
        console.log('[AuthService] Login Step 2: User data obtained and saved. Login complete.');
        this.router.navigate(['/system/dashboard'], { replaceUrl: true });
      }),
      map(loginData => loginData.user), // El Observable<UserEntity> debe emitir UserEntity
      catchError((error: HttpErrorResponse | Error) => {
        console.error('[AuthService] Login process failed:', error);
        this.clearAuthStateFromLocalStorage();
        let errorMessage = 'Fallo el inicio de sesión. Inténtelo de nuevo.'; // Mensaje por defecto más amigable
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) { // Específico para credenciales inválidas desde /auth/login
            errorMessage = error.error?.message || 'Credenciales inválidas.';
          } else if (error.error?.message) { // Otros errores HTTP con mensaje del backend
            errorMessage = error.error.message;
          } else if (typeof error.error === 'string' && error.error.length > 0) {
            errorMessage = error.error;
          } else { // Errores de red u otros HTTP sin cuerpo de error específico
            errorMessage = `Error de conexión: ${error.statusText || 'Desconocido'} (Código: ${error.status})`;
          }
        } else if (error instanceof Error) { // Errores de JavaScript (ej. throw new Error(...))
          errorMessage = error.message;
        }
        this.authStore.loginFailure(errorMessage);
        return throwError(() => new Error(errorMessage)); // Relanza para que el componente de login pueda reaccionar
      })
    );
  }

  logout(): void {
    const currentToken = this.authStore.token();
    if (currentToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        next: () => console.log('[AuthService] Logged out on backend successfully.'),
        error: (err) => console.error('[AuthService] Error calling backend logout:', err) // Continúa con el logout local incluso si esto falla
      });
    }
    this.clearAuthStateFromLocalStorage();
    this.authStore.logout(); // Limpia el estado en el store
    console.log('[AuthService] Auth state cleared.');
    this.router.navigate(['/'], { replaceUrl: true }); // Ajusta la ruta de login si es diferente
  }

  refreshToken(): Observable<UserEntity> {
    const currentToken = this.authStore.token();
    if (!currentToken) {
        console.warn('[AuthService] refreshToken: No token in store, cannot refresh.');
        this.logout(); // Si no hay token, no hay nada que refrescar, logout completo.
        return throwError(() => new Error('No token available to refresh.'));
    }
    // this.authStore.setLoading(true); // No manejamos isLoading en AuthStore según tu última indicación

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {}).pipe(
        tap(response => {
            const newToken = response.access_token;
            if (!newToken) throw new Error('Refresh successful but no new token received.');
            localStorage.setItem(this.TOKEN_STORAGE_KEY, newToken);
            this.authStore.setToken(newToken);
            console.log('[AuthService] Token refreshed successfully.');
        }),
        switchMap(() => this.http.get<MeResponse>(`${environment.apiUrl}/auth/me`)),
        map(meResponse => {
            if (meResponse && meResponse.data) {
                const user = meResponse.data;
                const permissionNames = meResponse.permissions?.map(p => p.name) || [];
                localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
                // Asumimos que AuthStore tiene un método para actualizar usuario y permisos sin cambiar el token necesariamente
                // o que loginSuccess puede ser llamado de nuevo si setToken ya actualizó el token.
                // Para simplicidad, si loginSuccess espera el token, lo pasamos.
                const token = this.authStore.token(); // Debería ser el nuevo token
                if(token) this.authStore.loginSuccess(token, user, permissionNames);
                else throw new Error("Token missing after refresh before updating user data.");

                console.log('[AuthService] User data updated in store after token refresh.');
                return user; // Devuelve el UserEntity plano
            } else {
                throw new Error('Invalid user data after token refresh.');
            }
        }),
        catchError((error) => {
            console.error('[AuthService] Token refresh failed:', error);
            this.logout();
            let errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión de nuevo.';
            if (error instanceof HttpErrorResponse && error.error?.message) { errorMessage = error.error.message;}
            else if (error instanceof Error) {errorMessage = error.message;}
            this.authStore.loginFailure(errorMessage);
            return throwError(() => new Error(errorMessage));
        })
    );
  }

  private clearAuthStateFromLocalStorage(): void {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    localStorage.removeItem(this.USER_STORAGE_KEY);
    console.log('[AuthService] Local storage auth items cleared.');
  }
}
