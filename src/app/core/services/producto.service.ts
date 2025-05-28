import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../../domain/dtos/PaginatedResponse';
import { ProductEntity } from '../../domain/entities/ProductEntity';
import { environment } from '../../../environments/environment';
import { ProductListFilters } from '../../domain/dtos/ProductListFilters';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor() { }

  private http = inject(HttpClient);

  /**
   * Obtiene productos paginados con filtros.
   * @param options Paginación y filtros
   */
   list(options: {
      page: number;
      perPage: number; // 0 para usar el default del backend
      filters?: ProductListFilters;
    }): Observable<PaginatedResponse<ProductEntity>> {
      console.log('ProductoService: list called with options', options);
      let params = new HttpParams()
        .set('page', options.page.toString());

      // Lógica para omitir per_page si es 0 (carga inicial para usar default backend)
      if (options.perPage > 0) {
        params = params.set('per_page', options.perPage.toString());
      }

      // REMOVER: No añadir filtros aquí por ahora
      if (options.filters) {
      const backendFilters = options.filters; // Alias para claridad

      // Status (el backend espera 'status' y lo mapea a 'estado')
      if (backendFilters.status !== undefined && backendFilters.status !== null) {
        params = params.set('status', backendFilters.status);
      }

      // categoria_id
      if (backendFilters.categoria_id !== undefined && backendFilters.categoria_id !== null) {
        params = params.set('categoria_id', backendFilters.categoria_id.toString());
      }

      // nombre
      if (backendFilters.nombre && backendFilters.nombre.trim()) {
        params = params.set('nombre', backendFilters.nombre.trim());
      }

      // talla
      if (backendFilters.talla && backendFilters.talla.trim()) {
        params = params.set('talla', backendFilters.talla.trim());
      }
    }
     console.log('ProductoService: Final HttpParams', params.toString());
      //
      return this.http.get<PaginatedResponse<ProductEntity>>(
        `${environment.apiUrl}/productos`,
        { params }
      ).pipe(
        map(response => {
            // Mapeamos la respuesta para asegurar que data sea un array y meta tenga per_page
            const perPageUsed = response.meta?.per_page ?? (options.perPage > 0 ? options.perPage : 20); // Usar 20 como fallback duro

            return ({
              ...response, // Mantenemos las propiedades originales
              data: response.data || [], // Aseguramos que data es un array
              meta: { // Aseguramos que meta tiene las propiedades esperadas
                ...response.meta, // Esparcimos las propiedades originales de meta
                current_page: response.meta?.current_page ?? options.page, // Fallback
                total: response.meta?.total ?? 0, // Fallback
                per_page: perPageUsed, // Usamos el valor calculado para per_page
                // Otros fallbacks si es necesario para from, to, last_page, links, path
                from: response.meta?.from ?? null,
                to: response.meta?.to ?? null,
                last_page: response.meta?.last_page ?? 1,
                links: response.meta?.links ?? [],
                path: response.meta?.path ?? '',
            },
            });
        })
      );
    }


  //-----------------------------
  /**
   * Obtiene un producto específico por ID.
   */
  get(id: number): Observable<ProductEntity> {
    // Tu backend show() carga relaciones, el service get() no necesita hacerlo explícitamente
    return this.http.get<ProductEntity>(`${environment.apiUrl}/productos/${id}`);
  }


  /**
   * Crea un nuevo producto.
   * El backend genera el codigo_barras.
   */
  create(productData: Omit<ProductEntity, 'id' | 'created_at' | 'updated_at' | 'codigo_barras' | 'categoria' | 'color' | 'sucursal'>): Observable<ProductEntity> {
    // Solo enviamos los campos fillable al backend para crear
    return this.http.post<ProductEntity>(`${environment.apiUrl}/productos`, productData);
  }

  /**
   * Actualiza un producto existente.
   */
  update(id: number, productData: Partial<Omit<ProductEntity, 'id' | 'created_at' | 'updated_at' | 'codigo_barras' | 'categoria' | 'color' | 'sucursal'>>): Observable<ProductEntity> {
    // Solo enviamos los campos que pueden ser actualizados (fillable)
    return this.http.put<ProductEntity>(`${environment.apiUrl}/productos/${id}`, productData);
  }

  /**
   * Desactiva (elimina lógicamente) un producto.
   */
  delete(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${environment.apiUrl}/productos/${id}`);
  }

  /**
   * Restaura un producto (activa).
   */
  restore(id: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${environment.apiUrl}/productos/${id}/restore`, {});
  }
}
