import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ProductStore } from '../../../../../stores/ProductoStore';
import { CategoriaStore } from '../../../../../stores/CategoriaStore';
import { ColorStore } from '../../../../../stores/ColorStore';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CategoryEntity } from '../../../../domain/entities/CategoryEntity';


@Component({
  selector: 'app-create',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule, // Para formularios reactivos
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    InputNumberModule,
  AutoCompleteModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})

export class CreateComponent implements OnInit{

  productStore = inject(ProductStore);
  categoriaStore = inject(CategoriaStore);
  colorStore = inject(ColorStore);
  fb = inject(FormBuilder);

  // filteredCategorias: CategoryEntity[] = [];
  lastCategoriaSearchTerm: string = ''; 
  productForm!: FormGroup;

  tallaOptions = [
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' }
  ];
  constructor() {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: [''],
      // categoria: [null as CategoryEntity | null, [Validators.required]],
      categoria_id: [null as number | null, [Validators.required]],
      talla: ['', [Validators.required, Validators.maxLength(10)]],
      color_id: [null, [Validators.required]],
      precio: [null, [Validators.required, Validators.min(0)]],
      // codigo_barras es generado por el backend
      // estado por defecto es true (activo), el backend debería manejarlo o puedes añadirlo si es necesario
      // estado: [true]
    });
  }
  
  ngOnInit() {
   
  }
   onCategoriaFilter(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastCategoriaSearchTerm = searchTerm; // Para el template emptyfilter
    this.categoriaStore.loadCategoriasForDropdown(searchTerm, 'producto');
    // Con debounce:
    // this.categoriaFilterSubject.next(searchTerm);
  }

  get isModalOpen(): boolean {
    return this.productStore.isOpenCreate();
  }

  onModalShow() {
    // Opcional: Lógica cuando el modal se muestra, como resetear el formulario
    this.productForm.reset({
      // estado: true // Si tienes el campo estado
    });
  }

  hideDialog() {
    this.productStore.closeModalCreate();
    this.productForm.reset(); // Limpia el formulario al cerrar
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      console.error('Formulario de producto inválido:', this.productForm.value);
      // Considera usar MessageService para un toast
      return;
    }
    // productForm.value ya contiene categoria_id con el valor numérico correcto.
    const productData = { ...this.productForm.value };

    // Doble verificación, aunque Validators.required debería cubrirlo
    if (productData.categoria_id === null || productData.categoria_id === undefined) {
      console.error('¡Error Crítico! categoria_id es nulo o indefinido antes de enviar.', productData);
      // inject(MessageService).add({severity:'error', summary: 'Error de Datos', detail: 'Debe seleccionar una categoría válida.'});
      return;
    }

    this.productStore.doCreate(productData);
  }

}
