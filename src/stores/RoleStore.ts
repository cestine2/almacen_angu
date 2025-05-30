import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { RoleEntity } from '../app/domain/entities/RoleEntity';
import { RolesService } from '../app/core/services/roles.service';
import { CreateRoleData } from '../app/domain/dtos/PermisosData/CreateRoleData';
import { UpdateRoleData } from '../app/domain/dtos/PermisosData/UpdateRoleData';
import { AssignPermissionsData } from '../app/domain/dtos/PermisosData/AssignPermissionsData';
import { MessageService } from 'primeng/api';
// rxMethod y operadores específicos de RxJS para rxMethod ya no son necesarios

type RoleState = {
  roles: RoleEntity[];
  // isLoading: boolean; // Eliminado
  // isSaving: boolean;  // Eliminado
  isOpenCreate: boolean;
  isOpenEdit: boolean;
  isOpenAssignPermissions: boolean;
  selectedRole: RoleEntity | null;
  roleIdForAssignment: number | null;
};

const initialState: RoleState = {
  roles: [],
  // isLoading: false, // Eliminado
  // isSaving: false,  // Eliminado
  isOpenCreate: false,
  isOpenEdit: false,
  isOpenAssignPermissions: false,
  selectedRole: null,
  roleIdForAssignment: null,
};

export const RoleStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store,
    rolesService = inject(RolesService),
    messageService = inject(MessageService)
  ) => {

    const closeModalCreate = () => patchState(store, { isOpenCreate: false });
    const closeModalEdit = () => patchState(store, { isOpenEdit: false, selectedRole: null });
    const closeModalAssignPermissions = () => patchState(store, { isOpenAssignPermissions: false, selectedRole: null, roleIdForAssignment: null });

    const loadAllRoles = () => {
      // patchState(store, { isLoading: true }); // Eliminado
      rolesService.getAllRoles().subscribe({
        next: (roles) => patchState(store, { roles /*, isLoading: false */ }), // isLoading eliminado
        error: (err) => {
          console.error('[RoleStore] Error loading roles:', err);
          // patchState(store, { isLoading: false }); // Eliminado
          messageService.add({ severity: 'error', summary: 'Error de Carga', detail: 'No se pudieron cargar los roles.' });
        }
      });
    };

    const loadRoleById = (roleId: number) => {
      if (typeof roleId !== 'number' || isNaN(roleId)) {
        console.error("[RoleStore] loadRoleById - ID de rol inválido:", roleId);
        patchState(store, { selectedRole: null /*, isLoading: false */ }); // isLoading eliminado
        return;
      }
      patchState(store, { selectedRole: null /*, isLoading: true */ }); // isLoading eliminado
      console.log(`[RoleStore] loadRoleById - Intentando cargar rol con ID: ${roleId}`);
      rolesService.getRoleById(roleId).subscribe({
        next: (role) => {
          let roleToStore: RoleEntity | null = null;
          if (role) {
            if ((role as any).data && typeof (role as any).data === 'object') {
              roleToStore = (role as any).data as RoleEntity;
            } else {
              roleToStore = role as RoleEntity;
            }
          }
          if (roleToStore) {
            console.log('[RoleStore] loadRoleById - Rol final para el store:', JSON.stringify(roleToStore));
            patchState(store, { selectedRole: roleToStore /*, isLoading: false */ }); // isLoading eliminado
          } else {
            console.warn(`[RoleStore] loadRoleById - Rol con ID ${roleId} no encontrado o respuesta inválida.`);
            patchState(store, { selectedRole: null /*, isLoading: false */ }); // isLoading eliminado
            messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el rol seleccionado.' });
          }
        },
        error: (err) => {
          console.error(`[RoleStore] Error en la suscripción de loadRoleById para ${roleId}:`, err);
          patchState(store, { selectedRole: null /*, isLoading: false */ }); // isLoading eliminado
        }
      });
    };

    const openModalCreate = () => patchState(store, { isOpenCreate: true, selectedRole: null, isOpenEdit: false, isOpenAssignPermissions: false });
    const openModalEdit = (role: RoleEntity) => patchState(store, { isOpenEdit: true, selectedRole: role, isOpenCreate: false, isOpenAssignPermissions: false });

    const openModalAssignPermissions = (roleFromTable: RoleEntity) => {
      patchState(store, {
        isOpenAssignPermissions: true,
        roleIdForAssignment: roleFromTable.id,
        selectedRole: null,
        isOpenCreate: false,
        isOpenEdit: false
      });
      if (roleFromTable.id && typeof roleFromTable.id === 'number') {
        loadRoleById(roleFromTable.id);
      } else {
        console.error("[RoleStore] openModalAssignPermissions: roleFromTable no tiene un ID válido.", roleFromTable);
        closeModalAssignPermissions();
      }
    };

    const doCreateInternal = (data: CreateRoleData) => {
      // patchState(store, { isSaving: true }); // Eliminado
      rolesService.createRole(data).subscribe({
        next: (newRole) => {
          // patchState(store, { isSaving: false }); // Eliminado
          if (newRole && newRole.name) {
            patchState(store, { isOpenCreate: false });
            messageService.add({ severity: 'success', summary: 'Éxito', detail: `Rol '${newRole.name}' creado.` });
            loadAllRoles();
          } else {
            console.error('[RoleStore] createRole: respuesta inválida del servicio.', newRole);
            messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el rol o la respuesta fue inesperada.' });
          }
        },
        error: (err) => {
          console.error('[RoleStore] Error creating role (HTTP):', err);
          // patchState(store, { isSaving: false }); // Eliminado
        }
      });
    };

    const doUpdateInternal = (args: { id: number; data: UpdateRoleData }) => {
      // patchState(store, { isSaving: true }); // Eliminado
      rolesService.updateRole(args.id, args.data).subscribe({
        next: (updatedRole) => {
          // patchState(store, { isSaving: false }); // Eliminado
          if (updatedRole && updatedRole.name) {
            patchState(store, { isOpenEdit: false, selectedRole: null });
            messageService.add({ severity: 'success', summary: 'Éxito', detail: `Rol '${updatedRole.name}' actualizado.` });
            loadAllRoles();
          } else {
            console.error('[RoleStore] updateRole: respuesta inválida del servicio.', updatedRole);
            messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el rol o la respuesta fue inesperada.' });
          }
        },
        error: (err) => {
          console.error('[RoleStore] Error updating role (HTTP):', err);
          // patchState(store, { isSaving: false }); // Eliminado
        }
      });
    };

    const doDeleteInternal = (id: number) => {
      // patchState(store, { isLoading: true }); // Eliminado (o isDeleting)
      rolesService.deleteRole(id).subscribe({
        next: (response) => {
          // patchState(store, { isLoading: false }); // Eliminado
          messageService.add({ severity: 'warn', summary: 'Eliminado', detail: response.message });
          loadAllRoles();
        },
        error: (err) => {
          console.error('[RoleStore] Error deleting role:', err);
          // patchState(store, { isLoading: false }); // Eliminado
          messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el rol.' });
        }
      });
    };

    const doAssignPermissionsInternal = (args: { roleId: number; data: AssignPermissionsData }) => {
      // patchState(store, { isSaving: true }); // Eliminado
      rolesService.assignPermissionsToRole(args.roleId, args.data).subscribe({
        next: (updatedRoleFromServer) => {
          // patchState(store, { isSaving: false }); // Eliminado
          if (updatedRoleFromServer && updatedRoleFromServer.name) {
            messageService.add({ severity: 'success', summary: 'Éxito', detail: `Permisos actualizados para el rol '${updatedRoleFromServer.name}'.` });
            patchState(store, {
              isOpenAssignPermissions: false,
              selectedRole: updatedRoleFromServer, // CLAVE: Actualiza selectedRole
              roleIdForAssignment: null
            });
            const currentRoles = [...store.roles()];
            const roleIndex = currentRoles.findIndex(r => r.id === updatedRoleFromServer.id);
            if (roleIndex > -1) {
              currentRoles[roleIndex] = updatedRoleFromServer;
              patchState(store, { roles: currentRoles });
            } else {
              loadAllRoles();
            }
          } else {
            console.error('[RoleStore] assignPermissions: respuesta inválida del servicio.', updatedRoleFromServer);
            messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron asignar los permisos (respuesta inesperada).' });
          }
        },
        error: (err) => {
          console.error('[RoleStore] Error assigning permissions (HTTP):', err);
          // patchState(store, { isSaving: false }); // Eliminado
        }
      });
    };

    return {
        openModalCreate, closeModalCreate,
        openModalEdit, closeModalEdit,
        openModalAssignPermissions, closeModalAssignPermissions,
        loadAllRoles, loadRoleById,
        doCreate: doCreateInternal,
        doUpdate: doUpdateInternal,
        doDelete: doDeleteInternal,
        doAssignPermissions: doAssignPermissionsInternal,
    };
  })
);
