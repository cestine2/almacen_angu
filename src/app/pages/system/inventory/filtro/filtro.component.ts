import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext'; 
import { InventarioStore } from '../../../../../stores/InventarioStore';
import { MaterialStore } from '../../../../../stores/MaterialStore';
import { ProductStore } from '../../../../../stores/ProductoStore';
import { SucursalStore } from '../../../../../stores/SucursalStore';
import { InventarioListFilters } from '../../../../domain/dtos/InventarioListFilters';

@Component({
  selector: 'app-filtro',
  imports: [CommonModule,
    FormsModule,
    PopoverModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,],
  templateUrl: './filtro.component.html',
  styleUrl: './filtro.component.scss'
})
export class FiltroComponent {


  inventarioStore = inject(InventarioStore);
  materialStore = inject(MaterialStore);   // Para opciones de materiales
  productStore = inject(ProductStore);      // Para opciones de productos
  sucursalStore = inject(SucursalStore);   


  @ViewChild('popFiltrosInventario') pop!: Popover;

  localFilters: InventarioListFilters = { ...this.inventarioStore.filters() };
  panelJustOpened = true;

  // Opciones para dropdown de estado
  statusOptions = [
    { label: 'Activos', value: 'active' as const },
    { label: 'Todos', value: 'all' as const }
  ];

  // Opciones para dropdown de tipo de ítem
  tipoItemOptions = [
    { label: 'Todos los Tipos', value: null }, // Opción para no filtrar por tipo
    { label: 'Material', value: 'Material' as const },
    { label: 'Producto', value: 'Producto' as const }
  ];

  // Para los templates emptyfilter de los dropdowns de ítems
  lastItemSearchTerm: string = '';

  constructor() {}

  ngOnInit() {
    // La carga de opciones para Material, Producto, Sucursal se hará en el método show/toggle
  }

  public toggle(event: Event, target?: HTMLElement) {
    if (this.pop.overlayVisible) {
      this.pop.hide();
      this.panelJustOpened = true;
    } else {
      this.syncLocalFiltersWithStore();
      // Cargar opciones para dropdowns al mostrar el popover
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
    this.localFilters = { ...this.inventarioStore.filters() };
    // Si el tipo cambia, resetea el material_id o producto_id no relevante
    if (this.localFilters.tipo === 'Material') {
      this.localFilters.producto_id = null;
    } else if (this.localFilters.tipo === 'Producto') {
      this.localFilters.material_id = null;
    }
  }

  private loadDropdownOptions() {
    // Cargar Sucursales
    // Asumiendo que SucursalStore tiene un método para cargar todas las activas para dropdowns
    // o que su `doList` trae lo necesario.
    if (this.sucursalStore.sucursales().length === 0) { // Carga solo si no hay datos
        // this.sucursalStore.loadAllActiveSucursalesForDropdown(); // Método ideal
        this.sucursalStore.doList(); // O ajusta doList para traer todos los activos
    }
     if (this.materialStore.materiales().length === 0) { // O una signal específica como `materialesDropdownOptions`
        console.log('[FiltroInventario] Cargando materiales para dropdown...');
        // Esto cargará la lista paginada principal de materiales. Para un filtro,
        // es mejor un método que traiga una lista no paginada de ítems activos.
        this.materialStore.doList(); // Considera crear un `loadMaterialsForDropdown` en MaterialStore
    }

    // Cargar Productos para el dropdown de filtro
    if (this.productStore.products().length === 0) {
      console.log('[FiltroInventario] Cargando productos para dropdown...');
      this.productStore.doList(); // Similar a materiales, considera un método específico en ProductStore
    }


  }

  // Cuando el tipo de ítem (Material/Producto) cambia en el filtro
  onTipoItemChange() {
    this.lastItemSearchTerm = ''; // Resetea el término de búsqueda del ítem
    if (this.localFilters.tipo === 'Material') {
      this.localFilters.producto_id = null; // Limpia el ID del producto
      // Opcional: Cargar materiales si no están
      // if(this.materialStore.materiales().length === 0) this.materialStore.doList();
    } else if (this.localFilters.tipo === 'Producto') {
      this.localFilters.material_id = null; // Limpia el ID del material
      // Opcional: Cargar productos si no están
      // if(this.productStore.products().length === 0) this.productStore.doList();
    } else { // 'Todos los Tipos' o null
      this.localFilters.producto_id = null;
      this.localFilters.material_id = null;
    }
  }

  // Métodos onFilter para dropdowns de Material y Producto (si usas búsqueda server-side para ellos)
  onMaterialFilter(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastItemSearchTerm = searchTerm;
    // Llama a un método en MaterialStore para cargar materiales filtrados por nombre
    // this.materialStore.loadMaterialsForDropdown(searchTerm);
  }

  onProductoFilter(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastItemSearchTerm = searchTerm;
    // Llama a un método en ProductStore para cargar productos filtrados por nombre
    // this.productStore.loadProductsForDropdown(searchTerm);
  }


  applyFilters() {
    const filtersToApply: InventarioListFilters = { ...this.localFilters };

    // Asegurar que solo se envíe material_id o producto_id, no ambos, según el tipo.
    if (filtersToApply.tipo === 'Material') {
      filtersToApply.producto_id = null;
    } else if (filtersToApply.tipo === 'Producto') {
      filtersToApply.material_id = null;
    } else { // Si tipo es 'Todos' o null, no deberíamos filtrar por material_id o producto_id
             // a menos que el backend lo soporte específicamente (ej. buscar un ID de material sin importar el tipo).
             // Por ahora, los limpiamos si el tipo es 'todos'.
      filtersToApply.material_id = null;
      filtersToApply.producto_id = null;
    }

    console.log('[FiltroInventario] Applying filters:', filtersToApply);
    this.inventarioStore.updateFilters(filtersToApply);
    this.hide();
    this.inventarioStore.closeFiltersPopover();
  }

  clearFiltersAndApply() {
    const defaultFilters: InventarioListFilters = {
      status: 'active',
      tipo: null,
      material_id: null,
      producto_id: null,
      sucursal_id: null,
    };
    this.localFilters = { ...defaultFilters };
    this.lastItemSearchTerm = '';
    console.log('[FiltroInventario] Clearing and applying default filters:', this.localFilters);
    this.inventarioStore.updateFilters(this.localFilters);
  }
}
