import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe, DecimalPipe } from '@angular/common'; // Pipes
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag'; // Para el motivo del movimiento
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
// No ConfirmDialogModule ya que los movimientos no se eliminan/restauran individualmente
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast'; //
import { FiltroComponent } from './filtro/filtro.component';
import { MovimientoInventarioStore } from '../../../../stores/MovimientoInventarioStore';
import { MovimientoInventarioEntity } from '../../../domain/entities/MovimientoInventarioEntity';
import { CreateComponent } from "../movement/create/create.component";


@Component({
  selector: 'app-movement',
  imports: [CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToolbarModule,
    TooltipModule,
    // ConfirmDialogModule, // No necesario
    IconFieldModule,
    InputIconModule,
    ToastModule,
    TitleCasePipe,
    DatePipe,
    DecimalPipe, FiltroComponent, CreateComponent],
  templateUrl: './movement.component.html',
  styleUrl: './movement.component.scss'
})
export class MovementComponent {
  readonly store = inject(MovimientoInventarioStore);

  @ViewChild(FiltroComponent) filterPopover?: FiltroComponent;

  globalTableFilterValue: string = '';

  constructor() {}

  ngOnInit() {
    this.store.doList(); // Carga inicial de movimientos
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

  toggleFilterPopover(event: Event, target: HTMLElement) {
    if (this.filterPopover) {
      this.filterPopover.toggle(event, target);
    }
  }

  openRegisterMovimientoModal() {
    this.store.openModalRegisterMovimiento();
  }

  // No hay openEditModal, confirmDeleteOrRestore para movimientos individuales

  // --- HELPERS PARA LA TABLA ---
  // Para mostrar el nombre del ítem (Material o Producto)
  getItemNameForDisplay(movimiento: MovimientoInventarioEntity): string {
    if (movimiento.item_asociado && movimiento.item_asociado.nombre) {
      return movimiento.item_asociado.nombre;
    }
    if (movimiento.tipo === 'Material' && movimiento.material && movimiento.material.nombre) {
      return movimiento.material.nombre;
    }
    if (movimiento.tipo === 'Producto' && movimiento.producto && movimiento.producto.nombre) {
      return movimiento.producto.nombre;
    }
    return movimiento.tipo === 'Material' ? `Mat. ID: ${movimiento.material_id || 'N/A'}` : `Prod. ID: ${movimiento.producto_id || 'N/A'}`;
  }

  // Para el tag del motivo del movimiento
  getSeverityForMotivo(motivo: 'entrada' | 'salida' | 'ajuste'): 'success' | 'danger' | 'info' | 'warn' {
    switch (motivo) {
      case 'entrada':
        return 'success';
      case 'salida':
        return 'danger';
      case 'ajuste':
        return 'info'; // O 'warning' si prefieres
      default:
        return 'info'; // Un color por defecto
    }
  }
}
