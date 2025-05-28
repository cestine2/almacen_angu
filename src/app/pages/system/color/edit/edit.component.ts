import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ColorStore } from '../../../../../stores/ColorStore';
import { HelperStore } from '../../../../../stores/HelperStore';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {
  colorStore = inject(ColorStore);
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  helper = inject(HelperStore);

  colorForm = this.fb.nonNullable.group({
    id: [0], 
    nombre: ['', Validators.required],
    estado: [true]
  });

  // ngOnInit() {
  //   if (this.colorStore.colorEdit()) {
  //     const color = this.colorStore.colorEdit()![0]; // Asumimos que colorEdit es un array con un elemento
  //     this.colorForm.patchValue({
  //       nombre: color.nombre,
  //       estado: color.estado
  //     });
  //   }
  // }
  constructor (){
    effect(() => {
      const colorToEdit = this.colorStore.colorEdit(); // Obtiene el valor actual de la señal

      // Si hay una sucursal en el store (no es null)
      if (colorToEdit) {
        console.log('Effect (SucursalEdit): Patching form with sucursal:', colorToEdit); // Log

        // Parchea el formulario con los datos de la sucursal
        this.colorForm.patchValue({
          id: colorToEdit.id,
          nombre: colorToEdit.nombre
          // direccion: colorToEdit.direccion,

        });
        // Opcional: Marcar el formulario como untouched/pristine después de llenarlo inicialmente
         this.colorForm.markAsUntouched();
         this.colorForm.markAsPristine();

      } else {
        // Si sucursalEdit es null (por ejemplo, al cerrar el modal), resetea el formulario
        console.log('Effect (SucursalEdit): sucursalEdit is null, resetting form.');
        this.colorForm.reset({ nombre: '' });
        this.colorForm.markAsUntouched();
        this.colorForm.markAsPristine();
      }
    });
  }
  

 // En edit.component.ts
get visible() {
  return this.colorStore.isOpenEdit();
}

set visible(value: boolean) {
  if (!value) {
    this.colorStore.closeModalEdit();  
  }
  // No necesitas hacer nada si es true porque el store ya maneja la apertura
}

  onHide() {
    this.colorStore.closeModalEdit();
    this.colorForm.reset({ nombre: '' });
    this.colorForm.markAsUntouched();  
  }

  onSubmit() {
    this.colorForm.markAllAsTouched();
    
    if (this.colorForm.valid && this.colorStore.colorEdit()) {
      const formData = this.colorForm.getRawValue();
      
      const id = formData.id;
      this.colorStore.doUpdate(id, formData);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Formulario', // Mensaje específico para validación local
        detail: 'Por favor, complete todos los campos requeridos.'
      });
    } 
  }
}