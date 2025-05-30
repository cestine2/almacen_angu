import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para el filtro global de la tabla si se usa
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';import { RoleStore } from '../../../../stores/RoleStore';
import { RoleEntity } from '../../../domain/entities/RoleEntity';
import { CreateComponent } from './create/create.component';
import { EditComponent } from "../roles/edit/edit.component";
import { PermisoComponent } from "./permiso/permiso.component";
 
@Component({
  selector: 'app-roles',
  imports: [CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToolbarModule,
    TooltipModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    TitleCasePipe,
    CreateComponent, EditComponent, PermisoComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {

  store = inject(RoleStore);
  confirmationService = inject(ConfirmationService);

  // Para el filtro global de la tabla (frontend)
  globalTableFilterValue: string = '';

  constructor() {}

  ngOnInit() {
    this.store.loadAllRoles(); // Carga todos los roles al iniciar
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
  openCreateRoleModal() {
    this.store.openModalCreate();
  }

  openEditRoleModal(role: RoleEntity) {
    this.store.openModalEdit(role);
  }

  openAssignPermissionsModal(role: RoleEntity) {
    this.store.loadRoleById(role.id); // Esto actualizará selectedRole con sus permisos
    this.store.openModalAssignPermissions(role); // Luego abre el modal
  }

  // --- ACCIÓN DE ELIMINAR ---
  confirmDeleteRole(role: RoleEntity) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el rol '${role.name}'? Esta acción no se puede deshacer y podría afectar a los usuarios que tengan este rol.`,
      header: 'Confirmar Eliminación de Rol',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No, cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.doDelete(role.id);
      }
    });
  }
}
