import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CategoryEntity } from '../../../domain/entities/CategoryEntity';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CategoriaStore } from '../../../../stores/CategoriaStore';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CreateComponent } from "../categoria/create/create.component";
import { patchState } from '@ngrx/signals';
import { EditComponent } from "../categoria/edit/edit.component";
import { TooltipModule } from 'primeng/tooltip';
import { DetalleComponent } from "./detalle/detalle.component";
import { DropdownModule } from 'primeng/dropdown';


@Component({
  selector: 'app-categoria',
  imports: [CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    TooltipModule,
    DropdownModule,
    ToastModule, CreateComponent, EditComponent, DetalleComponent],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.scss'
})
export class CategoriaComponent {
  
  store = inject(CategoriaStore)
  confirmationService = inject(ConfirmationService);

  searchTerm: string = '';

  ngOnInit() {
    this.store.loadCategorias();
  }

  // getSeverity(estado: boolean): 'success' | 'danger' {
  //   return estado ? 'success' : 'danger';
  // }

  onPageChange(event: any) {
    // this.store.loadCategorias(event.page + 1);
    console.log('Objeto event de onPageChange:', event); // <--- Añade este log
  // const newPage = event.page + 1;
  const newPage = (event.first / event.rows) + 1;
  const newPerPage = event.rows;
    console.log('Calculando newPage:', newPage, 'newPerPage:', newPerPage);
  this.store.setCurrentPage(newPage);
  this.store.setPerPage(newPerPage);

  // Pasa los nuevos valores explícitamente
  this.store.loadCategorias(newPage, newPerPage); // <-- ¡Aquí está el error!
  // console.log('onPageChange llamado', event)
    
  }


  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de desactivar esta categoría?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.doDelete(id)
    });
  }

  handleSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    // Implementar búsqueda según tu API
    // this.store.setSearchTerm(value);
  }

  getSeverity(estado: boolean): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    return estado ? 'success' : 'danger';
  }

  getSeverityForTipo(tipo: 'producto' | 'material' | string): 'success' | 'danger' | 'info' | 'warn' { // 'info' como fallback
    if (tipo === 'producto') {
      return 'info'; // Verde para Producto
    } else if (tipo === 'material') {
      return 'warn';  // Rojo para Material
    }
    return 'info'; // Un color neutral si el tipo no es ninguno de los esperados
  }
  
}
