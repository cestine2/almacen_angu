import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CategoryEntity } from "../app/domain/entities/CategoryEntity";
import { ColorEntity } from "../app/domain/entities/ColorEntity";
import { ProductEntity } from "../app/domain/entities/ProductEntity";
import { SucursalEntity } from "../app/domain/entities/SucursalEntity";
import { ProductoService } from "../app/core/services/producto.service";

import { MessageService } from "primeng/api";
import { inject } from "@angular/core";
import { ProductListFilters } from "../app/domain/dtos/ProductListFilters";


type ProductState = {
  isOpenCreate: boolean;
  isOpenEdit: boolean;
  isOpenFilters: boolean;
  products: ProductEntity[]; // Lista de productos para la tabla
  productEdit: ProductEntity | null; // Producto seleccionado para edición/detalle

  // Propiedades para paginación
  currentPage: number;
  totalItems: number;
  perPage: number; // 0 para usar el default del backend inicialmente

  filters: ProductListFilters;
  // Listas para selectores
  categorias: CategoryEntity[];
  colors: ColorEntity[];
  sucursales: SucursalEntity[];
};

const initialState: ProductState = {
  isOpenCreate: false,
  isOpenEdit: false,
  isOpenFilters: false,
  products: [],
  productEdit: null,

  currentPage: 1,
  totalItems: 0,
  perPage: 0, // Inicializamos a 0 para usar el default del backend

  filters: {
    status: 'active', // Valor por defecto, igual que tu lógica de backend
    categoria_id: null,
    nombre: undefined, // o '', dependiendo de cómo quieras manejarlo
    talla: undefined,  // o ''
  },

  categorias: [],
  colors: [],
  sucursales: [],
  
};

export const ProductStore = signalStore(
  { providedIn: 'root' },
 withState(initialState),
 
 withMethods((store,
    productService = inject(ProductoService),
    messageService = inject(MessageService) // Para los toasts
  ) => ({

    // --- Métodos para manejo de Modales (sin cambios) ---
    openModalFilters() {
      patchState(store, { isOpenFilters: true });
    },
    closeModalFilters() {
      patchState(store, { isOpenFilters: false });
    },
    openModalCreate() {
      patchState(store, { isOpenCreate: true });
    },
    closeModalCreate() {
      patchState(store, { isOpenCreate: false });
    },
    openModalEdit(product: ProductEntity) {
      patchState(store, { isOpenEdit: true, productEdit: product });
    },
    closeModalEdit() {
      patchState(store, { isOpenEdit: false, productEdit: null });
    },


    // --- Métodos para actualizar Paginación ---
    // Métodos separados para page y perPage, ambos disparan doList
    setPage(page: number) {
        if (store.currentPage() !== page) {
            patchState(store, { currentPage: page });
            this.doList(); // Dispara la carga al cambiar la página
        }
    },

    setPerPage(perPage: number) {
        if (store.perPage() !== perPage) {
            // Al cambiar perPage, generalmente se resetea a la página 1
            patchState(store, { perPage: perPage, currentPage: 1 });
            this.doList(); // Dispara la carga al cambiar perPage
        }
    },

    // >>> NUEVO: Método para actualizar todos los filtros o parte de ellos <<<
    updateFilters(newFilters: Partial<ProductListFilters>) {
      // 3. ¿Se actualiza correctamente la signal store.filters()?
      console.log('ProductStore: Updating filters with', newFilters);
      patchState(store, (currentState) => {
        const updated = {
          filters: { ...currentState.filters, ...newFilters }, // Fusiona
          currentPage: 1, // Resetea a página 1
        };
        console.log('ProductStore: New state after patch (filters part)', updated.filters);
        return updated;
      });
      this.doList(); // 4. Llama a doList para recargar
    },

    // --- Método para cargar la lista de productos basado en el estado ACTUAL del Store ---
    doList() {
        // if (store.loading()) return; // Evita cargas múltiples si ya está cargando
        // patchState(store, { loading: true });
        const currentFilters = store.filters(); // Obtener los filtros del estado
        // Construye el objeto options leyendo SOLO de la paginación del estado
        const options = {
            page: store.currentPage(),
            perPage: store.perPage(), // Será 0 inicialmente, luego el del backend/usuario
            filters: currentFilters,
            // REMOVER: No incluir filtros aquí
        };
        console.log('ProductStore: doList called with options', options);

        productService.list(options).subscribe({
            next: (response) => {
                // Patch el estado con los datos recibidos
                patchState(store, {
                    products: response.data,
                    totalItems: response.meta.total,
                    currentPage: response.meta.current_page,
                    perPage: response.meta.per_page, // Actualiza perPage con el valor real usado por el backend
                    // loading: false,
                });
            },
            error: (error) => {
                console.error('Error loading products:', error);
              
                // El interceptor maneja el toast de error global
            }
        });
    },


    // --- Métodos para Operaciones CRUD (sin cambios significativos, llaman a doList al éxito) ---
    // Mantienen la misma firma que antes, pero ya no necesitan pasar args a loadCategorias
    // Ya que loadCategorias (ahora doList) lee del estado.

    doCreate(productData: Omit<ProductEntity, 'id' | 'created_at' | 'updated_at' | 'codigo_barras' | 'categoria' | 'color'>) {
        // if (store.loading()) return;
        // patchState(store, { loading: true });

        productService.create(productData).subscribe({
            next: (response) => {
                // Recarga la lista después de crear, manteniendo paginación actual
                this.doList(); // doList leerá el estado actual

                patchState(store, { isOpenCreate: false});
                messageService.add({ severity: 'success', summary: 'Éxito', detail: `Producto '${response.nombre}' creado correctamente` });
            },
            error: (error) => {
                console.error('Error creating product:', error);
                // patchState(store, { loading: false });
                // Interceptor maneja toasts de error
            }
        });
    },

    doUpdate(id: number, productData: Partial<Omit<ProductEntity, 'id' | 'created_at' | 'updated_at' | 'codigo_barras' | 'categoria' | 'color'>>) {
    
        productService.update(id, productData).subscribe({
            next: (response) => {
                 // Recarga la lista después de actualizar
                this.doList(); // doList leerá el estado actual

                patchState(store, { isOpenEdit: false, productEdit: null });
                messageService.add({ severity: 'success', summary: 'Actualización Exitosa', detail: `Producto actualizado correctamente` });
            },
            error: (error) => {
                console.error('Error updating product:', error);
                // Interceptor maneja toasts de error
            }
        });
    },

    doDelete(id: number) {
        
        productService.delete(id).subscribe({
            next: () => {
                 // Recarga la lista después de desactivar
                this.doList(); // doList leerá el estado actual
                messageService.add({ severity: 'warn', summary: 'Desactivado', detail: 'Producto desactivado con éxito' });
            },
            error: (error) => {
                console.error('Error deleting product:', error);
                // Interceptor maneja toasts de error
            }
        });
    },

    doRestore(id: number) {
         productService.restore(id).subscribe({
             next: () => {
                  // Recarga la lista después de restaurar
                 this.doList(); // doList leerá el estado actual
                 messageService.add({ severity: 'success', summary: 'Restaurado', detail: 'Producto reactivado con éxito' });
             },
             error: (error) => {
                 console.error('Error restoring product:', error);
                 // Interceptor maneja toasts de error
             }
         });
     }

  }))


);