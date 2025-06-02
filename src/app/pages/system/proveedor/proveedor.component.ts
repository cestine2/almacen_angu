import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para ngModel en los filtros
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Para confirmaciones
import { ConfirmationService } from 'primeng/api';
import { ProveedorStore } from '../../../../stores/ProveedorStore';
import { ProveedorEntity } from '../../../domain/entities/ProveedorEntity';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { CreateComponent } from "../proveedor/create/create.component";
import { EditComponent } from '../proveedor/edit/edit.component';


@Component({
  selector: 'app-proveedor',
  imports: [CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToolbarModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    CreateComponent,
    EditComponent
  ],
  templateUrl: './proveedor.component.html',
  styleUrl: './proveedor.component.scss'
})
export class ProveedorComponent {

  store = inject(ProveedorStore);
  confirmationService = inject(ConfirmationService);
  globalTableFilterValue: string = '';

  // Para el input de búsqueda de nombre (que ahora filtra en backend)
  // Se inicializa desde el store para mantener el estado si se navega y vuelve
  filterNombreBackend: string | undefined = this.store.filters().nombre;

  // Para el dropdown de estado (filtro backend)
  filterStatusBackend: 'active' | 'all' | null = this.store.filters().status || 'active';

  statusFilterOptions = [
    { label: 'Activos', value: 'active' as const }, // Usar 'as const' para tipos literales
    { label: 'Inactivo', value: 'inactive' as const },
    { label: 'Todos', value: 'all' as const },
    
  ];

  // Subject y Subscription para debounce del filtro de nombre
  private nombreFilterSubject = new Subject<string | undefined>();
  private nombreFilterSubscription?: Subscription;

  constructor() {}

  ngOnInit() {
    this.store.doList(); // Carga inicial

    // Configurar debounce para el filtro de nombre
    this.nombreFilterSubscription = this.nombreFilterSubject.pipe(
      debounceTime(500), // Espera 500ms después de que el usuario deja de escribir
      distinctUntilChanged() // Solo emite si el valor realmente cambió
    ).subscribe(nombre => {
      this.store.updateFilters({ nombre: nombre, status: this.filterStatusBackend });
    });

    // Sincronizar el input con el estado del store si este cambia por otra vía (ej. al limpiar filtros)
    // Esto es opcional y puede hacerse más reactivo con effects en el store o signals aquí.
    // Por ahora, la inicialización y el ngModel deberían ser suficientes.
  }

  // ngOnDestroy() {
  //   // Limpiar la suscripción del debounce
  //   if (this.nombreFilterSubscription) {
  //     this.nombreFilterSubscription.unsubscribe();
  //   }
  // }

  onPageChange(event: any) {
    const newPage = (event.first / event.rows) + 1;
    const newPerPage = event.rows;

    if (this.store.perPage() !== newPerPage) {
      this.store.setPerPage(newPerPage);
    } else if (this.store.currentPage() !== newPage) {
      this.store.setPage(newPage);
    }
  }


  // --- Manejo de Filtros (Backend) ---
  onFilterNombreInputChange(event: Event) {
    const nombre = (event.target as HTMLInputElement).value;
    this.filterNombreBackend = nombre; // Actualiza la propiedad bindeada con ngModel
    this.nombreFilterSubject.next(nombre.trim() !== '' ? nombre.trim() : undefined);
  }

  onFilterStatusChange(status: 'active' | 'all' | null) {
    this.filterStatusBackend = status;
    // Aplicar inmediatamente o esperar a que cambie el nombre también?
    // Por consistencia, podemos aplicar todos los filtros juntos.
    // El debounce del nombre se encargará de llamar a updateFilters.
    // Si el usuario solo cambia el status, necesitamos una forma de aplicar.
    this.store.updateFilters({ nombre: this.filterNombreBackend, status: this.filterStatusBackend });
  }

  clearAllBackendFilters(inputNombre: HTMLInputElement) {
    inputNombre.value = ''; // Limpia el input visualmente
    this.filterNombreBackend = undefined;
    this.filterStatusBackend = 'active'; // Reset al default
    this.store.updateFilters({ nombre: undefined, status: 'active' });
  }



  // --- MANEJO DE MODALES (Crear y Editar) ---
  openCreateModal() {
    this.store.openModalCreate();
  }

  openEditModal(proveedor: ProveedorEntity) {
    this.store.openModalEdit(proveedor);
  }

  // confirmDeleteOrRestore(proveedor: ProveedorEntity) {
  //   const action = proveedor.estado ? 'desactivar' : 'restaurar';
  //   this.confirmationService.confirm({
  //     message: `¿Estás seguro de ${action} el proveedor '${proveedor.nombre}'?`,
  //     header: `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}`,
  //     icon: proveedor.estado ? 'pi pi-exclamation-triangle' : 'pi pi-info-circle',
  //     acceptLabel: 'Sí',
  //     rejectLabel: 'No',
  //     accept: () => {
  //       if (proveedor.estado) {
  //         this.store.doDelete(proveedor.id);
  //       } else {
  //         this.store.doRestore(proveedor.id);
  //       }
  //     }
  //   });
  // }
  confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de desactivar este proveedor?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.doDelete(id)
    });
  }
  onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

     // --- HELPERS PARA LA TABLA ---
  getSeverityForEstado(estado: boolean): 'success' | 'danger' {
    return estado ? 'success' : 'danger';
  }

  getTextForEstado(estado: boolean): string {
    return estado ? 'Activo' : 'Inactivo';
  }
}
