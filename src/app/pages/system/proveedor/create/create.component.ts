import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea'; // Para dirección si es textarea
import { CheckboxModule } from 'primeng/checkbox'; 
import { ProveedorStore } from '../../../../../stores/ProveedorStore';

@Component({
  selector: 'app-create',
  imports: [ CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {

  store = inject(ProveedorStore);
  fb = inject(FormBuilder);

  proveedorForm!: FormGroup;

  constructor() {
    this.proveedorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      direccion: ['', [Validators.maxLength(255)]], // Nullable, solo maxLength
      telefono: ['', [Validators.maxLength(50)]],   // Nullable, solo maxLength
      estado: [true, Validators.required] // Por defecto activo, y requerido
    });
  }

  ngOnInit() {
    // No hay datos de dropdowns que cargar aquí para proveedores (a menos que tengas algo específico)
  }

  get isModalOpen(): boolean {
    return this.store.isOpenCreate();
  }

  onModalShow() {
    // Resetea el formulario a sus valores iniciales cada vez que se muestra el modal
    this.proveedorForm.reset({
      nombre: '',
      direccion: '',
      telefono: '',
      estado: true // Default a activo
    });
  }

  hideDialog() {
    this.store.closeModalCreate();
    // El reset ya se hace en onModalShow, pero por si acaso o si el usuario cierra con 'X'
    // this.proveedorForm.reset({ estado: true });
  }

  onSubmit() {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      // Tu interceptor de errores o un MessageService local podría manejar un toast para esto
      console.error('Formulario de proveedor inválido:', this.proveedorForm.value);
      // Considera mostrar un toast genérico de error de validación si no lo hace el interceptor
      // this.messageService.add({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, complete los campos requeridos.'});
      return;
    }

    const proveedorData = { ...this.proveedorForm.value };

    console.log('Enviando para crear proveedor:', proveedorData);
    this.store.doCreate(proveedorData);
    // El store se encarga de cerrar el modal y mostrar el toast de éxito/error (HTTP)
  }

}
