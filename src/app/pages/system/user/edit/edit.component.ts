import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { RoleStore } from '../../../../../stores/RoleStore';
import { SucursalStore } from '../../../../../stores/SucursalStore';
import { UserStore } from '../../../../../stores/UserStore';
import { UpdateUserData } from '../../../../core/services/user.service';
import { UserEntity } from '../../../../domain/entities/UserEntity';

@Component({
  selector: 'app-edit',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {

  userStore = inject(UserStore);
  sucursalStore = inject(SucursalStore);
  roleStore = inject(RoleStore);
  fb = inject(FormBuilder);

  userForm!: FormGroup;
  private currentUserId: number | null = null;

  constructor() {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      // Password no se edita aquí
      sucursal_id: [null as number | null, [Validators.required]],
      role_id: [null as number | null, [Validators.required]],
      estado: [true, Validators.required]
    });

    // Effect para reaccionar a los cambios en selectedUser y popular el formulario
    effect(() => {
      const userToEdit = this.userStore.selectedUser();
      const modalIsOpen = this.userStore.isOpenEdit();

      if (modalIsOpen && userToEdit) {
        console.log('[EditUserComponent] Effect: Populating form for user:', userToEdit);
        this.currentUserId = userToEdit.id;
        this.userForm.patchValue({
          nombre: userToEdit.nombre,
          email: userToEdit.email,
          sucursal_id: userToEdit.sucursal?.id || userToEdit.sucursal_id, // Usa el ID del objeto o el ID directo
          role_id: userToEdit.roles?.id || userToEdit.role_id, // Usa el ID del objeto o el ID directo
          estado: userToEdit.estado
        });
        // Cargar opciones de dropdown si es necesario para asegurar que la selección actual esté disponible
        this.loadDropdownOptionsIfNeeded(userToEdit);
      } else if (!modalIsOpen) {
        if (this.currentUserId !== null) { // Solo resetea si realmente había algo
            this.userForm.reset({ estado: true }); // Reset a valores por defecto
            this.currentUserId = null;
        }
      }
    });
  }

  ngOnInit() {
    // La carga principal de opciones de dropdown se hará en onModalShow o a través del effect
  }

  private loadDropdownOptionsIfNeeded(user: UserEntity) {
    // Sucursales
    if (this.sucursalStore.sucursales().length === 0 ||
        (user.sucursal_id && !this.sucursalStore.sucursales().find(s => s.id === user.sucursal_id))) {
      this.sucursalStore.doList(); // O un método más específico para cargar todos los activos
    }
    // Roles
    if (this.roleStore.roles().length === 0 ||
        (user.role_id && !this.roleStore.roles().find(r => r.id === user.role_id))) {
      this.roleStore.loadAllRoles();
    }
  }


  get isModalOpen(): boolean {
    return this.userStore.isOpenEdit();
  }

  onModalShow() {
    // El effect ya debería haber populado el formulario.
    // Aquí podemos asegurar que los dropdowns tengan sus datos cargados.
    const userToEdit = this.userStore.selectedUser();
    if (userToEdit) {
        this.loadDropdownOptionsIfNeeded(userToEdit);
    } else {
        // Si no hay usuario para editar (raro si el modal se abre), cargar opciones generales
        if (this.sucursalStore.sucursales().length === 0) this.sucursalStore.doList();
        if (this.roleStore.roles().length === 0) this.roleStore.loadAllRoles();
    }
    console.log('[EditUserComponent] Modal onShow. Current selectedUser:', userToEdit);
  }

  hideDialog() {
    this.userStore.closeModalEdit();
    // El effect se encargará del reset cuando isModalOpen cambie a false
  }

  onSubmit() {
    if (!this.currentUserId) {
      console.error('EditUserComponent: No hay ID de usuario para actualizar.');
      return;
    }
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      console.error('Formulario de edición de usuario inválido:', this.userForm.value);
      return;
    }

    const userData: UpdateUserData = { ...this.userForm.value };

    console.log(`Enviando para actualizar usuario ID ${this.currentUserId}:`, userData);
    this.userStore.doUpdate({ id: this.currentUserId, data: userData });
    // El store se encarga de cerrar el modal y mostrar el toast
  }

}
