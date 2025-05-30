import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RoleStore } from '../../../../../stores/RoleStore';
import { UpdateRoleData } from '../../../../domain/dtos/PermisosData/UpdateRoleData';

@Component({
  selector: 'app-edit',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {

   readonly store = inject(RoleStore);
  private fb = inject(FormBuilder);

  roleForm!: FormGroup;
  private currentRoleId: number | null = null;

  constructor() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]]
      // guard_name no se edita usualmente desde la UI una vez creado.
      // Si se necesitara, se añadiría aquí y al UpdateRoleData/Request.
    });

    // Effect para reaccionar a los cambios en selectedRole y popular el formulario
    effect(() => {
      const roleToEdit = this.store.selectedRole();
      const modalIsOpen = this.store.isOpenEdit();

      if (modalIsOpen && roleToEdit) {
        console.log('[EditRoleComponent] Effect: Populating form for role:', roleToEdit);
        this.currentRoleId = roleToEdit.id;
        this.roleForm.patchValue({
          name: roleToEdit.name
          // guard_name: roleToEdit.guard_name // Si fuera editable
        });
      } else if (!modalIsOpen) {
        // Si el modal se cierra, resetea para la próxima vez
        if (this.currentRoleId !== null) { // Solo resetea si realmente había algo
            this.roleForm.reset({ name: ''});
            this.currentRoleId = null;
        }
      }
    });
  }

  ngOnInit() {
    // No se necesita lógica especial aquí por ahora, el effect maneja la carga de datos en el form.
  }

  get isModalOpen(): boolean {
    return this.store.isOpenEdit();
  }

  onModalShow() {
    // El effect ya debería haber populado el formulario si selectedRole estaba listo.
    // Este es un buen lugar si necesitas hacer algo más al mostrar.
    const roleToEdit = this.store.selectedRole();
    console.log('[EditRoleComponent] Modal onShow. Current selectedRole:', roleToEdit);
    if (roleToEdit && (!this.roleForm.value.name || this.currentRoleId !== roleToEdit.id)) {
        // Forzar re-poblado si el effect no lo hizo o si el rol cambió
        this.currentRoleId = roleToEdit.id;
        this.roleForm.patchValue({ name: roleToEdit.name });
    }
  }

  hideDialog() {
    this.store.closeModalEdit();
    // El effect se encargará del reset cuando isModalOpen cambie a false.
  }

  onSubmit() {
    if (!this.currentRoleId) {
      console.error('EditRoleComponent: No hay ID de rol para actualizar.');
      // Considera mostrar un toast
      return;
    }

    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      console.error('Formulario de rol inválido:', this.roleForm.value);
      // Considera mostrar un toast
      return;
    }

    const roleData: UpdateRoleData = {
      name: this.roleForm.value.name.trim(),
      // guard_name: this.roleForm.value.guard_name // Si fuera editable y parte de UpdateRoleData
    };

    console.log(`EditRoleComponent: Enviando para actualizar ID ${this.currentRoleId}:`, roleData);
    this.store.doUpdate({ id: this.currentRoleId, data: roleData });
    // El store se encarga de cerrar el modal y mostrar el toast de éxito/error (HTTP)
  }
}
