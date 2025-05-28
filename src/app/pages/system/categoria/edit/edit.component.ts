import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { CategoriaStore } from '../../../../../stores/CategoriaStore';

@Component({
  selector: 'app-edit',
  imports: [CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {
  categoriaStore = inject(CategoriaStore);
  fb = inject(FormBuilder);
  messageService = inject(MessageService);

  tipoOptions = [
    { label: 'Producto', value: 'producto' },
    { label: 'Material', value: 'material' }
  ];

  categoriaForm = this.fb.nonNullable.group({
    id: [0, Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    tipo: ['producto', Validators.required],
    estado: [true]
  });

  constructor() {
    effect(() => {
      const categoriaToEdit = this.categoriaStore.categoriaEdit();
      
      if (categoriaToEdit) {
        this.categoriaForm.patchValue({
          id: categoriaToEdit.id,
          nombre: categoriaToEdit.nombre,
          descripcion: categoriaToEdit.descripcion || '',
          tipo: categoriaToEdit.tipo,
          estado: categoriaToEdit.estado
        });
        this.categoriaForm.markAsPristine();
      } else {
        this.categoriaForm.reset({
          id: 0,
          nombre: '',
          descripcion: '',
          tipo: 'producto',
          estado: true
        });
      }
    });
  }
  get visible() {
    return this.categoriaStore.isOpenEdit();
  }

  set visible(value: boolean) {
    if (!value) this.categoriaStore.closeModalEdit();
  }

  onHide() {
    this.categoriaStore.closeModalEdit();
  }

  onSubmit() {
    this.categoriaForm.markAllAsTouched();

    if (this.categoriaForm.valid && this.categoriaForm.value.id) {
      const formData = this.categoriaForm.getRawValue();
      this.categoriaStore.doUpdate(formData.id, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo as 'producto' | 'material',
        estado: formData.estado
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Complete todos los campos requeridos'
      });
    }
  }
}
