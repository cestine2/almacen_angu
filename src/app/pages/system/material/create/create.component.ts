import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { MaterialStore } from '../../../../../stores/MaterialStore';
import { CategoriaStore } from '../../../../../stores/CategoriaStore';
import { ProveedorStore } from '../../../../../stores/ProveedorStore';
import { ColorStore } from '../../../../../stores/ColorStore';
import { HelperStore } from '../../../../../stores/HelperStore';

@Component({
  selector: 'app-create',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    CheckboxModule,],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {

  materialStore = inject(MaterialStore);
  categoriaStore = inject(CategoriaStore);
  proveedorStore = inject(ProveedorStore);
  colorStore = inject(ColorStore);
  fb = inject(FormBuilder);
  helper = inject(HelperStore)

  materialForm!: FormGroup;

  // Para los templates emptyfilter de los dropdowns
  lastCategoriaSearchTerm: string = '';
  lastProveedorSearchTerm: string = '';
  lastColorSearchTerm: string = '';

  constructor() {
    this.materialForm = this.fb.group({
      cod_articulo: ['', [Validators.required, Validators.maxLength(255)]],
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.maxLength(255)]], // MaxLength si tu DB lo tiene
      categoria_id: [null as number | null, [Validators.required]],
      proveedor_id: [null as number | null, [Validators.required]],
      // codigo_barras es opcional y generado por backend si no se provee, pero puede ser ingresado.
      // Si el usuario puede ingresarlo, añádelo al form. Si siempre es backend, no.
      // Por ahora lo omito del form, asumiendo que el backend lo genera si es null.
      color_id: [null as number | null, [Validators.required]],
      estado: [true, Validators.required] // Default a activo
    });
  }

  ngOnInit() {
    // Carga de opciones para dropdowns. Se hará cuando el modal se muestre (onModalShow)
    // para asegurar que siempre estén lo más actualizadas posible al abrir.
  }

  get isModalOpen(): boolean {
    return this.materialStore.isOpenCreate();
  }

  onModalShow() {
   
  }

  hideDialog() {
    this.materialStore.closeModalCreate();
  }

  // Filtros para dropdowns (si son server-side)
  onCategoriaFilter(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastCategoriaSearchTerm = searchTerm;
    this.categoriaStore.loadCategoriasForDropdown(searchTerm, 'material');
  }

  onProveedorFilter(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastProveedorSearchTerm = searchTerm;
    // this.proveedorStore.loadProveedoresForDropdown(searchTerm); // Si implementas esto
  }

  onColorFilter(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastColorSearchTerm = searchTerm;
    // this.colorStore.loadColoresForDropdown(searchTerm); // Si implementas esto
  }

  onSubmit() {
    if (this.materialForm.valid) {
      this.materialForm.markAllAsTouched();
      const materialData = { ...this.materialForm.value };
       this.materialStore.doCreate(materialData);
      // console.error('Formulario de Nuevo Material inválido:', this.materialForm.value);
      // Considera un toast de error de validación si tu interceptor no lo cubre
      // inject(MessageService).add({severity:'error', summary: 'Error de Validación', detail: 'Complete los campos requeridos.'});
    
    }else {
      // Este toast se muestra si la validación del FORMULARIO falla ANTES de la petición HTTP
      this.helper.showToast({ // <-- Todavía usas helper aquí
        severity: 'error',
        summary: 'Error',
        detail: 'Complete los campos requeridos'
      });
    }

    // El backend genera 'codigo_barras'. El tipo de datos Omit en el store ya lo maneja.
    

    // console.log('Enviando para crear material:', materialData);
   
    
    // El store se encarga de cerrar el modal y mostrar el toast de éxito/error (HTTP)
  }
  


}
