import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { ProveedorListFilters } from "../app/domain/dtos/ProveedorListFilters";
import { ProveedorEntity } from "../app/domain/entities/ProveedorEntity";
import { inject } from "@angular/core";
import { ProveedorService } from "../app/core/services/proveedor.service";
import { MessageService } from "primeng/api";
import { PaginatedResponse } from "../app/domain/dtos/PaginatedResponse";

type ProveedorState = {
  isOpenCreate: boolean;
  isOpenEdit: boolean;
  // No isOpenFilters
  // No loading

  proveedores: ProveedorEntity[];
  proveedorEdit: ProveedorEntity | null;

  // Paginación y Filtros
  currentPage: number;
  totalItems: number;
  perPage: number;
  filters: ProveedorListFilters;
};

const initialState: ProveedorState = {
  isOpenCreate: false,
  isOpenEdit: false,
  proveedores: [],
  proveedorEdit: null,
  currentPage: 1,
  totalItems: 0,
  perPage: 10, // Default
  filters: {
    status: 'active', // Default filter
    nombre: undefined,
  },
};

export const ProveedorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store,
    proveedorService = inject(ProveedorService),
    messageService = inject(MessageService)
  ) => {

    const openModalCreate = () => patchState(store, { isOpenCreate: true, proveedorEdit: null });
    const closeModalCreate = () => patchState(store, { isOpenCreate: false });
    const openModalEdit = (proveedor: ProveedorEntity) => patchState(store, { isOpenEdit: true, proveedorEdit: proveedor });
    const closeModalEdit = () => patchState(store, { isOpenEdit: false, proveedorEdit: null });

    const doList = () => {
      const listOptions = {
        page: store.currentPage(),
        perPage: store.perPage(),
        filters: store.filters(),
      };
      console.log('ProveedorStore: Fetching list with options:', listOptions);

      proveedorService.list(listOptions).subscribe({
        next: (response: PaginatedResponse<ProveedorEntity>) => {
          patchState(store, {
            proveedores: response.data,
            totalItems: response.meta.total,
            currentPage: response.meta.current_page,
            perPage: response.meta.per_page,
          });
        },
        error: (error) => {
          console.error('ProveedorStore: Error loading proveedores:', error);
          // El interceptor de errores global maneja el toast
        }
      });
    };

    const setPage = (page: number) => {
      if (store.currentPage() !== page) {
        patchState(store, { currentPage: page });
        methods.doList();
      }
    };

    const setPerPage = (perPage: number) => {
      if (store.perPage() !== perPage) {
        patchState(store, { perPage: perPage, currentPage: 1 });
        methods.doList();
      }
    };

    const updateFilters = (newFilters: Partial<ProveedorListFilters>) => {
      patchState(store, (currentState) => ({
        filters: { ...currentState.filters, ...newFilters },
        currentPage: 1,
      }));
      methods.doList();
    };

    const doCreate = (proveedorData: Omit<ProveedorEntity, 'id' | 'created_at' | 'updated_at'>) => {
      proveedorService.create(proveedorData).subscribe({
        next: (response) => {
          messageService.add({ severity: 'success', summary: 'Éxito', detail: `Proveedor '${response.nombre}' creado.` });
          closeModalCreate();
          methods.doList();
        },
        error: (error) => {
          console.error('ProveedorStore: Error creating proveedor:', error);
          // El interceptor maneja el toast
        }
      });
    };

    const doUpdate = (id: number, proveedorData: Partial<Omit<ProveedorEntity, 'id'>>) => {
      proveedorService.update(id, proveedorData).subscribe({
        next: (response) => {
          messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Proveedor '${response.nombre}' actualizado.` });
          closeModalEdit();
          methods.doList();
        },
        error: (error) => {
          console.error('ProveedorStore: Error updating proveedor:', error);
        }
      });
    };

    const doDelete = (id: number) => {
      proveedorService.delete(id).subscribe({
        next: (response) => {
          messageService.add({ severity: 'warn', summary: 'Desactivado', detail: response.message || 'Proveedor desactivado.' });
          methods.doList();
        },
        error: (error) => {
          console.error('ProveedorStore: Error deleting proveedor:', error);
        }
      });
    };

    const doRestore = (id: number) => {
      proveedorService.restore(id).subscribe({
        next: (response) => {
          messageService.add({ severity: 'success', summary: 'Restaurado', detail: response.message || 'Proveedor restaurado.' });
          methods.doList();
        },
        error: (error) => {
          console.error('ProveedorStore: Error restoring proveedor:', error);
        }
      });
    };

    const methods = {
      openModalCreate, closeModalCreate,
      openModalEdit, closeModalEdit,
      setPage, setPerPage, updateFilters,
      doList, doCreate, doUpdate, doDelete, doRestore
    };
    return methods;
  })
);