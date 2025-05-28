import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ColorEntity } from '../../domain/entities/ColorEntity';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  http = inject(HttpClient)
  constructor() { }

  // list(): Observable<ColorEntity[]>{
  //   return this.http.get<ColorEntity[]>(`${environment.apiUrl}/colores`)
  // }
  list(): Observable<ColorEntity[]> {
    return this.http.get<{data: ColorEntity[]}>(`${environment.apiUrl}/colores?status=all`).pipe(
      map(response => response.data)
    );
  }
  // store(data : any){
  //   return this.http.post
  // }
  create(colorData: Omit<ColorEntity, 'id'>): Observable<ColorEntity> {
    return this.http.post<{data: ColorEntity}>(`${environment.apiUrl}/colores`,colorData).pipe(
      map(response => response.data)
    );
  }
  //------------------------------------------------------------------------------------------------
  update(id: number, colorData: Partial<ColorEntity>): Observable<ColorEntity> {
    return this.http.put<{data: ColorEntity}>(`${environment.apiUrl}/colores/${id}`, colorData).pipe(
      map(response => response.data)
    );
  }

  delete(id: number): Observable<{success: boolean}> {
    return this.http.delete<{success: boolean}>(`${environment.apiUrl}/colores/${id}`);
  }
  

 

  restore(id: number): Observable<boolean> {
    return this.http.post<{success: boolean}>(`${environment.apiUrl}/colores/${id}/restore`, {}).pipe(
      map(response => response.success)
    );
  }
}
