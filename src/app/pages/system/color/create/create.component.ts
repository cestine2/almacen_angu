import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ColorStore } from '../../../../../stores/ColorStore';
import { HelperStore } from '../../../../../stores/HelperStore';


@Component({
  selector: 'app-create',
  imports: [CommonModule,
    TableModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
 
  colorStore = inject(ColorStore)
  fb = inject(FormBuilder)
  helper = inject(HelperStore)

  colorForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    estado: [true]
  });

  get visible() {
    return this.colorStore.isOpenCreate();
  }

  onHide() {
    this.colorStore.closeModalCreate();
    this.colorForm.reset({ nombre: '' });
    this.colorForm.markAsUntouched();
  }

  onSubmit() {
    this.colorForm.markAllAsTouched();

    if (this.colorForm.valid) {
      const formData = this.colorForm.getRawValue();
      // <--- Llama al store SIN el .add(...) para el toast de éxito
      this.colorStore.doCreate(formData);

      // Si necesitas hacer algo *después* de que la operación del store termine (éxito o error),
      // el store podría exponer un observable de acción completada o de resultado.
      // Pero para mostrar el toast, hacerlo dentro del store es más directo.

    } else {
      // Este toast se muestra si la validación del FORMULARIO falla ANTES de la petición HTTP
      this.helper.showToast({ // <-- Todavía usas helper aquí
        severity: 'error',
        summary: 'Error',
        detail: 'Complete los campos requeridos'
      });
    }
  }
 
 
}
