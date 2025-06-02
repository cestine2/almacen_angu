import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, TitleCasePipe, CurrencyPipe } from '@angular/common'; // TitleCasePipe y CurrencyPipe
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { InventarioStore } from '../../../../stores/InventarioStore';
import { FiltroComponent } from './filtro/filtro.component';
import { InventarioEntity } from '../../../domain/entities/InventarioEntity';
import { MaterialStore } from '../../../../stores/MaterialStore';
import { ProductStore } from '../../../../stores/ProductoStore';
import { SucursalStore } from '../../../../stores/SucursalStore';

@Component({
  selector: 'app-inventory',
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
    ToastModule,
    TitleCasePipe,
    FiltroComponent,
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent {
 
  store = inject(InventarioStore);
  confirmationService = inject(ConfirmationService);
  materialStore = inject(MaterialStore)
  productStore = inject(ProductStore)
  sucursalStore = inject(SucursalStore);

  @ViewChild(FiltroComponent) filterPopover?: FiltroComponent;

  // Para el filtro global de la tabla (frontend)
  globalTableFilterValue: string = '';

  constructor() {}

  ngOnInit() {
    this.store.doList(); // Carga inicial de registros de inventario
    this.materialStore.doList();
    this.sucursalStore.doList();
    // Cargar Productos para el dropdown de filtro
    this.productStore.doList();
    
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

  // --- MANEJO DE MODALES Y POPOVER DE FILTROS ---
  toggleFilterPopover(event: Event, target: HTMLElement) {
    if (this.filterPopover) {
      this.filterPopover.toggle(event, target);
    }
  }


  // --- HELPERS PARA LA TABLA ---
  getSeverityForEstado(estado: boolean): 'success' | 'danger' {
    return estado ? 'success' : 'danger';
  }

  getTextForEstado(estado: boolean): string {
    return estado ? 'Activo' : 'Inactivo';
  }

  // Helper para mostrar el nombre del ítem (Material o Producto)
  getItemName(inventario: InventarioEntity): string {
    if (inventario.item) { // La propiedad 'item' que definimos en InventarioResource es clave
      return inventario.item.nombre;
    }
    if (inventario.tipo === 'Material' && inventario.material) {
      return inventario.material.nombre;
    }
    if (inventario.tipo === 'Producto' && inventario.producto) {
      return inventario.producto.nombre;
    }
    return inventario.tipo === 'Material' ? `Material ID: ${inventario.material_id}` : `Producto ID: ${inventario.producto_id}`;
  }
  
  
}
