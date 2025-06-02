import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SucursalStore } from '../../../../stores/SucursalStore';
import { CreateComponent } from './create/create.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EditComponent } from './edit/edit.component';
import { SucursalEntity } from '../../../domain/entities/SucursalEntity';
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';



@Component({
  selector: 'app-sucursal',
  imports: [CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    Toolbar,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    CreateComponent,
    ConfirmDialogModule, EditComponent],
  templateUrl: './sucursal.component.html',
  styleUrl: './sucursal.component.scss'
})
export class SucursalComponent implements OnInit {
  
  sucursalStore = inject(SucursalStore)
  confirmationService = inject(ConfirmationService); 
  ngOnInit() {
    // Sample data
    this.sucursalStore.doList();
  }
  
  onOpenModalCreate() {
    this.sucursalStore.openModalCreate();
  }


  editBranch(sucursal: SucursalEntity) {
    this.sucursalStore.openModalEdit(sucursal);
  }
  
  // getSeverity(estado: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
  //   switch (estado) {
  //     case 'activo':
  //       return 'success';
  //     case 'inactivo':
  //       return 'danger';
  //     default:
  //       return 'secondary'; // o undefined si prefieres no aplicar ningún estilo
  //   }
  // }
  getSeverity(estado: boolean): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    return estado ? 'success' : 'danger';
  }

 

  deleteBranch(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de desactivar esta categoría?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.sucursalStore.doDelete(id)
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  
}
