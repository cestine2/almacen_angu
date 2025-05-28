import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';

import { Subscription } from 'rxjs';
import { MovimientoInventarioStore } from '../../../../../stores/MovimientoInventarioStore';
import { MaterialStore } from '../../../../../stores/MaterialStore';
import { ProductStore } from '../../../../../stores/ProductoStore';
import { SucursalStore } from '../../../../../stores/SucursalStore';
import { CreateMovimientoData } from '../../../../core/services/movimiento-inventario.service';

@Component({
  selector: 'app-create',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {

  movimientoStore = inject(MovimientoInventarioStore);
  materialStore = inject(MaterialStore);
  productStore = inject(ProductStore);
  sucursalStore = inject(SucursalStore);
  fb = inject(FormBuilder);

  movimientoForm!: FormGroup;
  private tipoSubscription?: Subscription;
  private motivoSubscription?: Subscription;

  motivoOptions = [
    { label: 'Seleccione Motivo...', value: null },
    { label: 'Entrada', value: 'entrada' as const },
    { label: 'Salida', value: 'salida' as const },
    { label: 'Ajuste', value: 'ajuste' as const }
  ];

  tipoItemOptions = [
    { label: 'Seleccione Tipo...', value: null },
    { label: 'Material', value: 'Material' as const },
    { label: 'Producto', value: 'Producto' as const }
  ];

  lastItemSearchTerm: string = '';

  constructor() {
    this.movimientoForm = this.fb.group({
      motivo: [null as 'entrada' | 'salida' | 'ajuste' | null, [Validators.required]],
      tipo: [null as 'Material' | 'Producto' | null, [Validators.required]],
      item_id: [null as number | null, [Validators.required]], // Para material_id o producto_id
      cantidad: [null as number | null, [Validators.required, Validators.min(1)]],
      precio_unitario: [{ value: null as number | null, disabled: true }, [Validators.min(0)]], // Deshabilitado por defecto
      sucursal_id: [null as number | null, [Validators.required]],
      // descripcion: [''],
    });

    this.setupConditionalValidation();
  }

  ngOnInit() {
    // Carga de opciones de dropdowns se hará en onModalShow
  }

  ngOnDestroy() {
    this.tipoSubscription?.unsubscribe();
    this.motivoSubscription?.unsubscribe();
  }

  private setupConditionalValidation() {
    // Validación condicional para item_id (ya se maneja mostrando/ocultando dropdowns)

    // Validación condicional para precio_unitario y cantidad
    const tipoControl = this.movimientoForm.get('tipo');
    const precioUnitarioControl = this.movimientoForm.get('precio_unitario');
    const cantidadControl = this.movimientoForm.get('cantidad');
    const motivoControl = this.movimientoForm.get('motivo');

    this.tipoSubscription = tipoControl?.valueChanges.subscribe(tipo => {
      if (tipo === 'Producto') {
        precioUnitarioControl?.setValidators([Validators.required, Validators.min(0)]);
        precioUnitarioControl?.enable();
      } else { // Material u otro
        precioUnitarioControl?.clearValidators();
        precioUnitarioControl?.setValue(null);
        precioUnitarioControl?.disable();
      }
      precioUnitarioControl?.updateValueAndValidity();
      this.movimientoForm.get('item_id')?.setValue(null); // Resetea item al cambiar tipo
      this.lastItemSearchTerm = '';
    });

    this.motivoSubscription = motivoControl?.valueChanges.subscribe(motivo => {
        if (motivo === 'ajuste') {
            // Para 'ajuste', la cantidad puede ser 0 o incluso negativa si el backend lo permite.
            // Por ahora, el backend StoreMovimientoInventarioRequest no lo permite (min:1 si es entrada/salida).
            // Si el backend permite cantidad negativa para ajuste, aquí se quitaría el min(1).
            // Tu backend ya lo maneja: `if ($motivo === 'entrada' || $motivo === 'salida') { $rules['cantidad'][] = 'min:1'; }`
            // Así que esta lógica de frontend es más para la UX del validador min(1) si aplica.
            // Si el motivo es 'ajuste', el validador min(1) no se aplica por la regla del backend.
            // Aquí mantenemos min(1) porque el backend lo fuerza para entrada/salida.
            // Si el backend permitiera negativo para ajuste, el validador de 'cantidad' cambiaría aquí.
             cantidadControl?.setValidators([Validators.required, Validators.pattern(/^-?[0-9]\d*$/)]); // Permite enteros, positivos o negativos, pero no cero.
                                                                                                    // Para permitir cero: Validators.pattern(/^-?(0|[1-9]\d*)$/)
                                                                                                    // O simplemente Validators.required y Validators.pattern("^-?[0-9]\d*$") para enteros
        } else { // entrada o salida
            cantidadControl?.setValidators([Validators.required, Validators.min(1)]);
        }
        cantidadControl?.updateValueAndValidity();
    });
  }

  get isModalOpen(): boolean {
    return this.movimientoStore.isOpenRegisterMovimiento();
  }

  onModalShow() {
    this.movimientoForm.reset({
      motivo: null,
      tipo: null,
      item_id: null,
      cantidad: null,
      precio_unitario: null,
      sucursal_id: null,
      descripcion: '',
    });
    this.lastItemSearchTerm = '';
    // Forzar re-evaluación de validadores condicionales
    this.movimientoForm.get('tipo')?.updateValueAndValidity();
    this.movimientoForm.get('motivo')?.updateValueAndValidity();


    // Cargar opciones para dropdowns
    if (this.sucursalStore.sucursales().length === 0) {
      this.sucursalStore.doList(); // O método para cargar todas las activas
    }
    // Materiales y Productos se cargarán dinámicamente al seleccionar tipo y/o al filtrar
  }

  hideDialog() {
    this.movimientoStore.closeModalRegisterMovimiento();
  }

  // Filtros para dropdowns de Material y Producto
  onItemFilter(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastItemSearchTerm = searchTerm;
    const tipoSeleccionado = this.movimientoForm.get('tipo')?.value;

    if (tipoSeleccionado === 'Material') {
      // this.materialStore.loadMaterialsForDropdown(searchTerm); // Si MaterialStore tiene este método
    } else if (tipoSeleccionado === 'Producto') {
      // this.productStore.loadProductsForDropdown(searchTerm); // Si ProductStore tiene este método
    }
  }

  onSubmit() {
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      console.error('Formulario de Registrar Movimiento inválido:', this.movimientoForm.value);
      return;
    }

    const formValue = this.movimientoForm.getRawValue(); // Usar getRawValue para incluir campos deshabilitados si fuera necesario (no es el caso aquí para precio_unitario si es null)

    const dataToSend: CreateMovimientoData = {
      motivo: formValue.motivo!,
      tipo: formValue.tipo!,
      cantidad: formValue.cantidad!,
      sucursal_id: formValue.sucursal_id!,
      // descripcion: formValue.descripcion || null,
      // precio_unitario es opcional en el tipo base, se añade condicionalmente
    };

    if (formValue.tipo === 'Material') {
      dataToSend.material_id = formValue.item_id;
      dataToSend.precio_unitario = null; // Precio es nullable para Material según StoreMovimientoInventarioRequest
    } else if (formValue.tipo === 'Producto') {
      dataToSend.producto_id = formValue.item_id;
      dataToSend.precio_unitario = formValue.precio_unitario; // Requerido para Producto
    }

    console.log('Enviando para registrar movimiento:', dataToSend);
    this.movimientoStore.doRegisterMovimiento(dataToSend);
  }
}
