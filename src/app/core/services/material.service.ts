import { inject, Injectable } from '@angular/core';
import { MaterialListFilters } from '../../domain/dtos/MaterialListFilters';
import { map, Observable } from 'rxjs';
import { PaginatedResponse } from '../../domain/dtos/PaginatedResponse';
import { MaterialEntity } from '../../domain/entities/MaterialEntity';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {

  constructor() { }

  private http = inject(HttpClient);

   list(options: {
    page: number;
    perPage: number;
    filters?: MaterialListFilters;
  }): Observable<PaginatedResponse<MaterialEntity>> {
    let params = new HttpParams()
      .set('page', options.page.toString());

    if (options.perPage > 0) {
      params = params.set('per_page', options.perPage.toString());
    }

    if (options.filters) {
      if (options.filters.status) { // 'active' o 'all'
        params = params.set('status', options.filters.status);
      }
      if (options.filters.categoria_id !== undefined && options.filters.categoria_id !== null) {
        params = params.set('categoria_id', options.filters.categoria_id.toString());
      }
      if (options.filters.proveedor_id !== undefined && options.filters.proveedor_id !== null) {
        params = params.set('proveedor_id', options.filters.proveedor_id.toString());
      }
      if (options.filters.cod_articulo && options.filters.cod_articulo.trim()) {
        params = params.set('cod_articulo', options.filters.cod_articulo.trim());
      }
      if (options.filters.nombre && options.filters.nombre.trim()) {
        params = params.set('nombre', options.filters.nombre.trim());
      }
    }
    console.log('[MaterialService] List - Final HttpParams:', params.toString());

    return this.http.get<PaginatedResponse<MaterialEntity>>(`${environment.apiUrl}/materiales`, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data || [],
        meta: response.meta || {
          current_page: options.page,
          total: response.data?.length || 0,
          per_page: options.perPage > 0 ? options.perPage : (response.data?.length || 10),
          from: null, to: null, last_page: 1, links: [], path: `${environment.apiUrl}/materiales`
        },
      }))
    );
  }

  getById(id: number): Observable<MaterialEntity> {
    // MaterialController@show devuelve new MaterialResource($material)
    // Asumimos que MaterialResource no envuelve en 'data' para un solo ítem.
    return this.http.get<MaterialEntity>(`${environment.apiUrl}/materiales/${id}`);
  }

  create(data: Omit<MaterialEntity, 'id' | 'created_at' | 'updated_at' | 'codigo_barras' | 'categoria' | 'proveedor' | 'color'>): Observable<MaterialEntity> {
    // El backend genera codigo_barras
    // El controller devuelve response()->json(new MaterialResource($material), ...)
    return this.http.post<MaterialEntity>(`${environment.apiUrl}/materiales`, data);
  }

  update(id: number, data: Partial<Omit<MaterialEntity, 'id' | 'created_at' | 'updated_at' | 'codigo_barras' | 'categoria' | 'proveedor' | 'color'>>): Observable<MaterialEntity> {
    return this.http.put<MaterialEntity>(`${environment.apiUrl}/materiales/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/materiales/${id}`);
  }

  restore(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/materiales/${id}/restore`, {});
  }
}
