import { computed } from "@angular/core";
import { UserEntity } from "../app/domain/entities/UserEntity";
import { patchState, signalStore, withMethods, withState, withComputed, withHooks } from "@ngrx/signals";
import { jwtDecode } from 'jwt-decode';
// import { DecodedJWT } from "../app/domain/dtos/AuthResponse";


type AuthState = {
  currentUser: UserEntity | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userPermissions: string[]; // <<< NUEVO: Array de nombres de permisos
};

const initialState: AuthState = {
  currentUser: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  userPermissions: [], // <<< VALOR INICIAL
};

export const AuthStore = signalStore(
  { providedIn: 'root'},

  withState<AuthState>(initialState), // Define el estado inicial

  // Señal computada para verificar si el usuario está autenticado
  // Consideramos autenticado si tenemos token Y datos de usuario
  withComputed(({ currentUser, token }) => ({
    isAuthenticated: computed(() => !!token() && !!currentUser()),
  })),

  withMethods((store) => ({
    setLoading(isLoading: boolean) {
      patchState(store, { isLoading });
    },
    setError(error: string | null) {
      patchState(store, { error });
    },
    setToken(token: string | null) {
      patchState(store, { token });
    },
    setUserAndLoadingState(user: UserEntity | null, isLoading: boolean, error: string | null) {
      const permissions = user?.permissions?.map(p => p.name) || [];
      patchState(store, {
        currentUser: user,
        isAuthenticated: !!user,
        isLoading: isLoading,
        error: error,
        userPermissions: permissions // <<< GUARDAR PERMISOS
      });
      if (user) {
        console.log('[AuthStore] User set. Permissions:', permissions);
      }
    },
    loginSuccess(token: string, user: UserEntity) {
      const permissions = user.permissions?.map(p => p.name) || [];
      patchState(store, {
        token,
        currentUser: user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        userPermissions: permissions, // <<< GUARDAR PERMISOS
      });
      console.log('[AuthStore] Login successful. Permissions stored:', permissions);
    },
    loginFailure(error: string) {
      patchState(store, {
        token: null,
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error,
        userPermissions: [], // <<< LIMPIAR PERMISOS
      });
    },
    logout() {
      patchState(store, {
        currentUser: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        userPermissions: [], // <<< LIMPIAR PERMISOS
      });
      console.log('[AuthStore] Logged out, permissions cleared.');
    },
    // >>> NUEVO MÉTODO PARA VERIFICAR PERMISOS <<<
    hasPermission(requiredPermission: string | string[]): boolean {
      if (!store.isAuthenticated()) { // Accede a la signal isAuthenticated del store
        return false;
      }
      const currentUserPermissions = store.userPermissions(); // Accede a la signal userPermissions

      if (Array.isArray(requiredPermission)) {
        // Si se requiere un array de permisos, el usuario debe tener TODOS ellos (lógica AND)
        return requiredPermission.every(rp => currentUserPermissions.includes(rp));
        // Si quisieras lógica OR (al menos uno):
        // return requiredPermission.some(rp => currentUserPermissions.includes(rp));
      } else {
        return currentUserPermissions.includes(requiredPermission);
      }
    },
    // >>> NUEVO MÉTODO PARA OBTENER TODOS LOS PERMISOS DEL USUARIO <<<
    // (Esto ya lo hace userPermissions(), pero un getter explícito puede ser útil)
    // getUserPermissions(): string[] {
    //   return store.userPermissions();
    // }
  }))
);