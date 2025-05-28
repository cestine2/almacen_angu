// import { Component, inject, OnInit, effect } from '@angular/core';
// import { CommonModule, TitleCasePipe } from '@angular/common';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { DialogModule } from 'primeng/dialog';
// import { ButtonModule } from 'primeng/button';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { DropdownModule } from 'primeng/dropdown'; // Para Sucursal y Estado
// import { CheckboxModule } from 'primeng/checkbox'; 
// import { SucursalStore } from '../../../../../stores/SucursalStore';
// import { InventarioStore } from '../../../../../stores/InventarioStore';
// import { UpdateInventarioData } from '../../../../core/services/inventario.service';
// import { InventarioEntity } from '../../../../domain/entities/InventarioEntity';

// @Component({
//   selector: 'app-edit',
//   imports: [CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     DialogModule,
//     ButtonModule,
//     InputNumberModule,
//     DropdownModule,
//     CheckboxModule,
//     TitleCasePipe,],
//   templateUrl: './edit.component.html',
//   styleUrl: './edit.component.scss'
// })
// export class EditComponent {

//   inventarioStore = inject(InventarioStore);
//   sucursalStore = inject(SucursalStore);
//   fb = inject(FormBuilder);

//   stockForm!: FormGroup;
//   private currentInventarioId: number | null = null;
  
//   // Para mostrar información no editable
//   displayItemName: string = '';
//   displayItemType: string = '';

//   // Opciones para el dropdown de estado
//   statusOptions = [
//     { label: 'Activo', value: true },
//     { label: 'Inactivo', value: false }
//   ];

//   constructor() {
//     this.stockForm = this.fb.group({
//       // Campos editables según UpdateInventarioRequest
//       stock_actual: [null as number | null, [Validators.required, Validators.min(0)]], // Puede ser 0 si se ajusta a 0
//       sucursal_id: [null as number | null, [Validators.required]],
//       estado: [true, [Validators.required]]
//     });

//     effect(() => {
//       const inventarioToEdit = this.inventarioStore.inventarioEdit();
//       const modalIsOpen = this.inventarioStore.isOpenEditStock();

//       if (modalIsOpen && inventarioToEdit) {
//         console.log('[EditStockComponent] Effect: Populating form for inventario:', inventarioToEdit);
//         this.currentInventarioId = inventarioToEdit.id;

//         // Poblar información de display
//         this.displayItemType = inventarioToEdit.tipo;
//         this.displayItemName = this.getItemNameForDisplay(inventarioToEdit);

//         this.stockForm.patchValue({
//           stock_actual: inventarioToEdit.stock_actual,
//           sucursal_id: inventarioToEdit.sucursal_id,
//           estado: inventarioToEdit.estado
//         });

//         // Cargar sucursales si es necesario para el dropdown
//         if (this.sucursalStore.sucursales().length === 0 ||
//             !this.sucursalStore.sucursales().find(s => s.id === inventarioToEdit.sucursal_id)) {
//             // this.sucursalStore.loadSucursalByIdAndOthers(inventarioToEdit.sucursal_id); // Ideal
//             this.sucursalStore.doList(); // Carga la primera página, ajusta si necesitas todas activas
//         }

//       } else if (!modalIsOpen) {
//         if (this.currentInventarioId !== null) {
//           this.stockForm.reset({ estado: true }); // Reset a valores por defecto
//           this.currentInventarioId = null;
//           this.displayItemName = '';
//           this.displayItemType = '';
//         }
//       }
//     });
//   }

//   ngOnInit() {
//     // La carga de sucursales para el dropdown se maneja en el effect/onModalShow
//     // para asegurar que la opción seleccionada esté disponible.
//   }

//   // Helper para obtener el nombre del ítem para mostrar (copiado/adaptado de InventarioComponent)
//   private getItemNameForDisplay(inventario: InventarioEntity): string {
//     if (inventario.item && inventario.item.nombre) {
//       return inventario.item.nombre;
//     }
//     if (inventario.tipo === 'Material' && inventario.material && inventario.material.nombre) {
//       return inventario.material.nombre;
//     }
//     if (inventario.tipo === 'Producto' && inventario.producto && inventario.producto.nombre) {
//       return inventario.producto.nombre;
//     }
//     return inventario.tipo === 'Material' ? `Material (ID: ${inventario.material_id || 'N/A'})` : `Producto (ID: ${inventario.producto_id || 'N/A'})`;
//   }


//   get isModalOpen(): boolean {
//     return this.inventarioStore.isOpenEditStock();
//   }

//   onModalShow() {
//     // El effect ya puebla el formulario.
//     // Aquí podrías forzar la carga de sucursales si es necesario.
//     const inventarioToEdit = this.inventarioStore.inventarioEdit();
//     if (inventarioToEdit) {
//         if (this.sucursalStore.sucursales().length === 0 ||
//             !this.sucursalStore.sucursales().find(s => s.id === inventarioToEdit.sucursal_id)) {
//             this.sucursalStore.doList(); // O el método para cargar todas las sucursales activas
//         }
//     }
//     console.log('[EditStockComponent] Modal onShow. Current inventarioEdit:', inventarioToEdit);
//   }

//   hideDialog() {
//     this.inventarioStore.closeModalEditStock();
//   }

//   onSubmit() {
//     if (!this.currentInventarioId) {
//       console.error('EditStockComponent: No hay ID de inventario para actualizar.');
//       return;
//     }

//     if (this.stockForm.invalid) {
//       this.stockForm.markAllAsTouched();
//       console.error('EditStockComponent: Formulario inválido:', this.stockForm.value);
//       return;
//     }

//     const dataToUpdate: UpdateInventarioData = { ...this.stockForm.value };

//     console.log(`EditStockComponent: Enviando para actualizar ID ${this.currentInventarioId}:`, dataToUpdate);
//     this.inventarioStore.doUpdateStock(this.currentInventarioId, dataToUpdate);
//   }
// }
