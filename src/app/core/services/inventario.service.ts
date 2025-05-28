import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventarioListFilters } from '../../domain/dtos/InventarioListFilters';
import { PaginatedResponse } from '../../domain/dtos/PaginatedResponse';
import { InventarioEntity } from '../../domain/entities/InventarioEntity';

export interface CreateInventarioData {
  tipo: 'Material' | 'Producto';
  stock_actual: number;
  sucursal_id: number;
  material_id?: number | null; // Requerido si tipo es Material
  producto_id?: number | null; // Requerido si tipo es Producto
  estado?: boolean; // Opcional, backend puede poner default
}

// Tipo para los datos de actualización, reflejando UpdateInventarioRequest
export interface UpdateInventarioData {
  stock_actual?: number;
  sucursal_id?: number;
  estado?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  constructor() { }

  http = inject(HttpClient);
  apiUrl = `${environment.apiUrl}/inventarios`;

  list(options: {
    page: number;
    perPage: number;
    filters?: InventarioListFilters;
  }): Observable<PaginatedResponse<InventarioEntity>> {
    let params = new HttpParams()
      .set('page', options.page.toString());

    if (options.perPage > 0) {
      params = params.set('per_page', options.perPage.toString());
    }

    if (options.filters) {
      // if (options.filters.status) { // 'active' o 'all'
      //   params = params.set('status', options.filters.status);
      // }
      if (options.filters.tipo) {
        params = params.set('tipo', options.filters.tipo);
      }
      if (options.filters.material_id !== undefined && options.filters.material_id !== null) {
        params = params.set('material_id', options.filters.material_id.toString());
      }
      if (options.filters.producto_id !== undefined && options.filters.producto_id !== null) {
        params = params.set('producto_id', options.filters.producto_id.toString());
      }
      if (options.filters.sucursal_id !== undefined && options.filters.sucursal_id !== null) {
        params = params.set('sucursal_id', options.filters.sucursal_id.toString());
      }
    }
    console.log('[InventarioService] List - Final HttpParams:', params.toString());

    return this.http.get<PaginatedResponse<InventarioEntity>>(this.apiUrl, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data || [],
        meta: response.meta || { /* fallback robusto para meta */ },
      }))
    );
  }

  getById(id: number): Observable<InventarioEntity> {
    // InventarioController@show devuelve new InventarioResource($inventario)
    // InventarioResource no envuelve en 'data' un solo ítem.
    return this.http.get<InventarioEntity>(`${this.apiUrl}/${id}`);
  }

  // create(data: CreateInventarioData): Observable<InventarioEntity> {
  //   // El backend devuelve InventarioResource (sin 'data' wrapper para single item)
  //   return this.http.post<InventarioEntity>(this.apiUrl, data);
  // }

  // update(id: number, data: UpdateInventarioData): Observable<InventarioEntity> {
  //   return this.http.put<InventarioEntity>(`${this.apiUrl}/${id}`, data);
  // }

  // delete(id: number): Observable<{ message: string }> {
  //   return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  // }

  // restore(id: number): Observable<{ message: string }> {
  //   return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/restore`, {});
  // }
}
