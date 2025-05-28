import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProveedorListFilters } from '../../domain/dtos/ProveedorListFilters';
import { ProveedorEntity } from '../../domain/entities/ProveedorEntity';
import { map, Observable } from 'rxjs';
import { PaginatedResponse } from '../../domain/dtos/PaginatedResponse';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  constructor() { }

  private http = inject(HttpClient);

  list(options: {
    page: number;
    perPage: number;
    filters?: ProveedorListFilters;
  }): Observable<PaginatedResponse<ProveedorEntity>> {
    let params = new HttpParams()
      .set('page', options.page.toString());

    if (options.perPage > 0) {
      params = params.set('per_page', options.perPage.toString());
    }

    if (options.filters) {
      if (options.filters.status) {
        params = params.set('status', options.filters.status);
      }
      if (options.filters.nombre && options.filters.nombre.trim()) {
        params = params.set('nombre', options.filters.nombre.trim());
      }
    }
    console.log('[ProveedorService] List - Final HttpParams:', params.toString());

    return this.http.get<PaginatedResponse<ProveedorEntity>>(`${environment.apiUrl}/proveedores`, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data || [],
        meta: response.meta || {
          current_page: options.page,
          total: response.data?.length || 0,
          per_page: options.perPage > 0 ? options.perPage : (response.data?.length || 10),
          from: null, to: null, last_page: 1, links: [], path: `${environment.apiUrl}/proveedores`
        },
      }))
    );
  }

  getById(id: number): Observable<ProveedorEntity> {
    return this.http.get<ProveedorEntity>(`${environment.apiUrl}/proveedores/${id}`);
  }

  create(proveedorData: Omit<ProveedorEntity, 'id' | 'created_at' | 'updated_at'>): Observable<ProveedorEntity> {
    return this.http.post<ProveedorEntity>(`${environment.apiUrl}/proveedores`, proveedorData);
  }

  update(id: number, proveedorData: Partial<Omit<ProveedorEntity, 'id' | 'created_at' | 'updated_at'>>): Observable<ProveedorEntity> {
    return this.http.put<{data: ProveedorEntity}>(`${environment.apiUrl}/proveedores/${id}`, proveedorData).pipe(
      map(response => response.data)
    );
  }

   

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/proveedores/${id}`);
  }

  restore(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/proveedores/${id}/restore`, {});
  }
  
}
