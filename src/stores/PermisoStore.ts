import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { PermissionEntity } from '../app/domain/entities/PermissionEntity'; // Ajusta la ruta

import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PermisosService } from '../app/core/services/permisos.service';

type PermissionState = {
  permissions: PermissionEntity[];
  isLoading: boolean;
};

const initialState: PermissionState = {
  permissions: [],
  isLoading: false,
};

export const PermissionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store,
    permissionService = inject(PermisosService),
    messageService = inject(MessageService)
  ) => ({

    // Método 'rxMethod' para cargar todos los permisos
    loadAllPermissions: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })), // Inicia la carga
        switchMap(() => {
          return permissionService.getAllPermissions().pipe(
            tap({
              next: (permissions) => {
                patchState(store, { permissions, isLoading: false }); // Éxito: guarda y finaliza carga
                console.log('[PermissionStore] Permisos cargados:', permissions);
              },
              error: (error) => {
                console.error('[PermissionStore] Error al cargar permisos:', error);
                patchState(store, { isLoading: false }); // Finaliza carga con error
                messageService.add({
                    severity: 'error', summary: 'Error',
                    detail: 'No se pudieron cargar los permisos disponibles.'
                });
              },
            })
          );
        })
      )
    ),

    // Método simple para llamar a loadAllPermissions si es necesario
    ensurePermissionsLoaded() {
        // Carga solo si aún no hay permisos cargados para evitar llamadas redundantes
        if (store.permissions().length === 0 && !store.isLoading()) {
            this.loadAllPermissions();
        }
    }

  }))
);