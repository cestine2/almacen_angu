import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PermissionEntity } from '../../domain/entities/PermissionEntity';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  constructor() { }

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/permissions`;

  /**
   * Obtiene todos los permisos disponibles.
   * El backend PermissionController@index devuelve directamente un array de permisos.
   */
  getAllPermissions(): Observable<PermissionEntity[]> {
    return this.http.get<PermissionEntity[]>(this.apiUrl);
    // Si el backend envolviera en 'data':
    // return this.http.get<{ data: PermissionEntity[] }>(this.apiUrl).pipe(map(response => response.data || []));
  }
}
