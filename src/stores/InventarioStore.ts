import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { MessageService } from "primeng/api";

import { InventarioEntity } from "../app/domain/entities/InventarioEntity"; // Ajusta ruta
import { InventarioService, CreateInventarioData, UpdateInventarioData } from "../app/core/services/inventario.service"; // Ajusta ruta
import { InventarioListFilters } from "../app/domain/dtos/InventarioListFilters"; // Ajusta ruta
import { PaginatedResponse } from "../app/domain/dtos/PaginatedResponse"; // Ajusta ruta

// Para los dropdowns en los filtros o formularios, si este store los va a manejar directamente.
// Es más común que los componentes de filtro/formulario inyecten los stores específicos
// (MaterialStore, ProductStore, SucursalStore).
// Por ahora, no los incluimos aquí.

type InventarioState = {
  isOpenRegisterStock: boolean; // Para el modal de creación/registro
  isOpenEditStock: boolean;     // Para el modal de edición
  isOpenFilters: boolean;       // Para el popover de filtros

  inventarios: InventarioEntity[];
  inventarioEdit: InventarioEntity | null;

  // Paginación y Filtros
  currentPage: number;
  totalItems: number;
  perPage: number;
  filters: InventarioListFilters;
};

const initialState: InventarioState = {
  isOpenRegisterStock: false,
  isOpenEditStock: false,
  isOpenFilters: false,
  inventarios: [],
  inventarioEdit: null,
  currentPage: 1,
  totalItems: 0,
  perPage: 20, // El default del InventarioController en backend es 20
  filters: { // Filtros iniciales por defecto
    status: 'active', // Muestra solo activos por defecto
    tipo: null,       // Sin filtro de tipo por defecto
    material_id: null,
    producto_id: null,
    sucursal_id: null,
  },
};

export const InventarioStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store,
    inventarioService = inject(InventarioService),
    messageService = inject(MessageService)
  ) => {

    // --- MÉTODOS DE MODALES/POPOVER ---
    const openModalRegisterStock = () => patchState(store, { isOpenRegisterStock: true, inventarioEdit: null });
    const closeModalRegisterStock = () => patchState(store, { isOpenRegisterStock: false });

    const openModalEditStock = (inventario: InventarioEntity) => patchState(store, { isOpenEditStock: true, inventarioEdit: inventario });
    const closeModalEditStock = () => patchState(store, { isOpenEditStock: false, inventarioEdit: null });

    const openFiltersPopover = () => patchState(store, { isOpenFilters: true });
    const closeFiltersPopover = () => patchState(store, { isOpenFilters: false });

    // --- OPERACIÓN PRINCIPAL DE LISTADO ---
    const doList = () => {
      const listOptions = {
        page: store.currentPage(),
        perPage: store.perPage(),
        filters: store.filters(),
      };
      console.log('InventarioStore: Fetching list with options:', listOptions);

      inventarioService.list(listOptions).subscribe({
        next: (response: PaginatedResponse<InventarioEntity>) => {
          patchState(store, {
            inventarios: response.data,
            totalItems: response.meta.total,
            currentPage: response.meta.current_page,
            perPage: response.meta.per_page,
          });
        },
        error: (error) => {
          console.error('InventarioStore: Error loading inventarios:', error);
          // El interceptor de errores global maneja el toast
        }
      });
    };

    // --- PAGINACIÓN Y FILTROS ---
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

    const updateFilters = (newFilters: Partial<InventarioListFilters>) => {
      patchState(store, (currentState) => ({
        filters: { ...currentState.filters, ...newFilters },
        currentPage: 1,
      }));
      methods.doList();
    };

    // --- OPERACIONES CRUD ---
    // const doRegisterStock = (data: CreateInventarioData) => {
    //   inventarioService.create(data).subscribe({
    //     next: (response) => {
    //       messageService.add({ severity: 'success', summary: 'Éxito', detail: `Stock para '${response.item?.nombre || (response.tipo === 'Material' ? 'Material ID ' + response.material_id : 'Producto ID ' + response.producto_id) }' registrado/actualizado.` });
    //       closeModalRegisterStock();
    //       methods.doList();
    //     },
    //     error: (error) => {
    //       console.error('InventarioStore: Error registering stock:', error);
    //       // El interceptor maneja el toast, pero podrías querer un mensaje específico
    //       // si el error es por InvalidArgumentException del backend.
    //       // El interceptor ya maneja el 422 (Unprocessable Entity) que devuelve el controller en ese caso.
    //     }
    //   });
    // };

    // const doUpdateStock = (id: number, data: UpdateInventarioData) => {
    //   inventarioService.update(id, data).subscribe({
    //     next: (response) => {
    //       messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Stock para '${response.item?.nombre || 'Ítem'}' actualizado.` });
    //       closeModalEditStock();
    //       methods.doList();
    //     },
    //     error: (error) => {
    //       console.error('InventarioStore: Error updating stock:', error);
    //     }
    //   });
    // };

    // const doDelete = (id: number) => {
    //   inventarioService.delete(id).subscribe({
    //     next: (response) => {
    //       messageService.add({ severity: 'warn', summary: 'Desactivado', detail: response.message || 'Registro de inventario desactivado.' });
    //       methods.doList();
    //     },
    //     error: (error) => {
    //       console.error('InventarioStore: Error deleting inventario:', error);
    //     }
    //   });
    // };

    // const doRestore = (id: number) => {
    //   inventarioService.restore(id).subscribe({
    //     next: (response) => {
    //       messageService.add({ severity: 'success', summary: 'Restaurado', detail: response.message || 'Registro de inventario restaurado.' });
    //       methods.doList();
    //     },
    //     error: (error) => {
    //       console.error('InventarioStore: Error restoring inventario:', error);
    //     }
    //   });
    // };

    // Objeto de métodos
    const methods = {
      openModalRegisterStock, closeModalRegisterStock,
      openModalEditStock, closeModalEditStock,
      openFiltersPopover, closeFiltersPopover,
      setPage, setPerPage, updateFilters,
      doList, 
      // doRegisterStock, doUpdateStock, doDelete, doRestore
    };
    return methods;
  })
);