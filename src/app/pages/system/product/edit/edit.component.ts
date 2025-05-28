import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox'; 
import { ColorStore } from '../../../../../stores/ColorStore';
import { CategoriaStore } from '../../../../../stores/CategoriaStore';
import { ProductStore } from '../../../../../stores/ProductoStore';

@Component({
  selector: 'app-edit',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    InputNumberModule,
    CheckboxModule, ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {

  productStore = inject(ProductStore);
  categoriaStore = inject(CategoriaStore);
  colorStore = inject(ColorStore);
  private fb = inject(FormBuilder);

  productForm!: FormGroup;
  private currentProductId: number | null = null;

  statusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];
   tallaOptions = [
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' }
  ];
  lastCategoriaSearchTerm: string = ''; 
  constructor() {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: [''], // Nullable en backend
      categoria_id: [null as number | null, [Validators.required]], // Tipado explícito para el valor inicial
      talla: ['', [Validators.required, Validators.maxLength(10)]],
      color_id: [null as number | null, [Validators.required]], // Tipado explícito
      precio: [null as number | null, [Validators.required, Validators.min(0)]], // Tipado explícito
      estado: [true, [Validators.required]] // Backend lo maneja como boolean
      // codigo_barras es manejado por el backend y no editable usualmente
    });

    // Effect para reaccionar a los cambios en productEdit y popular el formulario
    effect(() => {
      const productToEdit = this.productStore.productEdit();
      const modalIsOpen = this.productStore.isOpenEdit();

      if (modalIsOpen && productToEdit) {
        console.log('EditProductComponent Effect: Populating form for product:', productToEdit);
        this.currentProductId = productToEdit.id;
        this.productForm.patchValue({
          nombre: productToEdit.nombre,
          descripcion: productToEdit.descripcion,
          categoria_id: productToEdit.categoria_id,
          talla: productToEdit.talla,
          color_id: productToEdit.color_id,
          precio: productToEdit.precio,
          estado: productToEdit.estado
        });
      } else if (!modalIsOpen) {
        // Si el modal se cierra, resetea el formulario y el ID
        // La llamada a hideDialog desde el template ya hace esto.
        // Pero si el store cambia isOpenEdit a false por otra razón, esto ayudaría.
        if (this.currentProductId !== null) { // Solo resetea si realmente había algo
            this.productForm.reset({ estado: true }); // Resetea a valores por defecto si es necesario
            this.currentProductId = null;
        }
      }
    });
  }

  ngOnInit() {
    
  }

  get isModalOpen(): boolean {
    return this.productStore.isOpenEdit();
  }

  onModalShow() {
    // El effect ya debería haber populado el formulario si productEdit estaba listo.
    // Si necesitas forzar algo aquí, puedes hacerlo, pero el effect es más reactivo.
    // Por ejemplo, asegurar que los dropdowns tengan las opciones cargadas.
    console.log('EditProductComponent: Modal onShow. Product to edit:', this.productStore.productEdit());
  }
  onCategoriaFilter(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastCategoriaSearchTerm = searchTerm; // Para el template emptyfilter
    this.categoriaStore.loadCategoriasForDropdown(searchTerm, 'producto');
    // Con debounce:
    // this.categoriaFilterSubject.next(searchTerm);
  }

  hideDialog() {
    this.productStore.closeModalEdit();
    // El effect se encargará de resetear el form y currentProductId cuando isModalOpen se vuelva false
    // o puedes hacerlo explícitamente aquí si prefieres:
    // this.productForm.reset({ estado: true });
    // this.currentProductId = null;
  }

  onSubmit() {
    if (!this.currentProductId) {
      console.error('EditProductComponent: No hay ID de producto para actualizar.');
      // Mostrar mensaje de error al usuario
      return;
    }
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      console.error('EditProductComponent: Formulario inválido:', this.productForm.value);
      // Mostrar mensaje de error o usar toasts
      return;
    }

    // Omitimos 'id', 'created_at', 'updated_at', 'codigo_barras', y las relaciones
    // El backend espera solo los campos que pueden ser actualizados.
    // El Partial<Omit<...>> en el store ya define esto.
    const productDataToUpdate = { ...this.productForm.value };

    console.log(`EditProductComponent: Enviando para actualizar ID ${this.currentProductId}:`, productDataToUpdate);
    this.productStore.doUpdate(this.currentProductId, productDataToUpdate);
    // El store se encargará de cerrar el modal en caso de éxito y mostrar el toast.
  }
}
