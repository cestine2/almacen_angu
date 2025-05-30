import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password'; // Para el campo de contraseña
import { CheckboxModule } from 'primeng/checkbox'; 
import { UserStore } from '../../../../../stores/UserStore';
import { RoleStore } from '../../../../../stores/RoleStore';
import { SucursalStore } from '../../../../../stores/SucursalStore';
import { CreateUserData } from '../../../../core/services/user.service';

@Component({
  selector: 'app-create',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    PasswordModule,
    CheckboxModule,],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {

  readonly userStore = inject(UserStore);
  readonly sucursalStore = inject(SucursalStore);
  readonly roleStore = inject(RoleStore);
  private fb = inject(FormBuilder);

  userForm!: FormGroup;

  // Para los templates emptyfilter de los dropdowns de roles/sucursales
  // lastSucursalSearchTerm: string = ''; // Si implementas búsqueda server-side
  // lastRoleSearchTerm: string = '';    // Si implementas búsqueda server-side

  constructor() {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      sucursal_id: [null as number | null, [Validators.required]],
      role_id: [null as number | null, [Validators.required]],
      estado: [true, Validators.required] // Por defecto activo
    });
  }

  ngOnInit() {
    // La carga de opciones para dropdowns (sucursales, roles) se hará en onModalShow
  }

  get isModalOpen(): boolean {
    return this.userStore.isOpenCreate();
  }

  onModalShow() {
    this.userForm.reset({
      nombre: '',
      email: '',
      password: '',
      sucursal_id: null,
      role_id: null,
      estado: true
    });

    // Cargar opciones para los dropdowns
    // Sucursales
    if (this.sucursalStore.sucursales().length === 0) { // Carga solo si no hay datos
      // Idealmente, SucursalStore tendría un método como loadAllActiveSucursalesForDropdown()
      this.sucursalStore.doList(); // O ajusta doList para traer todas las activas
    }

    // Roles
    if (this.roleStore.roles().length === 0) { // Carga solo si no hay datos
      this.roleStore.loadAllRoles(); // Este método ya trae todos los roles
    }
  }

  hideDialog() {
    this.userStore.closeModalCreate();
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      console.error('Formulario de creación de usuario inválido:', this.userForm.value);
      // Considera usar MessageService para un toast
      return;
    }

    const userData: CreateUserData = { ...this.userForm.value };

    console.log('Enviando para crear usuario:', userData);
    this.userStore.doCreate(userData);
    // El store se encarga de cerrar el modal y mostrar el toast de éxito/error (HTTP)
  }

  // Si necesitas filtros server-side para los dropdowns de sucursal o rol:
  // onSucursalFilter(event: { filter?: string }) { /* ... */ }
  // onRoleFilter(event: { filter?: string }) { /* ... */ }
}
