import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Popover, PopoverModule } from 'primeng/popover'; // Usaremos Popover
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MaterialStore } from '../../../../../stores/MaterialStore';
import { CategoriaStore } from '../../../../../stores/CategoriaStore';
import { ProveedorStore } from '../../../../../stores/ProveedorStore';
import { MaterialListFilters } from '../../../../domain/dtos/MaterialListFilters';

@Component({
  selector: 'app-filtro',
  imports: [CommonModule,
    FormsModule,
    PopoverModule, // Módulo Popover
    ButtonModule,
    InputTextModule,
    DropdownModule,],
  templateUrl: './filtro.component.html',
  styleUrl: './filtro.component.scss'
})
export class FiltroComponent {

  materialStore = inject(MaterialStore);
  categoriaStore = inject(CategoriaStore);
  proveedorStore = inject(ProveedorStore);

  @ViewChild('popFiltrosMaterial') pop!: Popover;

  localFilters: MaterialListFilters = { ...this.materialStore.filters() };

  panelJustOpened = true;

  statusOptions = [
    { label: 'Activos', value: 'active' as const },
    { label: 'Todos', value: 'all' as const }
  ];

  lastCategoriaSearchTerm: string = '';
  // lastProveedorSearchTerm: string = ''; // Si implementas búsqueda para proveedores

  constructor() {}

  ngOnInit() {
    // La carga inicial de opciones para dropdowns se hará en el método show()
    // para asegurar que se carguen cuando el popover se vaya a mostrar.
  }

  // Método público para ser llamado por el componente padre
  public toggle(event: Event, target?: HTMLElement) {
    if (this.pop.overlayVisible) {
      this.pop.hide();
      this.panelJustOpened = true;
    } else {
      this.syncLocalFiltersWithStore();
      // Cargar opciones al mostrar
      // this.categoriaStore.loadCategoriasForDropdown('', 'material'); // Solo tipo MATERIAL
      // // Considera una carga similar para proveedores si es una lista larga y filtrable
      // // Por ahora, asumimos que proveedorStore.proveedores() tiene la lista para el dropdown.
      // // Si no, llama a un método de carga aquí: this.proveedorStore.loadProveedoresForDropdown('');
      // if (this.proveedorStore.proveedores().length === 0) { // Carga proveedores si no están
      //     this.proveedorStore.doList(); // O un método específico para dropdowns
      // }
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
    this.localFilters = { ...this.materialStore.filters() };
  }

  onCategoriaFilterInPanel(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastCategoriaSearchTerm = searchTerm;
    this.categoriaStore.loadCategoriasForDropdown(searchTerm, 'material'); // Filtra por tipo MATERIAL
  }

  // Si necesitas búsqueda server-side para Proveedores en el filtro:
  // onProveedorFilterInPanel(event: { filter?: string }) {
  //   const searchTerm = event.filter?.trim() || '';
  //   this.lastProveedorSearchTerm = searchTerm;
  //   // this.proveedorStore.loadProveedoresForDropdown(searchTerm); // Necesitarías este método
  // }

  applyFilters() {
    const filtersToApply: MaterialListFilters = {
      ...this.localFilters,
      nombre: this.localFilters.nombre?.trim() || undefined,
      cod_articulo: this.localFilters.cod_articulo?.trim() || undefined,
    };
    this.materialStore.updateFilters(filtersToApply);
    this.hide();
    this.materialStore.closeModalFilters(); // Notifica al store que el panel de filtros se cerró
  }

  clearFiltersAndApply() {
    const defaultFilters: MaterialListFilters = {
      status: 'active',
      categoria_id: null,
      proveedor_id: null,
      cod_articulo: undefined,
      nombre: undefined,
    };
    this.localFilters = { ...defaultFilters };
    this.lastCategoriaSearchTerm = '';
    // this.lastProveedorSearchTerm = '';
    this.materialStore.updateFilters(this.localFilters);
    // No cerramos el popover aquí, el usuario puede querer ver el resultado
  }


}
