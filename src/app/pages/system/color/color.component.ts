import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, createComponent, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { InputIconModule } from 'primeng/inputicon';
import { RatingModule } from 'primeng/rating';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CreateComponent } from './create/create.component';
import { ColorStore } from '../../../../stores/ColorStore';
import { TagModule } from 'primeng/tag';
import { ColorEntity } from '../../../domain/entities/ColorEntity';
import { EditComponent } from "./edit/edit.component";
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-color',
  imports: [MenuModule, CommonModule, CommonModule, TableModule, FormsModule, ButtonModule, RadioButtonModule, ConfirmDialogModule, ToolbarModule, IconFieldModule, TooltipModule,
    InputIconModule, RatingModule, DialogModule, DropdownModule, SelectModule, InputNumberModule, InputTextModule, CreateComponent, TagModule, EditComponent, EditComponent],
  templateUrl: './color.component.html',
  styleUrl: './color.component.scss'
})
export class ColorComponent {
  constructor(
    // private cdr: ChangeDetectorRef,
    // private messageService: MessageService
  ){}
  //------------------------------------------
  colorStore = inject(ColorStore);
  confirmationService = inject(ConfirmationService);

  ngOnInit(){
    this.colorStore.doList();
  }

  //-----------------------------------------

  // isCreateDialogVisible: boolean = false;
  // productDialog: boolean = false;
  // statuses!: any[];
  
  onOpenModalCreate() {
    this.colorStore.openModalCreate();
  }
  
  // saveProduct() {}
  // hideDialog() {}
  
  // deleteProduct(color: ColorEntity) {
  //   if (color.id) {
  //     if (color.estado) {
  //       // Desactivar
  //       this.colorStore.doDelete(color.id);
  //     } else {
  //       // Reactivar
  //       this.colorStore.doRestore(color.id);
  //     }
  //   }
  // }

  confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de desactivar este color?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.colorStore.doDelete(id)
    });
  }

  editProduct(color: ColorEntity) {
    this.colorStore.openModalEdit(color); // Pasamos el color como array
  }
  

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  
 // MUCHOS MENSAJES
  getSeverity(estado: boolean): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (estado) {
      case true:
        return 'success';
      case false:
        return 'danger';
      default:
        return 'secondary'; // o undefined si prefieres no aplicar ningún estilo
    }
  }
  // openNew() {
  //   this.isCreateDialogVisible = true;
  //   this.cdr.detectChanges();
  // }
}
  

