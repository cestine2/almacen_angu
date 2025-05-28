// import { Component, inject, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { DialogModule } from 'primeng/dialog';
// import { ButtonModule } from 'primeng/button';
// import { DropdownModule } from 'primeng/dropdown';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { CheckboxModule } from 'primeng/checkbox'; // Opcional para 'estado'
// import { InventarioStore } from '../../../../../stores/InventarioStore';
// import { MaterialStore } from '../../../../../stores/MaterialStore';
// import { ProductStore } from '../../../../../stores/ProductoStore';
// import { SucursalStore } from '../../../../../stores/SucursalStore';
// import { CreateInventarioData } from '../../../../core/services/inventario.service';

// @Component({
//   selector: 'app-create',
//   imports: [CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     DialogModule,
//     ButtonModule,
//     DropdownModule,
//     InputNumberModule,
//     CheckboxModule],
//   templateUrl: './create.component.html',
//   styleUrl: './create.component.scss'
// })
// export class CreateComponent {
//   readonly inventarioStore = inject(InventarioStore);
//   readonly materialStore = inject(MaterialStore);
//   readonly productStore = inject(ProductStore);
//   readonly sucursalStore = inject(SucursalStore);
//   private fb = inject(FormBuilder);

//   stockForm!: FormGroup;

//   tipoItemOptions = [
//     { label: 'Seleccione Tipo...', value: null }, // Opción por defecto
//     { label: 'Material', value: 'Material' as const },
//     { label: 'Producto', value: 'Producto' as const }
//   ];

//   // Para los templates emptyfilter de los dropdowns de ítems
//   lastItemSearchTerm: string = '';

//   constructor() {
//     this.stockForm = this.fb.group({
//       tipo: [null as 'Material' | 'Producto' | null, [Validators.required]],
//       item_id: [null as number | null, [Validators.required]], // Control genérico para material_id o producto_id
//       stock_actual: [null as number | null, [Validators.required, Validators.min(1)]], // Stock a añadir debe ser > 0
//       sucursal_id: [null as number | null, [Validators.required]],
//       // estado: [true], // El backend usualmente maneja esto o lo toma del ítem existente
//     });

//     // Escuchar cambios en 'tipo' para resetear 'item_id'
//     this.stockForm.get('tipo')?.valueChanges.subscribe(tipoSeleccionado => {
//       this.stockForm.get('item_id')?.setValue(null); // Resetea el ítem seleccionado
//       this.stockForm.get('item_id')?.markAsUntouched();
//       this.lastItemSearchTerm = '';
//       if (tipoSeleccionado === 'Material') {
//         // Opcional: Cargar/refrescar lista de materiales si no se hace al mostrar el modal
//         // this.materialStore.loadMaterialsForDropdown('');
//       } else if (tipoSeleccionado === 'Producto') {
//         // Opcional: Cargar/refrescar lista de productos
//         // this.productStore.loadProductsForDropdown('');
//       }
//     });
//   }

//   ngOnInit() {
//     // La carga de opciones para dropdowns (sucursales, materiales, productos)
//     // se hará en onModalShow para asegurar que estén actualizadas al abrir.
//   }

//   get isModalOpen(): boolean {
//     return this.inventarioStore.isOpenRegisterStock();
//   }

//   onModalShow() {
//     this.stockForm.reset({
//       tipo: null,
//       item_id: null,
//       stock_actual: null,
//       sucursal_id: null,
//       // estado: true
//     });
//     this.lastItemSearchTerm = '';

//     // Cargar opciones para dropdowns
//     if (this.sucursalStore.sucursales().length === 0) { // Ejemplo de condición de carga
//       // this.sucursalStore.loadAllActiveSucursalesForDropdown(); // Método ideal
//       this.sucursalStore.doList(); // O ajusta para traer todas las activas
//     }
//     // Materiales y Productos se cargarán dinámicamente o cuando se seleccione el tipo
//     // Para la carga inicial del dropdown cuando se abre el modal (si un tipo estuviera preseleccionado):
//     // if (this.stockForm.get('tipo')?.value === 'Material') {
//     //   this.materialStore.loadMaterialsForDropdown('');
//     // } else if (this.stockForm.get('tipo')?.value === 'Producto') {
//     //   this.productStore.loadProductsForDropdown('');
//     // }
//   }

//   hideDialog() {
//     this.inventarioStore.closeModalRegisterStock();
//   }

//   // Filtros para dropdowns de Material y Producto (si son server-side)
//   onItemFilter(event: { filter?: string }) {
//     const searchTerm = event.filter?.trim() || '';
//     this.lastItemSearchTerm = searchTerm;
//     const tipoSeleccionado = this.stockForm.get('tipo')?.value;

//     if (tipoSeleccionado === 'Material') {
//       // Llama a un método en MaterialStore para cargar materiales filtrados
//       // this.materialStore.loadMaterialsForDropdown(searchTerm);
//     } else if (tipoSeleccionado === 'Producto') {
//       // Llama a un método en ProductStore para cargar productos filtrados
//       // this.productStore.loadProductsForDropdown(searchTerm);
//     }
//   }

//   onSubmit() {
//     if (this.stockForm.invalid) {
//       this.stockForm.markAllAsTouched();
//       console.error('Formulario de Registro de Stock inválido:', this.stockForm.value);
//       // Considera un toast de error de validación
//       return;
//     }

//     const formValue = this.stockForm.getRawValue();
//     const dataToSend: CreateInventarioData = {
//       tipo: formValue.tipo!, // '!' porque está validado como required
//       stock_actual: formValue.stock_actual!,
//       sucursal_id: formValue.sucursal_id!,
//     };

//     if (formValue.tipo === 'Material') {
//       dataToSend.material_id = formValue.item_id;
//     } else if (formValue.tipo === 'Producto') {
//       dataToSend.producto_id = formValue.item_id;
//     }
//     // dataToSend.estado = formValue.estado; // Si el campo estado está en el form

//     console.log('Enviando para registrar stock:', dataToSend);
//     this.inventarioStore.doRegisterStock(dataToSend);
//   }

// }
