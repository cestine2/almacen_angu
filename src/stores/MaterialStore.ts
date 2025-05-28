import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { MaterialListFilters } from "../app/domain/dtos/MaterialListFilters";
import { MaterialEntity } from "../app/domain/entities/MaterialEntity";
import { inject } from "@angular/core";
import { MaterialService } from "../app/core/services/material.service";
import { MessageService } from "primeng/api";
import { PaginatedResponse } from "../app/domain/dtos/PaginatedResponse";

type MaterialState = {
  isOpenCreate: boolean;
  isOpenEdit: boolean;
  isOpenFilters: boolean; // Para el modal de filtros
  isOpenDetalle: boolean; 

  materiales: MaterialEntity[];
  materialEdit: MaterialEntity | null;
  materialDetalle: MaterialEntity | null;

  // Paginación y Filtros
  currentPage: number;
  totalItems: number;
  perPage: number;
  filters: MaterialListFilters;

  // Opciones para dropdowns (si se cargan aquí, sino se manejan en componentes/otros stores)
  // categoriasOptions: CategoryEntity[];
  // proveedoresOptions: ProveedorEntity[];
  // coloresOptions: ColorEntity[];
};

const initialState: MaterialState = {
  isOpenCreate: false,
  isOpenEdit: false,
  isOpenFilters: false, // Inicialmente cerrado
  isOpenDetalle: false,
  materiales: [],
  materialEdit: null,
  materialDetalle: null,
  currentPage: 1,
  totalItems: 0,
  perPage: 15, // El default del MaterialService en backend es 15
  filters: { // Filtros iniciales por defecto
    status: 'active',
    categoria_id: null,
    proveedor_id: null,
    cod_articulo: undefined,
    nombre: undefined,
  },
  // categoriasOptions: [],
  // proveedoresOptions: [],
  // coloresOptions: [],
};

export const MaterialStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store,
    materialService = inject(MaterialService),
    messageService = inject(MessageService)
    // Inyecta otros stores (CategoriaStore, ProveedorStore, ColorStore) si este store
    // va a ser responsable de cargar sus datos para los dropdowns de filtros/formularios.
    // Es más común que los componentes específicos (FiltroMaterialComponent, CreateMaterialComponent)
    // inyecten esos stores directamente.
  ) => {

    // --- MÉTODOS DE MODALES (Crear, Editar, Filtros) ---
    const openModalCreate = () => patchState(store, { isOpenCreate: true, materialEdit: null });
    const closeModalCreate = () => patchState(store, { isOpenCreate: false });

    const openModalEdit = (material: MaterialEntity) => patchState(store, { isOpenEdit: true, materialEdit: material });
    const closeModalEdit = () => patchState(store, { isOpenEdit: false, materialEdit: null });

    const openModalFilters = () => patchState(store, { isOpenFilters: true });
    const closeModalFilters = () => patchState(store, { isOpenFilters: false });

    const openModalDetalle = (material: MaterialEntity) => patchState(store, { isOpenDetalle: true, materialDetalle: material });
    const closeModalDetalle = () => patchState(store, { isOpenDetalle: false, materialDetalle: null });
  

    // --- OPERACIÓN PRINCIPAL DE LISTADO ---
    const doList = () => {
      // Aquí no manejamos 'loading' explícitamente según la decisión anterior
      const listOptions = {
        page: store.currentPage(),
        perPage: store.perPage(),
        filters: store.filters(),
      };
      console.log('MaterialStore: Fetching list with options:', listOptions);

      materialService.list(listOptions).subscribe({
        next: (response: PaginatedResponse<MaterialEntity>) => {
          patchState(store, {
            materiales: response.data,
            totalItems: response.meta.total,
            currentPage: response.meta.current_page,
            perPage: response.meta.per_page,
          });
        },
        error: (error) => {
          console.error('MaterialStore: Error loading materiales:', error);
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

    const updateFilters = (newFilters: Partial<MaterialListFilters>) => {
      patchState(store, (currentState) => ({
        filters: { ...currentState.filters, ...newFilters },
        currentPage: 1,
      }));
      methods.doList();
    };

    // --- OPERACIONES CRUD ---
    const doCreate = (data: Omit<MaterialEntity, 'id' | 'created_at' | 'updated_at' | 'codigo_barras' | 'categoria' | 'proveedor' | 'color'>) => {
      materialService.create(data).subscribe({
        next: (response) => {
          messageService.add({ severity: 'success', summary: 'Éxito', detail: `Material '${response.nombre}' creado.` });
          closeModalCreate();
          methods.doList();
        },
        error: (error) => {
          console.error('MaterialStore: Error creating material:', error);
        }
      });
    };

    const doUpdate = (id: number, data: Partial<Omit<MaterialEntity, 'id' | 'created_at' | 'updated_at' | 'codigo_barras' | 'categoria' | 'proveedor' | 'color'>>) => {
      materialService.update(id, data).subscribe({
        next: (response) => {
          messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Material '${response.nombre}' actualizado.` });
          closeModalEdit();
          methods.doList();
        },
        error: (error) => {
          console.error('MaterialStore: Error updating material:', error);
        }
      });
    };

    const doDelete = (id: number) => {
      materialService.delete(id).subscribe({
        next: (response) => {
          messageService.add({ severity: 'warn', summary: 'Desactivado', detail: response.message || 'Material desactivado.' });
          methods.doList();
        },
        error: (error) => {
          // El interceptor ya maneja los errores de HTTP (ej. 409 Conflict si MaterialCannotBeDeletedException).
          // Si quisieras manejar el mensaje de MaterialCannotBeDeletedException de forma más específica aquí,
          // necesitarías que el error contenga una forma de identificarlo más allá del status code.
          console.error('MaterialStore: Error deleting material:', error);
        }
      });
    };

    const doRestore = (id: number) => {
      materialService.restore(id).subscribe({
        next: (response) => {
          messageService.add({ severity: 'success', summary: 'Restaurado', detail: response.message || 'Material restaurado.' });
          methods.doList();
        },
        error: (error) => {
          console.error('MaterialStore: Error restoring material:', error);
        }
      });
    };

    // Objeto de métodos para asegurar el contexto de 'this' y facilitar la devolución
    const methods = {
      openModalCreate, closeModalCreate,
      openModalEdit, closeModalEdit,
      openModalFilters, closeModalFilters,
      openModalDetalle, closeModalDetalle,
      setPage, setPerPage, updateFilters,
      doList, doCreate, doUpdate, doDelete, doRestore
    };
    return methods;
  })
);