import { Component, effect, inject } from '@angular/core';
import { SucursalStore } from '../../../../../stores/SucursalStore';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-edit',
  imports: [CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CheckboxModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {

  sucursalStore = inject(SucursalStore);
  fb = inject(FormBuilder);
  messageService = inject(MessageService);


  sucursalForm = this.fb.nonNullable.group({
    id: [0], // Añade el ID al formulario para tenerlo a mano
    nombre: ['', Validators.required],
    direccion: ['', Validators.required]
    // estado: [true]
  });

  constructor() {
    effect(() => {
      const sucursalToEdit = this.sucursalStore.sucursalEdit(); // Obtiene el valor actual de la señal

      // Si hay una sucursal en el store (no es null)
      if (sucursalToEdit) {
        console.log('Effect (SucursalEdit): Patching form with sucursal:', sucursalToEdit); // Log

        // Parchea el formulario con los datos de la sucursal
        this.sucursalForm.patchValue({
          id: sucursalToEdit.id,
          nombre: sucursalToEdit.nombre,
          direccion: sucursalToEdit.direccion,

        });
        // Opcional: Marcar el formulario como untouched/pristine después de llenarlo inicialmente
         this.sucursalForm.markAsUntouched();
         this.sucursalForm.markAsPristine();

      } else {
        // Si sucursalEdit es null (por ejemplo, al cerrar el modal), resetea el formulario
        console.log('Effect (SucursalEdit): sucursalEdit is null, resetting form.');
        this.sucursalForm.reset({ id: 0, nombre: '', direccion: ''});
        this.sucursalForm.markAsUntouched();
        this.sucursalForm.markAsPristine();
      }
    });
  }

  get visible() {
    return this.sucursalStore.isOpenEdit();
  }

   // Setter opcional si usas [(visible)]="visible" en p-dialog
   // Este setter solo se llama cuando el diálogo se cierra desde la "x" o Escape
   set visible(value: boolean) {
      if (!value) { // Si el nuevo valor es false (se está cerrando)
         this.sucursalStore.closeModalEdit(); // Cierra el modal en el store
         // El effect con sucursalEdit = null manejará el reseteo del formulario
      }
      // Si el valor es true, el store ya lo maneja con openModalEdit
   }

    // Método llamado cuando el diálogo se oculta (por onHide o [(visible)])
  onHide() {
    this.sucursalStore.closeModalEdit();    
    // this.sucursalForm.reset({ id: 0, nombre: '', direccion: '', estado: true });
    // this.sucursalForm.markAsUntouched();
    // this.sucursalForm.markAsPristine();
  }

  // Método llamado al enviar el formulario
  onSubmit() {
    this.sucursalForm.markAllAsTouched(); // Marca todos los campos como touched para mostrar errores

    // Verifica si el formulario es válido Y si tenemos un ID (estamos editando un elemento existente)
    if (this.sucursalForm.valid && this.sucursalForm.controls.id.value) {
      const formData = this.sucursalForm.getRawValue();
      const id = formData.id; // Obtiene el ID del formulario

      // Llama a la acción doUpdate del store para actualizar la sucursal
      // Pasa solo las propiedades que el backend necesita para actualizar (id, nombre, direccion, estado)
      this.sucursalStore.doUpdate(id, {
          nombre: formData.nombre,
          direccion: formData.direccion,
      });
       // El store se encargará de cerrar el modal (si es exitoso) y mostrar el toast de éxito
       // Si hay un error HTTP (ej: validación 422), el interceptor mostrará el toast de error.

    } else {
       // Mostrar toast para validación de formulario local (campos requeridos, etc.)
       this.messageService.add({
         severity: 'error',
         summary: 'Error de Formulario',
         detail: 'Por favor, complete todos los campos requeridos y asegúrese de que la sucursal a editar esté seleccionada.'
       });
    }
  }
}
