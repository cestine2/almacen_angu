import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ProveedorStore } from '../../../../../stores/ProveedorStore';

@Component({
  selector: 'app-edit',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {

  store = inject(ProveedorStore);
  fb = inject(FormBuilder);

  proveedorForm!: FormGroup;
  private currentProveedorId: number | null = null;

  constructor() {
    this.proveedorForm = this.fb.group({
      // 'id' no es parte del formulario editable, pero lo necesitamos para la actualización.
      // Se obtiene de currentProveedorId.
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      direccion: ['', [Validators.maxLength(255)]],
      telefono: ['', [Validators.maxLength(50)]],
      estado: [true, Validators.required]
    });

    // Effect para reaccionar a los cambios en proveedorEdit y popular el formulario
    effect(() => {
      const proveedorToEdit = this.store.proveedorEdit(); // Signal del proveedor a editar
      const modalIsOpen = this.store.isOpenEdit();    // Signal de visibilidad del modal

      if (modalIsOpen && proveedorToEdit) {
        console.log('[EditProveedorComponent] Effect: Populating form for proveedor:', proveedorToEdit);
        this.currentProveedorId = proveedorToEdit.id;
        this.proveedorForm.patchValue({
          nombre: proveedorToEdit.nombre,
          direccion: proveedorToEdit.direccion,
          telefono: proveedorToEdit.telefono,
          estado: proveedorToEdit.estado
        });
      } else if (!modalIsOpen) {
        // Si el modal se cierra o no hay proveedor para editar, resetea.
        if (this.currentProveedorId !== null) { // Solo resetea si realmente había algo
            this.proveedorForm.reset({ estado: true }); // Reset a valores por defecto
            this.currentProveedorId = null;
        }
      }
    });
  }

  ngOnInit() {
    // No se necesitan cargas de dropdowns aquí para el formulario de proveedor.
  }

  get isModalOpen(): boolean {
    return this.store.isOpenEdit();
  }

  onModalShow() {
    // El effect ya debería haber populado el formulario si proveedorEdit estaba listo.
    // Este es un buen lugar si necesitas hacer algo más al mostrar,
    // como enfocar un campo, pero patchValue en el effect es generalmente suficiente.
    console.log('[EditProveedorComponent] Modal onShow. Current proveedorEdit:', this.store.proveedorEdit());
  }

  hideDialog() {
    this.store.closeModalEdit();
    // El effect se encargará del reset cuando isModalOpen cambie a false.
  }

  onSubmit() {
    if (!this.currentProveedorId) {
      console.error('EditProveedorComponent: No hay ID de proveedor para actualizar.');
      // Mostrar mensaje de error al usuario si es necesario
      return;
    }

    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      console.error('EditProveedorComponent: Formulario inválido:', this.proveedorForm.value);
      // Considera mostrar un toast genérico de error de validación
      return;
    }

    const proveedorDataToUpdate = { ...this.proveedorForm.value };

    console.log(`EditProveedorComponent: Enviando para actualizar ID ${this.currentProveedorId}:`, proveedorDataToUpdate);
    this.store.doUpdate(this.currentProveedorId, proveedorDataToUpdate);
    // El store se encarga de cerrar el modal y mostrar el toast de éxito/error (HTTP)
  }

}
