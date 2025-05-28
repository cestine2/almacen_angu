import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { MessageService } from "primeng/api";
import { MovimientoInventarioService, CreateMovimientoData } from "../app/core/services/movimiento-inventario.service";
import { MovimientoInventarioListFilters } from "../app/domain/dtos/MovimientoInventarioListFilters";
import { PaginatedResponse } from "../app/domain/dtos/PaginatedResponse";
import { MovimientoInventarioEntity } from "../app/domain/entities/MovimientoInventarioEntity";

type MovimientoInventarioState = {
  isOpenRegisterMovimiento: boolean; // Para el modal de creación/registro
  isOpenFilters: boolean;           // Para el popover de filtros

  movimientos: MovimientoInventarioEntity[];
  // No necesitamos movimientoEdit ya que no hay edición individual

  // Paginación y Filtros
  currentPage: number;
  totalItems: number;
  perPage: number;
  filters: MovimientoInventarioListFilters;
};

const initialState: MovimientoInventarioState = {
  isOpenRegisterMovimiento: false,
  isOpenFilters: false,
  movimientos: [],
  currentPage: 1,
  totalItems: 0,
  perPage: 20, // El default del MovimientoInventarioController en backend es 20
  filters: { // Filtros iniciales por defecto
    motivo: null,     // Sin filtro de motivo por defecto
    tipo: null,       // Sin filtro de tipo por defecto
    material_id: null,
    producto_id: null,
    sucursal_id: null,
    start_date: null,
    end_date: null,
  },
};

export const MovimientoInventarioStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store,
    movimientoService = inject(MovimientoInventarioService),
    messageService = inject(MessageService)
  ) => {

    // --- MÉTODOS DE MODALES/POPOVER ---
    const openModalRegisterMovimiento = () => patchState(store, { isOpenRegisterMovimiento: true });
    const closeModalRegisterMovimiento = () => patchState(store, { isOpenRegisterMovimiento: false });

    const openFiltersPopover = () => patchState(store, { isOpenFilters: true });
    const closeFiltersPopover = () => patchState(store, { isOpenFilters: false });

    // --- OPERACIÓN PRINCIPAL DE LISTADO ---
    const doList = () => {
      const listOptions = {
        page: store.currentPage(),
        perPage: store.perPage(),
        filters: store.filters(),
      };
      console.log('MovimientoInventarioStore: Fetching list with options:', listOptions);

      movimientoService.list(listOptions).subscribe({
        next: (response: PaginatedResponse<MovimientoInventarioEntity>) => {
          patchState(store, {
            movimientos: response.data,
            totalItems: response.meta.total,
            currentPage: response.meta.current_page,
            perPage: response.meta.per_page,
          });
        },
        error: (error) => {
          console.error('MovimientoInventarioStore: Error loading movimientos:', error);
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

    const updateFilters = (newFilters: Partial<MovimientoInventarioListFilters>) => {
      patchState(store, (currentState) => ({
        filters: { ...currentState.filters, ...newFilters },
        currentPage: 1,
      }));
      methods.doList();
    };

    // --- OPERACIÓN DE CREACIÓN (REGISTRAR MOVIMIENTO) ---
    const doRegisterMovimiento = (data: CreateMovimientoData) => {
      movimientoService.create(data).subscribe({
        next: (response) => {
          const itemName = response.item_asociado?.nombre || (response.tipo === 'Material' ? `Material ID ${response.material_id}` : `Producto ID ${response.producto_id}`);
          messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Movimiento de '${response.motivo}' para '${itemName}' registrado.`
          });
          closeModalRegisterMovimiento();
          methods.doList(); // Refresca la lista de movimientos
          // Considera si necesitas refrescar la lista de Inventario (stock) también,
          // si tienes otro store para ello y la vista lo requiere.
        },
        error: (error) => {
          console.error('MovimientoInventarioStore: Error registering movimiento:', error);
          // El interceptor maneja el toast para errores HTTP (como 422 por InvalidArgumentException)
        }
      });
    };

    // No hay doUpdate, doDelete, doRestore para movimientos individuales.

    // Objeto de métodos
    const methods = {
      openModalRegisterMovimiento, closeModalRegisterMovimiento,
      openFiltersPopover, closeFiltersPopover,
      setPage, setPerPage, updateFilters,
      doList, doRegisterMovimiento
    };
    return methods;
  })
);