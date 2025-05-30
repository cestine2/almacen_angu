import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { UserEntity } from '../app/domain/entities/UserEntity'; // Ajusta la ruta
import { UserService, CreateUserData, UpdateUserData } from '../app/core/services/user.service'; // Ajusta la ruta
import { UserListFilters } from '../app/domain/dtos/UserListFilters'; // Ajusta la ruta
import { PaginatedResponse } from '../app/domain/dtos/PaginatedResponse'; // Ajusta la ruta
import { MessageService } from 'primeng/api';

type UserState = {
  users: UserEntity[];
  isLoading: boolean;
  isSaving: boolean;
  currentPage: number;
  totalItems: number;
  perPage: number;
  filters: UserListFilters;
  isOpenCreate: boolean;
  isOpenEdit: boolean;
  isOpenDetalle: boolean;
  selectedUser: UserEntity | null;
};

const initialState: UserState = {
  users: [],
  isLoading: false,
  isSaving: false,
  currentPage: 1,
  totalItems: 0,
  perPage: 10,
  filters: { status: 'active', nombre: undefined }, // nombre como undefined para no enviar si está vacío
  isOpenCreate: false,
  isOpenEdit: false,
  isOpenDetalle: false,
  selectedUser: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store,
    userService = inject(UserService),
    messageService = inject(MessageService)
  ) => {

    // --- Métodos de Modales ---
    const openModalCreate = () => patchState(store, { isOpenCreate: true, selectedUser: null });
    const closeModalCreate = () => patchState(store, { isOpenCreate: false });
    const openModalEdit = (user: UserEntity) => patchState(store, { isOpenEdit: true, selectedUser: user });
    const closeModalEdit = () => patchState(store, { isOpenEdit: false, selectedUser: null });
    // const openModalDetalle = (user: UserEntity) => patchState(store, { isOpenDetalle: true, selectedUser: user });
    // const closeModalDetalle = () => patchState(store, { isOpenDetalle: false, selectedUser: null });

    // --- Carga de Datos ---
    const loadUsers = () => {
      patchState(store, { isLoading: true });
      userService.list({
        page: store.currentPage(),
        perPage: store.perPage(),
        filters: store.filters(),
      }).subscribe({
        next: (response: PaginatedResponse<UserEntity>) => {
          patchState(store, {
            users: response.data,
            totalItems: response.meta.total,
            currentPage: response.meta.current_page,
            perPage: response.meta.per_page,
            isLoading: false,
          });
        },
        error: (err) => {
          console.error('[UserStore] Error loading users:', err);
          patchState(store, { isLoading: false });
          messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios.' });
        }
      });
    };

    // --- Métodos para paginación y filtros ---
    const setPage = (page: number) => {
      if (store.currentPage() !== page) {
        patchState(store, { currentPage: page });
        loadUsers();
      }
    };
    const setPerPage = (perPage: number) => {
      if (store.perPage() !== perPage) {
        patchState(store, { perPage: perPage, currentPage: 1 });
        loadUsers();
      }
    };
    const setFilters = (newFilters: Partial<UserListFilters>) => {
      patchState(store, (currentState) => ({
        filters: { ...currentState.filters, ...newFilters },
        currentPage: 1
      }));
      loadUsers();
    };

    // --- Operaciones CRUD (Funciones internas) ---
    const doCreateInternal = (data: CreateUserData) => {
      patchState(store, { isSaving: true });
      userService.create(data).subscribe({
        next: (newUser) => {
          patchState(store, { isSaving: false, isOpenCreate: false });
          messageService.add({ severity: 'success', summary: 'Éxito', detail: `Usuario '${newUser.nombre}' creado.` });
          loadUsers();
        },
        error: (err) => {
          console.error('[UserStore] Error creating user:', err);
          patchState(store, { isSaving: false });
        }
      });
    };

    const doUpdateInternal = (args: { id: number; data: UpdateUserData }) => {
      patchState(store, { isSaving: true });
      userService.update(args.id, args.data).subscribe({
        next: (updatedUser) => {
          patchState(store, { isSaving: false, isOpenEdit: false, selectedUser: null });
          messageService.add({ severity: 'success', summary: 'Éxito', detail: `Usuario '${updatedUser.nombre}' actualizado.` });
          loadUsers();
        },
        error: (err) => {
          console.error('[UserStore] Error updating user:', err);
          patchState(store, { isSaving: false });
        }
      });
    };

    const doDeleteInternal = (id: number) => {
      patchState(store, { isLoading: true });
      userService.delete(id).subscribe({
        next: (response) => {
          patchState(store, { isLoading: false });
          messageService.add({ severity: 'warn', summary: 'Desactivado', detail: response.message });
          loadUsers();
        },
        error: (err) => {
          console.error('[UserStore] Error deleting user:', err);
          patchState(store, { isLoading: false });
        }
      });
    };

    const doRestoreInternal = (id: number) => {
      patchState(store, { isLoading: true });
      userService.restore(id).subscribe({
        next: (response) => {
          patchState(store, { isLoading: false });
          messageService.add({ severity: 'success', summary: 'Restaurado', detail: response.message });
          loadUsers();
        },
        error: (err) => {
          console.error('[UserStore] Error restoring user:', err);
          patchState(store, { isLoading: false });
        }
      });
    };

    // Objeto de métodos que se expondrán
    return {
        openModalCreate, closeModalCreate,
        openModalEdit, closeModalEdit,
        // openModalDetalle, closeModalDetalle,
        loadUsers,
        setPage, setPerPage,
        setFilters: (filters: Partial<UserListFilters>) => setFilters(filters), // Acepta Partial aquí
        doCreate: doCreateInternal, // Exponer la función interna directamente
        doUpdate: doUpdateInternal, // Exponer la función interna que espera un objeto
        doDelete: doDeleteInternal, // Exponer la función interna
        doRestore: doRestoreInternal // Exponer la función interna
    };
  })
);
