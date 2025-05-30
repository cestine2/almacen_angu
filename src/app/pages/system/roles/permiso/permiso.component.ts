import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MessageService } from 'primeng/api';

import { RoleStore } from '../../../../../stores/RoleStore';
import { PermissionStore } from '../../../../../stores/PermisoStore';
import { AssignPermissionsData } from '../../../../domain/dtos/PermisosData/AssignPermissionsData';
import { PermissionEntity } from '../../../../domain/entities/PermissionEntity';
import { RoleEntity } from '../../../../domain/entities/RoleEntity';

interface PermissionControlItem {
  entity: PermissionEntity;
  control: FormControl<boolean>;
}

interface PermissionGroup {
  groupName: string;
  permissions: PermissionControlItem[];
  masterControl: FormControl<boolean>;
}

@Component({
  selector: 'app-permiso',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    CheckboxModule,
    ScrollPanelModule,
    TitleCasePipe,
  ],
  templateUrl: './permiso.component.html',
  styleUrls: ['./permiso.component.scss']
})
export class PermisoComponent implements OnInit {
  readonly roleStore = inject(RoleStore);
  readonly permissionStore = inject(PermissionStore);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  permissionsForm!: FormGroup;
  permissionGroups: PermissionGroup[] = [];
  componentSelectedRole: RoleEntity | null = null;

  constructor() {
    this.permissionsForm = this.fb.group({});

    effect(() => {
      const storeSelectedRole = this.roleStore.selectedRole();
      const allPermissionsFromStore = this.permissionStore.permissions();
      const modalIsOpen = this.roleStore.isOpenAssignPermissions();

      this.componentSelectedRole = storeSelectedRole;

      if (!modalIsOpen) {
        this.clearForm(); // Limpia si el modal se cierra
        return; // No hacer más nada si el modal no está abierto
      }

      // El modal está abierto (modalIsOpen es true)
      if (this.componentSelectedRole && typeof this.componentSelectedRole.id === 'number' && allPermissionsFromStore.length > 0) {
        console.log('[PermisoComponent Effect] Conditions met. Calling buildPermissionControls().');
        this.buildPermissionControls();
      } else {
        this.permissionGroups = [];
        if (!this.componentSelectedRole) {
            console.log('[PermisoComponent Effect] Modal open, pero el rol seleccionado es NULL (esperando carga o error).');
        } else if (allPermissionsFromStore.length === 0) {
            if (!this.permissionStore.isLoading()) {
                 console.log('[PermisoComponent Effect] Modal open, rol seleccionado, pero la lista de permisos globales está vacía. Intentando cargar...');
                 this.permissionStore.ensurePermissionsLoaded();
            } else {
                 console.log('[PermisoComponent Effect] Modal open, rol seleccionado, pero la lista de permisos globales está cargando.');
            }
        }
      }
    });
  }

  ngOnInit() {
    // La carga de permisos se hace en onModalShow o es disparada por el effect
  }

  get isModalOpen(): boolean {
    return this.roleStore.isOpenAssignPermissions();
  }

  get currentRoleName(): string {
    return this.componentSelectedRole?.name || 'Rol';
  }

  onModalShow() {
    console.log('[PermisoComponent] Modal onShow. Current componentSelectedRole (before permission load):', this.componentSelectedRole);
    this.permissionStore.ensurePermissionsLoaded();
  }

  private clearForm() {
    console.log('[PermisoComponent] Clearing form and permission groups.');
    Object.keys(this.permissionsForm.controls).forEach(key => {
      this.permissionsForm.removeControl(key);
    });
    this.permissionGroups = [];
  }

  private buildPermissionControls() {
    Object.keys(this.permissionsForm.controls).forEach(key => {
        this.permissionsForm.removeControl(key);
    });

    const currentRole = this.componentSelectedRole;
    const allSystemPermissions = this.permissionStore.permissions();

    if (!currentRole || typeof currentRole.id !== 'number' || allSystemPermissions.length === 0) {
      console.warn('[PermisoComponent buildPermissionControls] Internal Skip: No valid role or no system permissions.');
      this.permissionGroups = [];
      return;
    }

    console.log('[PermisoComponent buildPermissionControls] Building controls for role:', currentRole.name, 'with its permissions:', currentRole.permissions);
    console.log('[PermisoComponent buildPermissionControls] Using all system permissions (count):', allSystemPermissions.length);

    const rolePermissionNames = new Set(currentRole.permissions?.map(p => p.name) || []);
    const groups: { [key: string]: PermissionControlItem[] } = {};

    allSystemPermissions.forEach(permission => {
      let groupName = 'General';
      const parts = permission.name.split('-');
      if (parts.length > 1) {
        const prefix = parts[0].toLowerCase();
        const entityNameRaw = parts.slice(1).join(' ');
        const entityName = entityNameRaw.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        if (prefix === 'manage') groupName = "Gestionar " + entityName;
        else if (prefix === 'view') groupName = "Ver " + entityName;
        else if (prefix === 'register') groupName = "Registrar " + entityName;
        else if (prefix === 'generate') groupName = "Generar " + entityName;
        else if (prefix === 'import') groupName = "Importar " + entityName;
        else if (prefix === 'perform') groupName = "Realizar " + entityName;
        else groupName = (prefix.charAt(0).toUpperCase() + prefix.slice(1)) + (entityName ? " " + entityName : "");
      } else {
        groupName = permission.name.charAt(0).toUpperCase() + permission.name.slice(1);
      }
      if (!groups[groupName]) groups[groupName] = [];
      const initialValue = rolePermissionNames.has(permission.name);
      const control = this.fb.control(initialValue) as FormControl<boolean>;
      this.permissionsForm.addControl(permission.name, control);
      groups[groupName].push({ entity: permission, control: control });
    });

    // --- CORRECCIÓN DEL CONSOLE.LOG ---
    const simplifiedGroupsForLogging: { [key: string]: { name: string, value: boolean }[] } = {};
    for (const groupKey in groups) {
        simplifiedGroupsForLogging[groupKey] = groups[groupKey].map(item => ({
            name: item.entity.name,
            value: item.control.value
        }));
    }
    console.log('[PermisoComponent buildPermissionControls] Intermediate "groups" object (simplified for logging):', simplifiedGroupsForLogging);
    // --- FIN DE LA CORRECCIÓN ---

    this.permissionGroups = Object.keys(groups).map(key => {
      const groupPermissions = groups[key].sort((a,b) => (a.entity.description || a.entity.name).localeCompare(b.entity.description || b.entity.name));
      const masterControl = this.fb.control(groupPermissions.every(p => p.control.value === true)) as FormControl<boolean>;
      groupPermissions.forEach(pCtrl => {
        pCtrl.control.valueChanges.subscribe(() => {
          masterControl.setValue(groupPermissions.every(innerP => innerP.control.value === true), { emitEvent: false });
        });
      });
      masterControl.valueChanges.subscribe(checked => {
        groupPermissions.forEach(pCtrl => pCtrl.control.setValue(checked ?? false, { emitEvent: false }));
      });
      return { groupName: key, permissions: groupPermissions, masterControl: masterControl };
    }).sort((a,b) => a.groupName.localeCompare(b.groupName));

    console.log('[PermisoComponent] Permission form and groups built. Groups count:', this.permissionGroups.length);
    if(this.permissionGroups.length === 0 && allSystemPermissions.length > 0) {
        console.warn('[PermisoComponent] ATTENTION: permissionGroups is empty, but allSystemPermissions has data. Check grouping logic or "groups" object content.');
    }
  }

  hideDialog() {
    this.roleStore.closeModalAssignPermissions();
  }

  onSubmit() {
    console.log('[PermisoComponent onSubmit] Intentando guardar. componentSelectedRole:', this.componentSelectedRole);
    if (!this.componentSelectedRole || typeof this.componentSelectedRole.id !== 'number') {
      console.error('[PermisoComponent onSubmit] Error: Rol no válido o ID de rol faltante. No se puede guardar. Role:', this.componentSelectedRole);
      this.messageService.add({
        severity:'error',
        summary: 'Error de Datos',
        detail: 'La información del rol no está completamente cargada. Por favor, cierre y vuelva a intentarlo.'
      });
      return;
    }
    const selectedPermissionNames: string[] = [];
    Object.keys(this.permissionsForm.controls).forEach(permissionName => {
      if (this.permissionsForm.controls[permissionName]?.value === true) {
        selectedPermissionNames.push(permissionName);
      }
    });
    const data: AssignPermissionsData = { permissions: selectedPermissionNames };
    console.log(`[PermisoComponent onSubmit] Asignando permisos al rol ID ${this.componentSelectedRole.id}:`, data);
    this.roleStore.doAssignPermissions({ roleId: this.componentSelectedRole.id, data });
  }

  generateSafeId(prefix: string, name: string): string {
    if (!name) {
      return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
    }
    const sanitizedName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    return `${prefix}-${sanitizedName}`;
  }
}
