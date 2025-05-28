import { inject, Injectable } from '@angular/core';
import { CategoryEntity } from '../../domain/entities/CategoryEntity';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../domain/dtos/PaginatedResponse';


// Define la estructura de la respuesta paginada de Laravel
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  constructor() { }

  private http = inject(HttpClient);

  /**
   * Obtiene categorías paginadas con filtros
   * @param options {status: 'active' | 'all', page: number, perPage: number, tipo?: 'producto' | 'material'}
   */
  list(options: { 
    status: 'active' | 'all', 
    page: number, 
    perPage: number, 
    tipo?: 'producto' | 'material' | undefined,
    nombre?: string;
  }): Observable<PaginatedResponse<CategoryEntity>> {
    
    let params = new HttpParams()
      .set('status', options.status)
      .set('page', options.page.toString())
      .set('per_page', options.perPage.toString()); //esta linea es de paginacion que llamara desde el store
    
    if (options.tipo) {
      params = params.set('type', options.tipo);
    }
    if (options.nombre && options.nombre.trim() !== '') { // <<< AÑADIR LÓGICA PARA NOMBRE
      params = params.set('nombre', options.nombre.trim());
    }

    return this.http.get<PaginatedResponse<CategoryEntity>>(
    `${environment.apiUrl}/categorias`, 
    { params }
    ).pipe(
      map(response => ({
      ...response,
      data: response.data || [],
      meta: response.meta || { 
        current_page: 1, 
        total: 0, 
        per_page: options.perPage,
        // ... otros valores por defecto
      },
    }))
    );
  }

  //------------------------------------------------------------------------------
  create(categoria: Omit<CategoryEntity, 'id'>): Observable<CategoryEntity> {
    return this.http.post<CategoryEntity>(
      `${environment.apiUrl}/categorias`, 
      categoria
    );
  }

  update(id: number, categoria: Partial<CategoryEntity>): Observable<CategoryEntity> {
    return this.http.put<{data: CategoryEntity}>(`${environment.apiUrl}/categorias/${id}`, categoria).pipe(
      map(response => response.data)
    )
  }
  
  delete(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${environment.apiUrl}/categorias/${id}`
    );
  }

  restore(id: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${environment.apiUrl}/categorias/${id}/restore`, 
      {}
    );
  }

  show(id: number): Observable<CategoryEntity> {
    return this.http.get<CategoryEntity>(
      `${environment.apiUrl}/categorias/${id}`
    );
  }


}
