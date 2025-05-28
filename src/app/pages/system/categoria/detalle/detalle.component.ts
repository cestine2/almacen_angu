import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common'; // TitleCasePipe para el tipo
import { FormsModule } from '@angular/forms'; // Necesario para ngModel si usas inputs deshabilitados
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea'; // Para descripción
import { TagModule } from 'primeng/tag'; // Para mostrar estado y tipo con tags
import { CheckboxModule } from 'primeng/checkbox';
import { CategoriaStore } from '../../../../../stores/CategoriaStore';
import { CategoryEntity } from '../../../../domain/entities/CategoryEntity';

@Component({
  selector: 'app-detalle',
  imports: [CommonModule,
    FormsModule, // Para [(ngModel)] en inputs deshabilitados
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    TagModule,
    CheckboxModule,
    TitleCasePipe,],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class DetalleComponent {
  readonly store = inject(CategoriaStore);

  // Usaremos la signal directamente en el template o un getter si necesitamos transformarla
  // categoria: CategoryEntity | null = null;

  // constructor() {
  //   effect(() => {
  //     this.categoria = this.store.categoriaDetalle();
  //     console.log('[DetalleCategoria] Categoria para detalle actualizada:', this.categoria);
  //   });
  // }

  ngOnInit() {
    // No se necesita lógica especial en ngOnInit si el effect o el template leen directamente del store
  }

  get isModalOpen(): boolean {
    return this.store.isOpenDetalle();
  }

  // Para obtener la categoría actual a mostrar
  get categoriaActual(): CategoryEntity | null {
    return this.store.categoriaDetalle();
  }

  hideDialog() {
    this.store.closeModalDetalle();
  }

  // Helpers para mostrar el estado y tipo con p-tag (opcional, puedes hacerlo en el template)
  getEstadoTagSeverity(estado: boolean | undefined): 'success' | 'danger' {
    return estado ? 'success' : 'danger';
  }

  getTipoTagSeverity(tipo: 'producto' | 'material' | string | undefined): 'info' | 'info' | 'warn' {
    if (tipo === 'producto') return 'info'; // O el color que prefieras
    if (tipo === 'material') return 'warn'; // O el color que prefieras
    return 'info';
  }
}
