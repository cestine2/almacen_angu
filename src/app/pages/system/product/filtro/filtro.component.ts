import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para ngModel
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CategoriaStore } from '../../../../../stores/CategoriaStore';
import { ProductStore } from '../../../../../stores/ProductoStore';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { ProductListFilters } from '../../../../domain/dtos/ProductListFilters';
import { SidebarModule } from 'primeng/sidebar';
import { Popover, PopoverModule } from 'primeng/popover'; 

@Component({
  selector: 'app-filtro',
  imports: [CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
  SidebarModule,
 OverlayPanelModule,
PopoverModule],
  templateUrl: './filtro.component.html',
  styleUrl: './filtro.component.scss'
})
export class FiltroComponent {

  productStore = inject(ProductStore);
  categoriaStore = inject(CategoriaStore);
  // sucursalStore = inject(SucursalStore);
  @ViewChild('popFiltrosProducto') pop!: Popover;

  // Copia local de los filtros para el formulario del modal
  // Se inicializan con los filtros actuales del store cuando se abre el modal (o en ngOnInit)
  localFilters: ProductListFilters = { ...this.productStore.filters() };
  modalJustOpened = true;
  panelJustOpened = true;
  // Opciones para el dropdown de estado (puedes moverlo a un servicio/constante si se usa en más sitios)
  statusOptions = [
    { label: 'Activos', value: 'active' },
    { label: 'Todos', value: 'all' }
    // Podrías añadir una opción { label: 'Sin Filtro de Estado', value: null } si quieres permitirlo
  ];
  lastCategoriaSearchTerm: string = '';

  constructor() {
    // Podríamos usar un effect para actualizar localFilters si los filtros del store cambian mientras el modal está cerrado,
    // pero para este caso, cargar al abrir o en ngOnInit es usualmente suficiente.
  }

  ngOnInit() {

    this.syncLocalFiltersWithStore();
  }

 get isVisible(): boolean {
  const storeIsVisible = this.productStore.isOpenFilters();
  if (storeIsVisible && this.modalJustOpened) {
    this.syncLocalFiltersWithStore(); // Sincroniza al abrir
    this.modalJustOpened = false;     // Evita resincronizaciones innecesarias mientras está abierto
  } else if (!storeIsVisible && !this.modalJustOpened) {
    // El modal se está cerrando o ya está cerrado, prepara para la próxima apertura
    this.modalJustOpened = true;
  }
  return storeIsVisible;
}

  public show(event: Event, target: HTMLElement) {
    this.syncLocalFiltersWithStore(); // Sincroniza filtros al mostrar
    this.categoriaStore.loadCategoriasForDropdown('', 'producto'); // Carga inicial de categorías
    this.pop.show(event, target);
    this.panelJustOpened = false;
  }
 public hide() {
    this.pop.hide();
    this.panelJustOpened = true; // Prepara para la próxima apertura
  }
  get isPanelVisible(): boolean {
    return this.pop?.overlayVisible || false; // Verifica si el overlay está realmente visible
  }


 private syncLocalFiltersWithStore() {
  console.log('SYNCING localFilters from store. Current store filters:', this.productStore.filters());
  this.localFilters = { ...this.productStore.filters() };
  console.log('SYNCED localFilters are now:', this.localFilters);
}

  // Método para manejar el filtro del dropdown de Categorías dentro del modal de filtros de PRODUCTO
  onCategoriaFilterInModal(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastCategoriaSearchTerm = searchTerm; // Para el template emptyfilter
    console.log('[FiltroProducto] onCategoriaFilterInModal - SearchTerm:', searchTerm);
    this.categoriaStore.loadCategoriasForDropdown(searchTerm, 'producto'); // Siempre tipo 'producto'
  }

  onCategoriaFilterInPanel(event: { filter?: string }) { // Cambia el nombre del método
    const searchTerm = event.filter?.trim() || '';
    this.lastCategoriaSearchTerm = searchTerm;
    this.categoriaStore.loadCategoriasForDropdown(searchTerm, 'producto');
  }

   applyFilters() {
    const filtersToApply: ProductListFilters = {
      ...this.localFilters,
      nombre: this.localFilters.nombre?.trim() || undefined,
      talla: this.localFilters.talla?.trim() || undefined,
    };
    this.productStore.updateFilters(filtersToApply);
    this.hide(); // Cierra el OverlayPanel
    // Ya no se usa productStore.closeModalFilters() directamente aquí,
    // la visibilidad del overlay panel la maneja el propio componente o el padre.
    // Pero el store debe saber que los filtros ya no están "activos para edición" si es necesario.
    // Por simplicidad, asumimos que al cerrar el overlay, los filtros se aplicaron.
  }
   
  clearFiltersAndApply() {
    // Define tus filtros por defecto para "limpiar"
    const defaultFilters: ProductListFilters = {
      status: 'active',
      nombre: undefined,
      categoria_id: null,
      // sucursal_id: null,
      talla: undefined,
    };
    this.localFilters = { ...defaultFilters }; // Actualiza los filtros locales del modal
    this.productStore.updateFilters(this.localFilters); // Aplica al store
    // No necesitas cerrar el modal aquí, el usuario podría querer seguir ajustando. O sí, según UX.
    // this.productStore.closeModalFilters();
  }

  onModalHide() {
    // Este método es llamado por el (onHide) del p-dialog
    this.productStore.closeModalFilters();
    // Al ocultar, resincronizamos los filtros locales con los del store
    // para descartar cambios no aplicados en el modal.
    this.modalJustOpened = true; // Importante: Resetear al cerrar explícitamente
                             // para que la próxima vez que se abra, se sincronicen los filtros.
  }
  onPanelHide() {
    // Este método es llamado por el (onHide) del p-dialog
    this.productStore.closeModalFilters();
    // Al ocultar, resincronizamos los filtros locales con los del store
    // para descartar cambios no aplicados en el modal.
    this.modalJustOpened = true; // Importante: Resetear al cerrar explícitamente
                             // para que la próxima vez que se abra, se sincronicen los filtros.
  }
  
}
