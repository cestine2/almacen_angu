import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { UserEntity } from '../../../domain/entities/UserEntity';
import { UserStore } from '../../../../stores/UserStore';
import { UserListFilters } from '../../../domain/dtos/UserListFilters';
import { CreateComponent } from "../user/create/create.component";
import { EditComponent } from './edit/edit.component';

@Component({
  selector: 'app-user',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToolbarModule,
    TooltipModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    CreateComponent,
    EditComponent
],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

  store = inject(UserStore);
  confirmationService = inject(ConfirmationService);

  // Filtros para el backend (en línea)
  filterNombreBackend: string | undefined = this.store.filters().nombre;
  filterStatusBackend: 'active' | 'all' | 'inactive' | null = this.store.filters().status || 'active';

  statusFilterOptions = [
    { label: 'Activos', value: 'active' as const },
    { label: 'Inactivos', value: 'inactive' as const },
    { label: 'Todos', value: 'all' as const }
  ];

  // Subject y Subscription para debounce del filtro de nombre
  private nombreFilterSubject = new Subject<string | undefined>();
  private nombreFilterSubscription?: Subscription;

  // Para el filtro global de la tabla (frontend)
  globalTableFilterValue: string = '';


  constructor() {}

  ngOnInit() {
    this.store.loadUsers(); // Carga inicial de usuarios

    // Configurar debounce para el filtro de nombre
    this.nombreFilterSubscription = this.nombreFilterSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(nombre => {
      this.applyBackendFilters();
    });

    // Sincronizar filtros locales con el store al inicio
    const currentFilters = this.store.filters();
    this.filterNombreBackend = currentFilters.nombre;
    this.filterStatusBackend = currentFilters.status || 'active';
  }

  ngOnDestroy() {
    this.nombreFilterSubscription?.unsubscribe();
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

  // --- Filtros para Backend (en línea) ---
  onFilterNombreInputChange(eventOrValue: Event | string | undefined) {
    let nombre: string | undefined;
    if (typeof eventOrValue === 'string' || eventOrValue === undefined) {
        nombre = eventOrValue;
    } else {
        nombre = (eventOrValue.target as HTMLInputElement).value;
    }
    this.filterNombreBackend = nombre;
    this.nombreFilterSubject.next(nombre?.trim() !== '' ? nombre?.trim() : undefined);
  }

  onFilterStatusChange(status: 'active' | 'all' | 'inactive' | null) {
    this.filterStatusBackend = status;
    this.applyBackendFilters(); // Aplica filtros inmediatamente al cambiar el estado
  }

  applyBackendFilters() {
    const filtersToApply: UserListFilters = {
      nombre: this.filterNombreBackend?.trim() || undefined,
      status: this.filterStatusBackend
    };
    this.store.setFilters(filtersToApply);
  }

  clearBackendFilters(nombreInput: HTMLInputElement) {
    nombreInput.value = '';
    this.filterNombreBackend = undefined;
    this.filterStatusBackend = 'active'; // Reset al default
    this.applyBackendFilters();
  }

  // --- Filtro Global de la Tabla (frontend) ---
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
  openCreateUserModal() {
    this.store.openModalCreate();
  }

  openEditUserModal(user: UserEntity) {
    this.store.openModalEdit(user);
  }

  // --- ACCIONES CRUD (Delete/Restore) ---
  confirmDeleteOrRestore(user: UserEntity) {
    const action = user.estado ? 'desactivar' : 'restaurar';
    this.confirmationService.confirm({
      message: `¿Estás seguro de ${action} el usuario '${user.nombre}'?`,
      header: `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      icon: user.estado ? 'pi pi-exclamation-triangle' : 'pi pi-info-circle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        if (user.estado) {
          this.store.doDelete(user.id);
        } else {
          this.store.doRestore(user.id);
        }
      }
    });
  }

  // --- HELPERS PARA LA TABLA ---
  getSeverityForEstado(estado: boolean): 'success' | 'danger' {
    return estado ? 'success' : 'danger';
  }

  getTextForEstado(estado: boolean): string {
    return estado ? 'Activo' : 'Inactivo';
  }

  // Helper para mostrar los nombres de los roles
  getRoleNames(user: UserEntity): string {
    // Basado en UserEntity: roles?: RoleEntity | null; (asumiendo un solo rol principal)
    if (user.roles && user.roles.name) {
      return user.roles.name;
    }
    // Si 'roles' fuera un array RoleEntity[]
    // if (user.roles && user.roles.length > 0) {
    //   return user.roles.map(r => r.name).join(', ');
    // }
    return 'N/A';
  }
}
