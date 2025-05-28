import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

import { MovimientoInventarioStore } from '../../../../../stores/MovimientoInventarioStore'; // Ajusta ruta
import { MaterialStore } from '../../../../../stores/MaterialStore';
import { ProductStore } from '../../../../../stores/ProductoStore';
import { SucursalStore } from '../../../../../stores/SucursalStore';
import { MovimientoInventarioListFilters } from '../../../../domain/dtos/MovimientoInventarioListFilters';

// Define un tipo local para los filtros del componente que usa Date para las fechas
interface LocalMovimientoFilters extends Omit<MovimientoInventarioListFilters, 'start_date' | 'end_date'> {
  start_date: Date | null; // Fechas como Date para p-calendar
  end_date: Date | null;   // Fechas como Date para p-calendar
}

@Component({
  selector: 'app-filtro', // Asegúrate que este sea el selector usado en el padre
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PopoverModule,
    ButtonModule,
    DropdownModule,
    CalendarModule
  ],
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss']
})
export class FiltroComponent {
  readonly movimientoStore = inject(MovimientoInventarioStore);
  readonly materialStore = inject(MaterialStore);
  readonly productStore = inject(ProductStore);
  readonly sucursalStore = inject(SucursalStore);

  @ViewChild('popFiltrosMovimiento') pop!: Popover;

  // Usa el nuevo tipo LocalMovimientoFilters para los filtros del formulario
  localFilters!: LocalMovimientoFilters; // Se inicializará en el constructor o ngOnInit
  private panelJustOpened = true;

  motivoOptions = [
    { label: 'Todos los Motivos', value: null },
    { label: 'Entrada', value: 'entrada' as const },
    { label: 'Salida', value: 'salida' as const },
    { label: 'Ajuste', value: 'ajuste' as const }
  ];

  tipoItemOptions = [
    { label: 'Todos los Tipos', value: null },
    { label: 'Material', value: 'Material' as const },
    { label: 'Producto', value: 'Producto' as const }
  ];

  lastItemSearchTerm: string = '';
  maxDateValue = new Date();

  constructor() {
    // Inicializar localFilters con la estructura de LocalMovimientoFilters
    // Los valores se sincronizarán desde el store cuando se muestre el popover.
    this.initializeLocalFiltersEmpty();
  }

  ngOnInit() {
    // La carga de opciones de dropdown se hará en toggle/show
  }

  private initializeLocalFiltersEmpty() {
    // Inicializa con valores que no causen error de tipo,
    // syncLocalFiltersWithStore los sobrescribirá.
    this.localFilters = {
      motivo: null,
      tipo: null,
      material_id: null,
      producto_id: null,
      sucursal_id: null,
      start_date: null, // Date | null
      end_date: null,   // Date | null
    };
  }

  private parseDateString(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;
    const date = new Date(dateString + 'T00:00:00'); // Añadir hora para evitar problemas de UTC/zona horaria local al parsear YYYY-MM-DD
    return isNaN(date.getTime()) ? null : date;
  }

  public toggle(event: Event, target?: HTMLElement) {
    if (this.pop && this.pop.overlayVisible) { // Verifica que this.pop esté definido
      this.pop.hide();
      this.panelJustOpened = true;
    } else if (this.pop) { // Verifica que this.pop esté definido
      this.syncLocalFiltersWithStore();
      this.loadDropdownOptions();
      this.pop.show(event, target);
      this.panelJustOpened = false;
    }
  }

  public hide() {
    if (this.pop) this.pop.hide();
    this.panelJustOpened = true;
  }

  get isPanelVisible(): boolean {
    return this.pop?.overlayVisible || false;
  }

  private syncLocalFiltersWithStore() {
    const storeFilters = this.movimientoStore.filters();
    console.log('[FiltroMovimiento] SYNCING localFilters from store. Store filters:', storeFilters);
    this.localFilters = {
      motivo: storeFilters.motivo,
      tipo: storeFilters.tipo,
      material_id: storeFilters.material_id,
      producto_id: storeFilters.producto_id,
      sucursal_id: storeFilters.sucursal_id,
      start_date: storeFilters.start_date ? this.parseDateString(storeFilters.start_date) : null,
      end_date: storeFilters.end_date ? this.parseDateString(storeFilters.end_date) : null,
    };
    this.handleTipoChangeInternal();
    console.log('[FiltroMovimiento] SYNCED localFilters are now:', this.localFilters);
  }

  private loadDropdownOptions() {
    if (this.sucursalStore.sucursales().length === 0) {
      this.sucursalStore.doList();
    }
    // Considerar cargar materiales/productos si es necesario aquí
  }

  private handleTipoChangeInternal() {
    if (this.localFilters.tipo === 'Material') {
      this.localFilters.producto_id = null;
    } else if (this.localFilters.tipo === 'Producto') {
      this.localFilters.material_id = null;
    }
  }

  onTipoItemChange() {
    this.lastItemSearchTerm = '';
    this.handleTipoChangeInternal();
    // Limpiar el valor del ítem seleccionado ya que el tipo cambió
    if (this.localFilters.tipo === 'Material') {
        // this.localFilters.material_id se mantiene, producto_id se limpió
    } else if (this.localFilters.tipo === 'Producto') {
        // this.localFilters.producto_id se mantiene, material_id se limpió
    } else { // tipo es null (todos)
        this.localFilters.material_id = null;
        this.localFilters.producto_id = null;
    }
  }

  onItemFilter(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastItemSearchTerm = searchTerm;
    const tipoSeleccionado = this.localFilters.tipo;

    if (tipoSeleccionado === 'Material') {
      // Lógica para cargar/filtrar materiales si es server-side
      // this.materialStore.loadMaterialsForDropdown(searchTerm);
    } else if (tipoSeleccionado === 'Producto') {
      // Lógica para cargar/filtrar productos si es server-side
      // this.productStore.loadProductsForDropdown(searchTerm);
    }
  }

  applyFilters() {
    const filtersForStore: MovimientoInventarioListFilters = {
      motivo: this.localFilters.motivo,
      tipo: this.localFilters.tipo,
      material_id: this.localFilters.material_id,
      producto_id: this.localFilters.producto_id,
      sucursal_id: this.localFilters.sucursal_id,
      start_date: this.localFilters.start_date ? this.formatDateToYYYYMMDD(this.localFilters.start_date) : null,
      end_date: this.localFilters.end_date ? this.formatDateToYYYYMMDD(this.localFilters.end_date) : null,
      // No hay 'status' en MovimientoInventarioListFilters
    };

    console.log('[FiltroMovimiento] Applying filters to store:', filtersForStore);
    this.movimientoStore.updateFilters(filtersForStore);
    this.hide();
    this.movimientoStore.closeFiltersPopover();
  }

  clearFiltersAndApply() {
    const defaultStoreFilters: MovimientoInventarioListFilters = {
      motivo: null,
      tipo: null,
      material_id: null,
      producto_id: null,
      sucursal_id: null,
      start_date: null,
      end_date: null,
    };
    this.localFilters = { // Asigna al tipo LocalMovimientoFilters
        ...defaultStoreFilters,
        start_date: null, // Asegura que las fechas sean Date | null
        end_date: null,
    };
    this.lastItemSearchTerm = '';
    console.log('[FiltroMovimiento] Clearing and applying default filters. Local:', this.localFilters, 'For Store:', defaultStoreFilters);
    this.movimientoStore.updateFilters(defaultStoreFilters);
  }

  private formatDateToYYYYMMDD(date: Date | null): string | null {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}