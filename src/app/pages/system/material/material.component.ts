import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Solo si usas algún ngModel aquí (ej. filtro global de tabla)
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext'; // Para el filtro global de la tabla
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield'; // Para el caption de la tabla
import { InputIconModule } from 'primeng/inputicon'; // Para el caption de la tabla
import { ToastModule } from 'primeng/toast'; // Para mensajes
import { MaterialStore } from '../../../../stores/MaterialStore';
import { MaterialEntity } from '../../../domain/entities/MaterialEntity';
import { FiltroComponent } from './filtro/filtro.component';
import { CreateComponent } from "../material/create/create.component";
import { EditComponent } from "../material/edit/edit.component";
import { CategoriaStore } from '../../../../stores/CategoriaStore';
import { ColorStore } from '../../../../stores/ColorStore';
import { ProveedorStore } from '../../../../stores/ProveedorStore';
import { DetalleComponent } from "../material/detalle/detalle.component";

@Component({
  selector: 'app-material',
  imports: [CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToolbarModule,
    TooltipModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    ToastModule, FiltroComponent, CreateComponent, EditComponent, DetalleComponent],
  templateUrl: './material.component.html',
  styleUrl: './material.component.scss'
})

export class MaterialComponent {
  
  store = inject(MaterialStore);
  confirmationService = inject(ConfirmationService)
  categoriaStore = inject(CategoriaStore)
  colorStore = inject(ColorStore)
  proveedorStore = inject(ProveedorStore)

  @ViewChild(FiltroComponent) filterPopover?: FiltroComponent;
  // Para el filtro global de la tabla (frontend)
  globalTableFilterValue: string = '';

  constructor() {}

  ngOnInit() {
    this.store.doList();
    this.categoriaStore.loadCategoriasForDropdown('', 'material');
    this.proveedorStore.doList();
  // this.categoriaStore.loadCategorias(); // Cargar categorías para el dropdown
    this.colorStore.doList();// Carga solo si no hay datos
  // this.categoriaStore.loadCategoriasForDropdown('', 'producto');
  }

  onPageChange(event: any) {
    const newPage = (event.first / event.rows) + 1;
    const newPerPage = event.rows;

    if (this.store.perPage() !== newPerPage) {
      this.store.setPerPage(newPerPage);
    } else if (this.store.currentPage() !== newPage) {
      this.store.setPage(newPage);
    }
  }

  // Filtro Global de la Tabla (frontend)
  onGlobalTableFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.globalTableFilterValue = filterValue;
    table.filterGlobal(filterValue, 'contains');
  }

  clearGlobalTableFilter(table: Table, inputElement: HTMLInputElement) {
    this.globalTableFilterValue = '';
    inputElement.value = '';
    table.filterGlobal('', 'contains');
  }

  // --- MANEJO DE MODALES ---
  toggleFilterPopover(event: Event, target: HTMLElement) {
    if (this.filterPopover) {
      this.filterPopover.toggle(event, target);

    }
  }
  openCreateModal() {
    this.store.openModalCreate();
  }

  openEditModal(material: MaterialEntity) {
    this.store.openModalEdit(material);
  }

   confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de desactivar este material?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.doDelete(id)
    });
  }

  // --- HELPERS PARA LA TABLA ---
  getSeverityForEstado(estado: boolean): 'success' | 'danger' {
    return estado ? 'success' : 'danger';
  }

  getTextForEstado(estado: boolean): string {
    return estado ? 'Activo' : 'Inactivo';
  }


}
  

