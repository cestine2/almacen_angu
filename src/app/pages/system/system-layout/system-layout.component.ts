import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, Renderer2, Signal, computed } from '@angular/core'; // Añadido Renderer2
import { MenuItem } from 'primeng/api';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { MenubarModule } from 'primeng/menubar';
import { StyleClassModule } from 'primeng/styleclass';

import { FooterComponent } from './footer/footer.component';
import { AppMenu } from './app-menu/app.menu'; // Tu componente de menú
import { LayoutService } from '../../../core/services/layout.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../../stores/AuthStore';

@Component({
  selector: 'app-system-layout',
  standalone: true,
  imports: [
    BadgeModule, CommonModule, AvatarModule, MenuModule, ButtonModule,
    SidebarModule, RouterModule, FooterComponent, MenubarModule,
    AppMenu, StyleClassModule
  ],
  templateUrl: './system-layout.component.html',
  styleUrls: ['./system-layout.component.scss']
})
export class SystemLayoutComponent implements OnInit, OnDestroy {

  authService = inject(AuthService);
  authStore = inject(AuthStore);
  layoutService = inject(LayoutService);
  renderer = inject(Renderer2); // Renderer2 inyectado

  menuOutsideClickListener: (() => void) | null = null;
  overlayMenuOpenSubscription?: Subscription;
  userPermissionsSubscription?: Subscription; // Opcional, para reaccionar a cambios de permisos

  model: MenuItem[] = []; // Menú principal, se construirá dinámicamente
  userMenuItems: MenuItem[] = []; // Menú de usuario, se inicializará en ngOnInit
  currentUserName: Signal<string | undefined>;

  constructor() {
    this.currentUserName = computed(() => this.authStore.currentUser()?.nombre);
  }

  ngOnInit() {
    this.buildMainMenu(); // Construye el menú principal basado en permisos


    this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
          const sidebarEl = document.querySelector('.layout-sidebar'); // Ajusta este selector si tu sidebar tiene otra clase
          const topbarEl = document.querySelector('.layout-menu-button'); // Ajusta este selector
          if (this.isOutsideClicked(event, sidebarEl as HTMLElement, topbarEl as HTMLElement)) {
            this.hideMenu();
          }
        });
      }
      if (this.layoutService.layoutState().staticMenuMobileActive) {
        this.blockBodyScroll();
      }
    });

    // this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
    //   this.hideMenu();
    // });

    // Inicializar menú de usuario
    this.userMenuItems = [
        {
            // label: this.authStore.currentUser()?.nombre || 'Usuario', // Mostrar nombre de usuario dinámicamente
            icon: 'pi pi-fw pi-user',
            items: [
                {
                    label: 'Configuración', // O 'Mi Perfil'
                    icon: 'pi pi-fw pi-cog',
                    command: () => this.onProfile()
                },
                {
                    label: 'Salir',
                    icon: 'pi pi-fw pi-sign-out',
                    command: () => this.onLogout()
                }
            ]
        }
    ];
  }

  ngOnDestroy() {
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener(); // Remueve el listener
      this.menuOutsideClickListener = null;
    }
    this.overlayMenuOpenSubscription?.unsubscribe();
    this.userPermissionsSubscription?.unsubscribe();
    this.unblockBodyScroll(); // Asegura que el scroll se desbloquee al destruir
  }

  buildMainMenu() {
    const newModel: MenuItem[] = [];

    // Grupo: Inicio
    // Asumimos que el dashboard es visible para todos los usuarios autenticados.
    // Si requiere un permiso específico, añade la verificación con this.authStore.hasPermission().
    newModel.push({
      label: 'Inicio',
      items: [
        { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/system/dashboard'] }
      ]
    });

    // Grupo: Gestión de Inventario
    const inventarioItems: MenuItem[] = [];
    if (this.authStore.hasPermission('register-inventory')) { // Permiso para ver la tabla de stock
      inventarioItems.push({ label: 'Inventario', icon: 'pi pi-fw pi-table', routerLink: ['/system/inventory'] });
    }
    if (this.authStore.hasPermission('register-inventory-movement')) { // Permiso para ver/registrar movimientos
      inventarioItems.push({ label: 'Movimientos', icon: 'pi pi-fw pi-arrows-h', routerLink: ['/system/movement'] });
    }
    if (this.authStore.hasPermission('manage-products')) {
      inventarioItems.push({ label: 'Productos', icon: 'pi pi-fw pi-shopping-bag', routerLink: ['/system/product'] });
    }
    if (this.authStore.hasPermission('manage-materials')) {
      inventarioItems.push({ label: 'Materiales', icon: 'pi pi-fw pi-box', routerLink: ['/system/material'] });
    }
    if (inventarioItems.length > 0) {
      newModel.push({ label: 'Gestión de Inventario', items: inventarioItems });
    }

    // Grupo: Catálogo
    const catalogoItems: MenuItem[] = [];
    if (this.authStore.hasPermission('manage-product-categories')) { // O un permiso más genérico 'manage-categories'
      catalogoItems.push({ label: 'Categorías', icon: 'pi pi-fw pi-tags', routerLink: ['/system/categoria'] });
    }
    if (this.authStore.hasPermission('manage-suppliers')) {
      catalogoItems.push({ label: 'Proveedores', icon: 'pi pi-fw pi-truck', routerLink: ['/system/proveedor'] });
    }
    if (this.authStore.hasPermission('manage-branches')) {
      catalogoItems.push({ label: 'Sucursales', icon: 'pi pi-fw pi-building', routerLink: ['/system/sucursal'] });
    }
    if (this.authStore.hasPermission('manage-colors')) {
      catalogoItems.push({ label: 'Colores', icon: 'pi pi-fw pi-palette', routerLink: ['/system/color'] });
    }
    if (catalogoItems.length > 0) {
      newModel.push({ label: 'Catálogo', items: catalogoItems });
    }

    // Grupo: Seguridad
    const seguridadItems: MenuItem[] = [];
    if (this.authStore.hasPermission('manage-users')) {
      seguridadItems.push({ label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/system/user'] });
    }
    if (this.authStore.hasPermission('manage-roles')) {
      seguridadItems.push({ label: 'Roles y Permisos', icon: 'pi pi-fw pi-lock', routerLink: ['/system/roles'] });
    }
    if (seguridadItems.length > 0) {
      newModel.push({ label: 'Seguridad', items: seguridadItems });
    }

    // Grupo: Reportes (Añade los permisos correspondientes)
    const reportesItems: MenuItem[] = [];
    if (this.authStore.hasPermission('view-sales-reports')) { // Ejemplo de permiso
      reportesItems.push({ label: 'Reporte de Ventas', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/system/reports/sales'] }); // Ajusta ruta
    }
    if (this.authStore.hasPermission('view-stock-reports')) { // Ejemplo de permiso
      reportesItems.push({ label: 'Reporte de Stock', icon: 'pi pi-fw pi-file-excel', routerLink: ['/system/reports/stock'] }); // Ajusta ruta
    }
    if (this.authStore.hasPermission('view-stock-reports')) { // Ejemplo de permiso
      reportesItems.push({ label: 'Reporte de Stock', icon: 'pi pi-fw pi-file-excel', routerLink: ['/system/reports/stock'] }); // Ajusta ruta
    }
    // Añade más reportes y sus permisos aquí
    if (reportesItems.length > 0) {
      newModel.push({ label: 'Reportes', items: reportesItems });
    }

    this.model = newModel;
    console.log('[SystemLayout] Main menu model built with permissions:', this.model);
  }

  onProfile() {
    console.log('Perfil clicked');
    // this.router.navigate(['/system/profile']); // Ejemplo de navegación
  }

  onLogout() {
    this.authService.logout();
  }

  get containerClass() {
    // Devuelve un objeto de clases basado en el estado del layout
    // Esta lógica depende de cómo tu LayoutService y su estado están implementados.
    // Ejemplo simplificado:
    const state = this.layoutService.layoutState();
    const config = this.layoutService.layoutConfig();
    return {
        'layout-overlay': config.menuMode === 'overlay',
        'layout-static': config.menuMode === 'static',
        'layout-static-inactive': state.staticMenuDesktopInactive && config.menuMode === 'static',
        'layout-overlay-active': state.overlayMenuActive,
        'layout-mobile-active': state.staticMenuMobileActive,
        // Añade otras clases según sea necesario
    };
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
        document.body.classList.add('blocked-scroll');
    } else {
        document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
        document.body.classList.remove('blocked-scroll');
    } else {
        document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  hideMenu() {
    this.layoutService.onMenuToggle(); // O el método que tu LayoutService use para cerrar/ocultar el menú
    // La lógica original era más compleja, la simplifico a la acción de toggle/hide
    // this.layoutService.layoutState.update((prev) => ({ ...prev, overlayMenuActive: false, staticMenuMobileActive: false, menuHoverActive: false }));
    // if (this.menuOutsideClickListener) {
    //   this.menuOutsideClickListener();
    //   this.menuOutsideClickListener = null;
    // }
    // this.unblockBodyScroll();
  }

  isOutsideClicked(event: MouseEvent, sidebarEl: HTMLElement | null, topbarEl: HTMLElement | null): boolean {
    const target = event.target as Node;

    // Si el sidebar o el topbar no existen en el DOM en ese momento, no consideres el clic como "dentro" de ellos.
    const isSidebarTarget = sidebarEl ? (sidebarEl.isSameNode(target) || sidebarEl.contains(target)) : false;
    const isTopbarTarget = topbarEl ? (topbarEl.isSameNode(target) || topbarEl.contains(target)) : false;

    return !(isSidebarTarget || isTopbarTarget);
  }
}