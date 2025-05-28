import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../domain/dtos/PaginatedResponse';
import { UserListFilters } from '../../domain/dtos/UserListFilters';
import { UserEntity } from '../../domain/entities/UserEntity';

// Tipos para los datos de creación y actualización
export interface CreateUserData {
  nombre: string; // Usamos 'nombre'
  email: string;
  password?: string; // Password es requerido en creación
  sucursal_id: number;
  role_id: number;
  estado?: boolean; // Backend puede tener un default
}

export interface UpdateUserData {
  nombre?: string;
  email?: string;
  // Password no se actualiza aquí
  sucursal_id?: number;
  role_id?: number;
  estado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`; // Endpoint de usuarios

  list(options: {
    page: number;
    perPage: number;
    filters?: UserListFilters;
  }): Observable<PaginatedResponse<UserEntity>> {
    let params = new HttpParams()
      .set('page', options.page.toString());

    if (options.perPage > 0) {
      params = params.set('per_page', options.perPage.toString());
    }

    if (options.filters) {
      if (options.filters.status && options.filters.status !== 'all') { // 'active' o 'inactive'
        params = params.set('status', options.filters.status);
      }
      // Si status es 'all', no se envía, y el backend (UserController) lo interpreta
      // para que el servicio backend no filtre por estado.
      if (options.filters.nombre && options.filters.nombre.trim()) {
        params = params.set('nombre', options.filters.nombre.trim());
      }
    }
    console.log('[UserService] List - Final HttpParams:', params.toString());

    return this.http.get<PaginatedResponse<UserEntity>>(this.apiUrl, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data || [],
        meta: response.meta || { /* fallback robusto para meta */ },
      }))
    );
  }

  getById(id: number): Observable<UserEntity> {
    // UserController@show devuelve new UserResource($user)
    // UserResource no envuelve en 'data' para un solo ítem.
    return this.http.get<UserEntity>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateUserData): Observable<UserEntity> {
    return this.http.post<UserEntity>(this.apiUrl, data);
  }

  update(id: number, data: UpdateUserData): Observable<UserEntity> {
    return this.http.put<UserEntity>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  restore(id: number): Observable<{ message: string }> {
    // Asumiendo que el endpoint de restore para usuarios es /api/usuarios/{id}/restore
    // Tu backend UserController tenía un comentario incorrecto aquí.
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/restore`, {});
  }
}
