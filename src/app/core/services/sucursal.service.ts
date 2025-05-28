import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SucursalEntity } from '../../domain/entities/SucursalEntity';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {

  constructor() { }

   private http = inject(HttpClient);

  /**
   * Obtiene una lista de sucursales.
   * @param status 'active' para activas, 'inactive' para inactivas, 'all' para todas.
   * @returns Observable<SucursalEntity[]>
   */
  list(): Observable<SucursalEntity[]> {
      return this.http.get<{data: SucursalEntity[]}>(`${environment.apiUrl}/sucursales?status=all`).pipe(
        map(response => response.data)
      );
  }

 
  /**
   * Crea una nueva sucursal.
   * @param sucursal Los datos de la nueva sucursal (nombre, direccion, estado).
   * @returns Observable<SucursalEntity>
   */
  create(sucursal: Omit<SucursalEntity, 'id'>): Observable<SucursalEntity> {
    return this.http.post<{data: SucursalEntity}>(`${environment.apiUrl}/sucursales`, sucursal).pipe(
      map(response => response.data)
    );
  }
  
  /**
   * Actualiza una sucursal existente.
   * @param id El ID de la sucursal a actualizar.
   * @param sucursal Los datos a actualizar (pueden ser parciales).
   * @returns Observable<SucursalEntity>
   */
  update(id: number, sucursal: Partial<SucursalEntity>): Observable<SucursalEntity> {
    return this.http.put<{data: SucursalEntity}>(`${environment.apiUrl}/sucursales/${id}`, sucursal).pipe(
      map(response => response.data)
    );
  }
 
  /**
   * "Elimina" (desactiva) una sucursal.
   * @param id El ID de la sucursal a desactivar.
   * @returns Observable<any> (tu backend devuelve un objeto con 'message')
   */
  
  delete(id: number): Observable<{success: boolean}> {
    return this.http.delete<{success: boolean}>(`${environment.apiUrl}/sucursales/${id}`);
  }
  
  /**
   * Restaura (activa) una sucursal.
   * @param id El ID de la sucursal a restaurar.
   * @returns Observable<any> (tu backend devuelve un objeto con 'message')
   */
  restore(id: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/sucursales/${id}/restore`, {}); // El backend no necesita cuerpo para restore
  }

  
  /**
   * Obtiene los detalles de una sucursal específica.
   * @param id El ID de la sucursal.
   * @returns Observable<SucursalEntity>
   */
  show(id: number): Observable<SucursalEntity> {
    return this.http.get<SucursalEntity>(`${environment.apiUrl}/${id}`);
  }
}
