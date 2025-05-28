import { Component, inject, OnInit, effect } from '@angular/core';
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
import { MaterialEntity } from '../../../../domain/entities/MaterialEntity';

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
    CheckboxModule,],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {
  materialStore = inject(MaterialStore);
  categoriaStore = inject(CategoriaStore);
  proveedorStore = inject(ProveedorStore);
  colorStore = inject(ColorStore);
  fb = inject(FormBuilder);

  materialForm!: FormGroup;
  private currentMaterialId: number | null = null;

  // Para los templates emptyfilter de los dropdowns
  lastCategoriaSearchTerm: string = '';
  lastProveedorSearchTerm: string = '';
  lastColorSearchTerm: string = '';

  constructor() {
    this.materialForm = this.fb.group({
      cod_articulo: ['', [Validators.required, Validators.maxLength(255)]],
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.maxLength(255)]],
      categoria_id: [null as number | null, [Validators.required]],
      proveedor_id: [null as number | null, [Validators.required]],
      // codigo_barras: [''], // Es generado por backend, usualmente no editable o se maneja diferente
      color_id: [null as number | null, [Validators.required]],
      estado: [true, Validators.required]
    });

    effect(() => {
      const materialToEdit = this.materialStore.materialEdit();
      const modalIsOpen = this.materialStore.isOpenEdit();

      if (modalIsOpen && materialToEdit) {
        console.log('[EditMaterialComponent] Effect: Populating form for material:', materialToEdit);
        this.currentMaterialId = materialToEdit.id;
        this.materialForm.patchValue({
          cod_articulo: materialToEdit.cod_articulo,
          nombre: materialToEdit.nombre,
          descripcion: materialToEdit.descripcion,
          categoria_id: materialToEdit.categoria_id,
          proveedor_id: materialToEdit.proveedor_id,
          // codigo_barras: materialToEdit.codigo_barras, // Si fuera editable
          color_id: materialToEdit.color_id,
          estado: materialToEdit.estado
        });
        // Asegurar que las opciones de los dropdowns estén cargadas, especialmente la seleccionada
        // this.loadDropdownOptionsIfNeeded(materialToEdit);

      } else if (!modalIsOpen) {
        if (this.currentMaterialId !== null) {
          this.materialForm.reset({ estado: true });
          this.currentMaterialId = null;
        }
      }
    });
  }

  ngOnInit() {
    // La carga principal de opciones de dropdown se hará en onModalShow o a través del effect
    // para asegurar que la categoría, proveedor y color del material a editar estén disponibles.
  }

  // private loadDropdownOptionsIfNeeded(material: MaterialEntity) {
  //   // Cargar categorías (tipo material) y asegurar que la actual esté
  //   this.categoriaStore.loadCategoriasForDropdown('', 'material');
  //   // Podrías añadir lógica para asegurar que material.categoria_id esté en las opciones,
  //   // por ejemplo, cargando una página específica o el ítem si no está.

  //   // Cargar proveedores
  //   if (this.proveedorStore.proveedores().length === 0 ||
  //       !this.proveedorStore.proveedores().find(p => p.id === material.proveedor_id)) {
  //     // this.proveedorStore.loadProveedorByIdAndOthers(material.proveedor_id); // Método ideal
  //     this.proveedorStore.doList(); // Carga la primera página, ajusta si es necesario
  //   }

  //   // Cargar colores
  //   if (this.colorStore.colors().length === 0 ||
  //       !this.colorStore.colors().find(c => c.id === material.color_id)) {
  //     // this.colorStore.loadColorByIdAndOthers(material.color_id); // Método ideal
  //     this.colorStore.doList();
  //   }
  // }

  get isModalOpen(): boolean {
    return this.materialStore.isOpenEdit();
  }

  onModalShow() {
    // El effect ya puebla el formulario.
    // La carga de dropdowns se maneja en el effect/ngOnInit para asegurar
    // que las opciones (incluyendo la seleccionada) estén disponibles.
    // const materialToEdit = this.materialStore.materialEdit();
    // if (materialToEdit) {
    //     this.loadDropdownOptionsIfNeeded(materialToEdit);
    // }
    // this.lastCategoriaSearchTerm = '';
    // this.lastProveedorSearchTerm = '';
    // this.lastColorSearchTerm = '';
    // console.log('[EditMaterialComponent] Modal onShow. Current materialEdit:', materialToEdit);
  }

  hideDialog() {
    this.materialStore.closeModalEdit();
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
    // Llama a un método en ProveedorStore para cargar proveedores filtrados por nombre
    // this.proveedorStore.loadProveedoresForDropdown(searchTerm);
  }

  onColorFilter(event: { filter?: string }) {
    const searchTerm = event.filter?.trim() || '';
    this.lastColorSearchTerm = searchTerm;
    // Llama a un método en ColorStore para cargar colores filtrados por nombre
    // this.colorStore.loadColoresForDropdown(searchTerm);
  }

  onSubmit() {
    if (!this.currentMaterialId) {
      console.error('EditMaterialComponent: No hay ID de material para actualizar.');
      return;
    }
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      console.error('EditMaterialComponent: Formulario inválido:', this.materialForm.value);
      return;
    }

    const materialDataToUpdate = { ...this.materialForm.value };
    console.log(`EditMaterialComponent: Enviando para actualizar ID ${this.currentMaterialId}:`, materialDataToUpdate);
    this.materialStore.doUpdate(this.currentMaterialId, materialDataToUpdate);
  }
}
