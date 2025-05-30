import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RoleStore } from '../../../../../stores/RoleStore';
import { CreateRoleData } from '../../../../domain/dtos/PermisosData/CreateRoleData';

@Component({
  selector: 'app-create',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {

   readonly store = inject(RoleStore);
  private fb = inject(FormBuilder);

  roleForm!: FormGroup;

  constructor() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]]
      // guard_name no es necesario aquí, el backend lo maneja por defecto como 'api'
    });
  }

  ngOnInit() {
    // No se necesita lógica especial aquí por ahora
  }

  get isModalOpen(): boolean {
    return this.store.isOpenCreate();
  }

  onModalShow() {
    // Resetea el formulario a sus valores iniciales cada vez que se muestra el modal
    this.roleForm.reset({
      name: ''
    });
  }

  hideDialog() {
    this.store.closeModalCreate();
  }

  onSubmit() {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched(); // Muestra errores de validación si los campos fueron tocados
      console.error('Formulario de rol inválido:', this.roleForm.value);
      // Considera mostrar un toast de PrimeNG si la validación falla
      // inject(MessageService).add({severity:'error', summary: 'Error de Validación', detail: 'El nombre del rol es requerido.'});
      return;
    }

    const roleData: CreateRoleData = {
      name: this.roleForm.value.name.trim(),
      // guard_name se enviará como undefined y el backend aplicará 'api'
    };

    console.log('Enviando para crear rol:', roleData);
    this.store.doCreate(roleData);
    // El store se encarga de cerrar el modal y mostrar el toast de éxito/error (HTTP)
  }
}
