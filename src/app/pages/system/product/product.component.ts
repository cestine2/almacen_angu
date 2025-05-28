import { CommonModule, TitleCasePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { CreateComponent } from './create/create.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ProductStore } from '../../../../stores/ProductoStore';
import { ProductEntity } from '../../../domain/entities/ProductEntity';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CategoriaStore } from '../../../../stores/CategoriaStore';
import { TooltipModule } from 'primeng/tooltip';
import { FiltroComponent } from './filtro/filtro.component';
import { EditComponent } from "../product/edit/edit.component";
import { ColorStore } from '../../../../stores/ColorStore';


@Component({
  selector: 'app-product',
  imports: [CommonModule,
    FormsModule, // Para [(ngModel)]
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule,
    DropdownModule,
    TooltipModule,
    FiltroComponent // Para mostrar los toasts (asumimos que <p-toast> está en un componente padre)
    ,
    CreateComponent, EditComponent],
  providers: [],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit{

store = inject(ProductStore)
categoriaStore = inject(CategoriaStore)
colorStore = inject(ColorStore)
// sucursalStore = inject(SucursalStore)
confirmationService = inject(ConfirmationService)

 @ViewChild(FiltroComponent) filterOverlayPanel?: FiltroComponent;
constructor() {}

ngOnInit() {
  this.store.doList();
  console.log('[ProductComponent] ngOnInit - Loading initial categoria dropdown options for type: producto');
  this.categoriaStore.loadCategoriasForDropdown('', 'producto');
  // this.categoriaStore.loadCategorias(); // Cargar categorías para el dropdown
  this.colorStore.doList();// Carga solo si no hay datos
  // this.categoriaStore.loadCategoriasForDropdown('', 'producto');
}

onPageChange(event: any) {
  
    console.log('onPageChange llamado', event); // Log para verificar el evento
    // Calcula la nueva página (base 1) usando first y rows
    const newPage = (event.first / event.rows) + 1;
    const newPerPage = event.rows; // rows sí existe en el evento

    console.log('Calculando newPage:', newPage, 'newPerPage:', newPerPage); // Log corregido

    // Llama a los métodos del store para actualizar el estado y disparar la carga
    this.store.setPage(newPage);
    this.store.setPerPage(newPerPage);
    // REMOVER: No llamar doList() aquí explícitamente, setPage/setPerPage lo hacen ahora
  }

 openFiltersModal() {
    this.store.openModalFilters();
  }

// Método para mostrar/ocultar el OverlayPanel
  toggleFilterPanel(event: Event, target: HTMLElement) {
    if (this.filterOverlayPanel) {
      if (this.filterOverlayPanel.isPanelVisible) { // Si ya está visible, lo oculta
        this.filterOverlayPanel.hide();
      } else {
        this.filterOverlayPanel.show(event, target); // Lo muestra anclado al target
      }
    }
  }

editProduct(product: ProductEntity) {
       this.store.openModalEdit(product);
   }

onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}

 // Método para determinar la severidad del Tag basado en el estado (boolean)
   getSeverity(estado: boolean): 'success' | 'danger' | undefined {
     return estado ? 'success' : 'danger';
   }

   // Método para obtener el texto del estado
   getStatusText(estado: boolean): string {
       return estado ? 'Activo' : 'Inactivo';
   }

   openEditModal(product: ProductEntity) {
    this.store.openModalEdit(product);
  }
  openCreateModal() {
    this.store.openModalCreate();
  }


confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de desactivar esta producto?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.doDelete(id)
    });
  }
}

