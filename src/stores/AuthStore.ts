import { computed } from "@angular/core";
import { UserEntity } from "../app/domain/entities/UserEntity";
import { patchState, signalStore, withMethods, withState, withComputed, withHooks } from "@ngrx/signals";
import { jwtDecode } from 'jwt-decode';
// import { DecodedJWT } from "../app/domain/dtos/AuthResponse";


export type AuthState = {
  user: UserEntity | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
}

export const AuthStore = signalStore(
  { providedIn: 'root'},

  withState<AuthState>(initialState), // Define el estado inicial

  // Señal computada para verificar si el usuario está autenticado
  // Consideramos autenticado si tenemos token Y datos de usuario
  withComputed(({ user, token }) => ({
    isAuthenticated: computed(() => !!token() && !!user()),
  })),

  withMethods(
    (store) => ({
      // Métodos para actualizar el estado, llamados por AuthService

      setLoading(isLoading: boolean){
        patchState(store, { isLoading });
      },

      setError(error: string | null){
        patchState(store, { error, isLoading: false});
      },

      // Usado para cargar un token temporalmente (ej: desde localStorage al inicio)
      setToken(token: string | null) {
          patchState(store, { token });
          // NOTA: No limpiamos el usuario o isAuthenticated aquí.
          // El estado completo se gestiona con loginSuccess/loginFailure/logout.
      },

      // Usado al completar exitosamente el login o al restaurar la sesión
      loginSuccess(token: string, user: UserEntity){
        patchState(store, {
          token,
          user,
          isLoading: false,
          error: null,
        });
        console.log('AuthStore: loginSuccess - State updated.');
      },

      // Usado cuando el login falla o la sesión se invalida
      loginFailure(error: string) {
        patchState(store, {
          user: null,
          token: null, // Limpia token y usuario en caso de fallo
          isLoading: false,
          error,
        });
        console.log('AuthStore: loginFailure - State updated.');
      },

      // Usado al cerrar sesión
      logout() {
        patchState(store, {
          user: null,
          token: null,
          isLoading: false, // Asegura que la carga sea false
          error: null, // Limpia cualquier error
        });
        console.log('AuthStore: logout - State updated.');
      },
      // *** NUEVO MÉTODO ***
      // Método para actualizar solo el usuario y el estado de carga/error.
      // Útil después de obtener datos de usuario (ej: en checkSession o refreshToken)
      // cuando el token ya está establecido.
      setUserAndLoadingState(user: UserEntity | null, isLoading: boolean, error: string | null = null) {
         patchState(store, { user, isLoading, error });
         console.log('AuthStore: setUserAndLoadingState - State updated.');
      }
      // *** FIN NUEVO MÉTODO ***
    })
  )
);