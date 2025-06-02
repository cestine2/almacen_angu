import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, Renderer2, Signal } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { DrawerModule } from 'primeng/drawer';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { LayoutService } from '../../../core/services/layout.service';
import { AuthService } from '../../../core/services/auth.service';
import { MenubarModule } from 'primeng/menubar';
import { filter, Subscription } from 'rxjs';
import { AppMenu } from './app-menu/app.menu';
import { StyleClassModule } from 'primeng/styleclass';
import { AuthStore } from '../../../../stores/AuthStore';

@Component({
  selector: 'app-system-layout',
  standalone: true,
  imports: [
    BadgeModule,
    CommonModule,
    AvatarModule,
    MenuModule,
    ButtonModule,
    SidebarModule,
    DrawerModule,
    RouterModule,
    FooterComponent,
    RouterModule,
    MenubarModule,
    AppMenu,
    StyleClassModule,
  ],
  templateUrl: './system-layout.component.html',
  styleUrl: './system-layout.component.scss',
})
export class SystemLayoutComponent implements OnInit {
  authService = inject(AuthService);
  menuOutsideClickListener: any;
  overlayMenuOpenSubscription: Subscription;
  layoutService = inject(LayoutService); // Inyecta el servicio
  renderer = inject(Renderer2); // Inyecta el servicio
  router = inject(Router); // Inyecta el servicio
  authStore = inject(AuthStore);
  currentUserName: Signal<string | undefined>;
  model: MenuItem[] = [];

  constructor() {
    this.currentUserName = computed(() => {
        const authData = this.authStore.currentUser(); // authData es el objeto { data: UserEntity, permissions: ... } o null
        console.log('[SystemLayout] authData from store for currentUserName:', authData);
        return authData?.nombre; // <<< CORRECCIÓN: Acceder a authData.data.nombre
    });
    this.overlayMenuOpenSubscription =
      this.layoutService.overlayOpen$.subscribe(() => {
        if (!this.menuOutsideClickListener) {
          this.menuOutsideClickListener = this.renderer.listen(
            'document',
            'click',
            (event) => {
              if (this.isOutsideClicked(event)) {
                this.hideMenu();
              }
            }
          );
        }

        if (this.layoutService.layoutState().staticMenuMobileActive) {
          this.blockBodyScroll();
        }
      });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.hideMenu();
      });
  }

  ngOnInit() {
    this.buildMainMenu();
  }
  buildMainMenu() {
    const newModel: MenuItem[] = [];

    // Grupo: Inicio
    // Asumimos que el dashboard es visible para todos los usuarios autenticados.
    // Si requiere un permiso específico, añade la verificación con this.authStore.hasPermission().
    newModel.push({
      label: 'Inicio',
      items: [
        {
          label: 'Dashboard',
          icon: 'pi pi-fw pi-home',
          routerLink: ['/system/dashboard'],
        },
      ],
    });

    // Grupo: Gestión de Inventario
    const inventarioItems: MenuItem[] = [];
    if (this.authStore.hasPermission('register-inventory')) {
      // Permiso para ver la tabla de stock
      inventarioItems.push({
        label: 'Inventario',
        icon: 'pi pi-fw pi-table',
        routerLink: ['/system/inventory'],
      });
    }
    if (this.authStore.hasPermission('register-inventory-movement')) {
      // Permiso para ver/registrar movimientos
      inventarioItems.push({
        label: 'Movimientos',
        icon: 'pi pi-fw pi-arrows-h',
        routerLink: ['/system/movement'],
      });
    }
    if (this.authStore.hasPermission('manage-products')) {
      inventarioItems.push({
        label: 'Productos',
        icon: 'pi pi-fw pi-shopping-bag',
        routerLink: ['/system/product'],
      });
    }
    if (this.authStore.hasPermission('manage-materials')) {
      inventarioItems.push({
        label: 'Materiales',
        icon: 'pi pi-fw pi-box',
        routerLink: ['/system/material'],
      });
    }
    if (inventarioItems.length > 0) {
      newModel.push({ label: 'Gestión de Inventario', items: inventarioItems });
    }

    // Grupo: Catálogo
    const catalogoItems: MenuItem[] = [];
    if (this.authStore.hasPermission('manage-product-categories')) {
      // O un permiso más genérico 'manage-categories'
      catalogoItems.push({
        label: 'Categorías',
        icon: 'pi pi-fw pi-tags',
        routerLink: ['/system/categoria'],
      });
    }
    if (this.authStore.hasPermission('manage-suppliers')) {
      catalogoItems.push({
        label: 'Proveedores',
        icon: 'pi pi-fw pi-truck',
        routerLink: ['/system/proveedor'],
      });
    }
    if (this.authStore.hasPermission('manage-branches')) {
      catalogoItems.push({
        label: 'Sucursales',
        icon: 'pi pi-fw pi-building',
        routerLink: ['/system/sucursal'],
      });
    }
    if (this.authStore.hasPermission('manage-colors')) {
      catalogoItems.push({
        label: 'Colores',
        icon: 'pi pi-fw pi-palette',
        routerLink: ['/system/color'],
      });
    }
    if (catalogoItems.length > 0) {
      newModel.push({ label: 'Catálogo', items: catalogoItems });
    }

    // Grupo: Seguridad
    const seguridadItems: MenuItem[] = [];
    if (this.authStore.hasPermission('manage-users')) {
      seguridadItems.push({
        label: 'Usuarios',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/system/user'],
      });
    }
    if (this.authStore.hasPermission('manage-roles')) {
      seguridadItems.push({
        label: 'Roles y Permisos',
        icon: 'pi pi-fw pi-lock',
        routerLink: ['/system/roles'],
      });
    }
    if (seguridadItems.length > 0) {
      newModel.push({ label: 'Seguridad', items: seguridadItems });
    }

    // Grupo: Reportes (Añade los permisos correspondientes)
    const reportesItems: MenuItem[] = [];
    if (this.authStore.hasPermission('view-sales-reports')) {
      // Ejemplo de permiso
      reportesItems.push({
        label: 'Reporte de Ventas',
        icon: 'pi pi-fw pi-chart-bar',
        routerLink: ['/system/reports/sales'],
      }); // Ajusta ruta
    }
    if (this.authStore.hasPermission('view-stock-reports')) {
      // Ejemplo de permiso
      reportesItems.push({
        label: 'Reporte de Stock',
        icon: 'pi pi-fw pi-file-excel',
        routerLink: ['/system/reports/stock'],
      }); // Ajusta ruta
    }
    if (this.authStore.hasPermission('view-stock-reports')) {
      // Ejemplo de permiso
      reportesItems.push({
        label: 'Reporte de Rentabilidad',
        icon: 'pi pi-fw pi-file-excel',
        routerLink: ['/system/reports/stock'],
      }); // Ajusta ruta
    }
    // Añade más reportes y sus permisos aquí
    if (reportesItems.length > 0) {
      newModel.push({ label: 'Reportes', items: reportesItems });
    }

    this.model = newModel;
    console.log(
      '[SystemLayout] Main menu model built with permissions:',
      this.model
    );
  }

  userMenuItems = [
    {
      icon: 'pi pi-fw pi-user',
      items: [
        {
          label: 'Configuracion',
          icon: 'pi pi-fw pi-cog',
          command: () => this.onProfile(),
        },
        {
          label: 'Salir',
          icon: 'pi pi-fw pi-sign-out',
          command: () => this.onLogout(),
        },
      ],
    },
  ];

  onProfile() {
    console.log('Perfil');
  }

  onLogout() {
    this.authService.logout();
  }

  get containerClass() {
    return {
      'layout-overlay':
        this.layoutService.layoutConfig().menuMode === 'overlay',
      'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
      'layout-static-inactive':
        this.layoutService.layoutState().staticMenuDesktopInactive &&
        this.layoutService.layoutConfig().menuMode === 'static',
      'layout-overlay-active':
        this.layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active':
        this.layoutService.layoutState().staticMenuMobileActive,
    };
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }
  isOutsideClicked(event: MouseEvent) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');
    const eventTarget = event.target as Node;

    return !(
      sidebarEl?.isSameNode(eventTarget) ||
      sidebarEl?.contains(eventTarget) ||
      topbarEl?.isSameNode(eventTarget) ||
      topbarEl?.contains(eventTarget)
    );
  }
  hideMenu() {
    this.layoutService.layoutState.update((prev) => ({
      ...prev,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false,
    }));
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }
  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp(
          '(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)',
          'gi'
        ),
        ' '
      );
    }
  }
}
