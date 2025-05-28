import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CategoriaStore } from '../../../../../stores/CategoriaStore';
import { HelperStore } from '../../../../../stores/HelperStore';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-create',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule, CheckboxModule ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {

  categoriaStore = inject(CategoriaStore)
  fb = inject(FormBuilder);
  helper = inject(HelperStore);

  
  get visible() {
    return this.categoriaStore.isOpenCreate();
  }


  tipoOptions: { label: string; value: 'producto' | 'material' }[] = [
  { label: 'Producto', value: 'producto' },
  { label: 'Material', value: 'material' }
  ];

  categoriaForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    tipo: this.fb.control<'producto' | 'material'>('producto', Validators.required),
    estado: [true]
  });

  onHide() {
    this.categoriaStore.closeModalCreate();
    this.categoriaForm.reset({ 
      nombre: '', 
      descripcion: '',
      tipo: 'producto',
      estado: true
    });
    this.categoriaForm.markAsUntouched();
  }

   onSubmit() {
    this.categoriaForm.markAllAsTouched();

    if (this.categoriaForm.valid) {
      const formData = {...this.categoriaForm.getRawValue(),
      tipo: this.categoriaForm.value.tipo as 'producto' | 'material'};
      this.categoriaStore.doCreate(formData);
    } else {
      this.helper.showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Complete los campos requeridos'
      });
    }
  }
}
