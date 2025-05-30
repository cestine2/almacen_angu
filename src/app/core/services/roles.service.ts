import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssignPermissionsData } from '../../domain/dtos/PermisosData/AssignPermissionsData';
import { CreateRoleData } from '../../domain/dtos/PermisosData/CreateRoleData';
import { UpdateRoleData } from '../../domain/dtos/PermisosData/UpdateRoleData';
import { RoleEntity } from '../../domain/entities/RoleEntity';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor() { }

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/roles`;

  /**
   * Lista todos los roles.
   * El backend RoleController@index devuelve RoleResource::collection($roles).
   * Una colección de resources usualmente se envuelve en 'data'.
   */
  getAllRoles(): Observable<RoleEntity[]> {
    return this.http.get<{ data: RoleEntity[] }>(this.apiUrl)
      .pipe(map(response => response.data || []));
    // Si no estuviera envuelto en 'data' (raro para colecciones de resources):
    // return this.http.get<RoleEntity[]>(this.apiUrl);
  }

  // getRoleById(id: number): Observable<RoleEntity> {
  //   // RoleController@show devuelve new RoleResource($role)
  //   // Un resource individual usualmente NO se envuelve en 'data'.
  //   return this.http.get<RoleEntity>(`${this.apiUrl}/${id}`);
  // }

  getRoleById(id: number): Observable<RoleEntity | null> { // Devolver RoleEntity | null
    console.log(`[RoleService] getRoleById - Fetching role ID: ${id}`);
    return this.http.get<{ data: RoleEntity }>(`${this.apiUrl}/${id}`).pipe(
      tap(rawResponse => {
        console.log('[RoleService] getRoleById - Raw response from HTTP GET:', rawResponse);
      }),
      map(response => {
        if (response && response.data) {
          console.log('[RoleService] getRoleById - Successfully extracted response.data:', response.data);
          return response.data; // Devuelve el objeto RoleEntity plano
        }
        console.warn('[RoleService] getRoleById - Response or response.data was null/undefined. Raw response:', response);
        return null; // Devuelve null si la estructura no es la esperada
      }),
      catchError(error => {
        console.error(`[RoleService] getRoleById - Error fetching role ${id}:`, error);
        return of(null); // Devuelve un observable de null en caso de error HTTP
      })
    );
  }
  
  createRole(data: CreateRoleData): Observable<RoleEntity> {
    return this.http.post<RoleEntity>(this.apiUrl, data); // Asume que create también envuelve en 'data'
      
  }

  

  updateRole(id: number, data: UpdateRoleData): Observable<RoleEntity> {
    return this.http.put<{ data: RoleEntity }>(`${this.apiUrl}/${id}`, data) // Asume que update también envuelve en 'data'
      .pipe(map(response => response.data));
  }


  deleteRole(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Asigna/Sincroniza permisos a un rol.
   * POST /api/roles/{roleId}/permissions
   * Espera: { permissions: ["perm_name_1", "perm_name_2"] }
   * Devuelve: RoleResource actualizado (con sus permisos)
   */
  assignPermissionsToRole(roleId: number, data: AssignPermissionsData): Observable<RoleEntity> {
    return this.http.post<{ data: RoleEntity }>(`${this.apiUrl}/${roleId}/permissions`, data) // Asume que assign también envuelve en 'data'
      .pipe(map(response => response.data));
  }

}
