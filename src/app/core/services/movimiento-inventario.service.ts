import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MovimientoInventarioListFilters } from '../../domain/dtos/MovimientoInventarioListFilters';
import { PaginatedResponse } from '../../domain/dtos/PaginatedResponse';
import { MovimientoInventarioEntity } from '../../domain/entities/MovimientoInventarioEntity';


export interface CreateMovimientoData {
  motivo: 'entrada' | 'salida' | 'ajuste';
  descripcion?: string | null;
  tipo: 'Material' | 'Producto';
  cantidad: number;
  precio_unitario?: number | null; // Requerido para Producto
  sucursal_id: number;
  material_id?: number | null; // Requerido si tipo es Material
  producto_id?: number | null; // Requerido si tipo es Producto
}

@Injectable({
  providedIn: 'root'
})
export class MovimientoInventarioService {

  constructor() { }

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/movimientos-inventario`;

  list(options: {
    page: number;
    perPage: number;
    filters?: MovimientoInventarioListFilters;
  }): Observable<PaginatedResponse<MovimientoInventarioEntity>> {
    let params = new HttpParams()
      .set('page', options.page.toString());

    if (options.perPage > 0) {
      params = params.set('per_page', options.perPage.toString());
    }

    if (options.filters) {
      if (options.filters.motivo) {
        params = params.set('motivo', options.filters.motivo);
      }
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
      if (options.filters.start_date) {
        params = params.set('start_date', options.filters.start_date);
      }
      if (options.filters.end_date) {
        params = params.set('end_date', options.filters.end_date);
      }
    }
    console.log('[MovimientoInventarioService] List - Final HttpParams:', params.toString());

    return this.http.get<PaginatedResponse<MovimientoInventarioEntity>>(this.apiUrl, { params }).pipe(
      map(response => ({
        ...response,
        data: (response.data || []).map(item => ({ // Parsear decimales si vienen como string
            ...item,
            precio_unitario: item.precio_unitario !== null ? parseFloat(item.precio_unitario as any) : null,
            total: item.total !== null ? parseFloat(item.total as any) : null,
        })),
        meta: response.meta || { /* fallback robusto para meta */ },
      }))
    );
  }

  getById(id: number): Observable<MovimientoInventarioEntity> {
    return this.http.get<MovimientoInventarioEntity>(`${this.apiUrl}/${id}`).pipe(
        map(item => ({ // Parsear decimales
            ...item,
            precio_unitario: item.precio_unitario !== null ? parseFloat(item.precio_unitario as any) : null,
            total: item.total !== null ? parseFloat(item.total as any) : null,
        }))
    );
  }

  create(data: CreateMovimientoData): Observable<MovimientoInventarioEntity> {
    return this.http.post<MovimientoInventarioEntity>(this.apiUrl, data).pipe(
        map(item => ({ // Parsear decimales
            ...item,
            precio_unitario: item.precio_unitario !== null ? parseFloat(item.precio_unitario as any) : null,
            total: item.total !== null ? parseFloat(item.total as any) : null,
        }))
    );
  }
}
