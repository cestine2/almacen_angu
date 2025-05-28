import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CategoryEntity } from "../app/domain/entities/CategoryEntity";
import { inject } from "@angular/core";
import { MessageService } from "primeng/api";
import { CategoriaService } from "../app/core/services/categoria.service";

// Define la estructura de la respuesta paginada (la misma que en el servicio)

type CategoriaState  = {
  isOpenCreate: boolean;
  isOpenEdit: boolean;
  isOpenDetalle: boolean; 
  categorias: CategoryEntity[]; // Cambié 'sucursal' a 'sucursales' para la lista
  categoriaEdit: CategoryEntity | null; // Cambié a un solo objeto para edición, no un array
  categoriaDetalle: CategoryEntity | null;
  categoriasDropdownOptions: CategoryEntity[];

   // Propiedades para paginación y filtro (basado en la respuesta paginada del backend)
  currentPage: number;
  totalItems: number;
  perPage: number;
  selectedTipo: 'producto' | 'material' | 'all';
}

const initialState: CategoriaState = {
  isOpenCreate: false,
  isOpenEdit: false,
  isOpenDetalle: false,
  categorias: [],
  categoriaEdit: null,
  categoriaDetalle: null,
  categoriasDropdownOptions: [],
  currentPage: 1,
  totalItems: 0,
  perPage: 0,
  selectedTipo: 'all'
};

export const CategoriaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, 
    categoriaService = inject(CategoriaService),
    messageService = inject(MessageService)
  ) => ({

    // Manejo de modales
    openModalCreate() {
      patchState(store, { isOpenCreate: true });
    },
    closeModalCreate() {
      patchState(store, { isOpenCreate: false });
    },
    openModalEdit(categoria: CategoryEntity) {
      patchState(store, { isOpenEdit: true, categoriaEdit: categoria });
    },
    closeModalEdit() {
      patchState(store, { isOpenEdit: false, categoriaEdit: null });
    },
    openModalDetalle(categoria: CategoryEntity)  {
      patchState(store, { isOpenDetalle: true, categoriaDetalle: categoria });
    },
    closeModalDetalle() {
     patchState(store, { isOpenDetalle: false, categoriaDetalle: null });
    },

    loadCategorias(page?: number, perPage?: number, tipo?: 'producto' | 'material' | 'all') {
      const currentPage = page ?? 1; // No uses store.currentPage() aquí
      const currentPerPage = perPage ?? 10;
      const selectedTipo = tipo ?? store.selectedTipo();

      categoriaService.list({
        status: 'all',
        page: currentPage,
        perPage: currentPerPage,
        tipo: selectedTipo !== 'all' ? selectedTipo : undefined
      }).subscribe({
        next: (response) => {
          patchState(store, { 
            categorias: response.data,
            currentPage: response.meta.current_page,
            totalItems: response.meta.total,            
            perPage: response.meta.per_page, // Añadir esta línea
            selectedTipo
          });
          console.log('Estado de categorias después de patchState:', store.categorias()); // Log el estado actualizado
          console.log('Estado totalItems después de patchState:', store.totalItems()); // Log el total
        },
        error: (error) => {
          console.error('Error al cargar categorías:', error);
          messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las categorías'
          });
        }
      });
    },
    // Método para actualizar items por página
    setPerPage(newPerPage: number) {
      patchState(store, { perPage: newPerPage });
    },

    // Método para actualizar la página actual
    setCurrentPage(newPage: number) {
      patchState(store, { currentPage: newPage });
    },
    // CRUD Operations
    doCreate(categoriaData: Omit<CategoryEntity, 'id'>) {
      categoriaService.create(categoriaData).subscribe({
        next: () => {
          this.loadCategorias();
          patchState(store, { isOpenCreate: false });
          messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Categoría creada correctamente'
          });
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
          messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error.message || 'Error al crear categoría'
          });
        }
      });
    },

    doUpdate(id: number, categoriaData: Partial<CategoryEntity>) {
      categoriaService.update(id, categoriaData).subscribe({
        next: (response) => {
          this.loadCategorias();
          patchState(store, { isOpenEdit: false, categoriaEdit: null });
          messageService.add({
            severity: 'success',
            summary: 'Actualización Exitosa',
            detail: `Categoría '${response.nombre}' actualizada`
          });
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error.message || 'Error al actualizar categoría'
          });
        }
      });
    },

    doDelete(id: number) {
      categoriaService.delete(id).subscribe({
        next: () => {
          this.loadCategorias();
          messageService.add({
            severity: 'warn',
            summary: 'Desactivación exitosa',
            detail: 'La categoría se desactivo'
          });
        },
        error: (error) => {
          console.error('Error al desactivar:', error);
          // messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: error.error.message || 'No se pudo desactivar la categoría'
          // });
        }
      });
    },

    doRestore(id: number) {
      categoriaService.restore(id).subscribe({
        next: () => {
          this.loadCategorias();
          messageService.add({
            severity: 'success',
            summary: 'Activación exitosa',
            detail: 'La categoría se activo'
          });
        },
        error: (error) => {
          console.error('Error al restaurar:', error);
        }
      });
    },

    loadCategoriasForDropdown(searchTerm?: string, tipoCategoria?: 'producto' | 'material' | undefined) {
        const perPageForDropdown = 10; // Cuántos mostrar inicialmente o por búsqueda
        categoriaService.list({
          status: 'active', // Siempre activas para selección
          page: 1, // Siempre la primera página de resultados de búsqueda
          perPage: perPageForDropdown,
          tipo: tipoCategoria, // O el tipo que necesites, o hacerlo un parámetro
          nombre: searchTerm // El término de búsqueda
        }).subscribe({
          next: (response) => {
            patchState(store, {
              categoriasDropdownOptions: response.data || []
          
            });
            console.log('[CategoriaStore] Opciones de dropdown actualizadas. Recibido del backend:', response.data); // Ya tenías este
          },
          error: (error) => {
            console.error('Error cargando categorías para dropdown:', error);
            patchState(store, {categoriasDropdownOptions: [] });
            messageService.add({
              severity: 'error', summary: 'Error',
              detail: 'No se pudieron cargar las opciones de categorías'
            });
          }
        });
      }
  }))
);