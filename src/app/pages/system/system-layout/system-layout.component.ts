import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostBinding, inject, Input, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-system-layout',
  standalone: true,
  imports: [BadgeModule, CommonModule, AvatarModule, MenuModule, ButtonModule,SidebarModule, DrawerModule, RouterModule, FooterComponent, RouterModule, MenubarModule,
    AppMenu, StyleClassModule
    
  ],
  templateUrl: './system-layout.component.html',
  styleUrl: './system-layout.component.scss'
})
export class SystemLayoutComponent implements OnInit {
  
  authService = inject(AuthService);
  menuOutsideClickListener: any;
  overlayMenuOpenSubscription: Subscription;
  layoutService = inject(LayoutService); // Inyecta el servicio
  renderer = inject(Renderer2); // Inyecta el servicio
  router = inject(Router); // Inyecta el servicio

  model: MenuItem[] = [];

  constructor() {
    this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                    if (this.isOutsideClicked(event)) {
                        this.hideMenu();
                    }
                });
            }

            if (this.layoutService.layoutState().staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.hideMenu();
        });
  }

    ngOnInit() {
        this.model = [
            {
                label: 'Inicio',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/system/dashboard'] }]
            },
            {
                label: 'Gestion de Inventario',
                items: [
                    { label: 'Inventario', icon: 'pi pi-fw pi-users', routerLink: ['/system/inventory'] },
                    { label: 'Movimientos', icon: 'pi pi-fw pi-users', routerLink: ['/system/movement'] },
                    { label: 'Productos', icon: 'pi pi-fw pi-shopping-bag', routerLink: ['/system/product'] },
                    { label: 'Materiales', icon: 'pi pi-fw pi-check-square', routerLink: ['/system/material'] },
                                      
                 
                    
                ]
            },
            {
              
              label: 'Catálogo',
              items: [
                    { label: 'Categorias', icon: 'pi pi-fw pi-users', routerLink: ['/system/categoria'] },
                    { label: 'Proveedores', icon: 'pi pi-fw pi-truck', class: 'rotated-icon', routerLink: ['/system/proveedor'] },
                    { label: 'Sucursales', icon: 'pi pi-fw pi-warehouse', routerLink: ['/system/sucursal'] },
                    { label: 'Colores', icon: 'pi pi-fw pi-circle-on', routerLink: ['/system/color'] },
            
            
              ]
              
            },
            {
              
              label: 'Seguridad',
              items: [
                { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/system/user'] },
                { label: 'Roles', icon: 'pi pi-fw pi-lock', routerLink: ['/'] },
                                  
              ]
              
            },
            {
              
              label: 'Reportes',
              items: [{ label: 'Reporte mas vendidos', icon: 'pi pi-fw pi-file', routerLink: ['/'] },
                      { label: 'Reporte de Stock', icon: 'pi pi-fw pi-file', routerLink: ['/'] },
                      { label: 'Reporte de Rentabilidad', icon: 'pi pi-fw pi-file', routerLink: ['/'] },
            
            
              ]
              
            },
            
        ];
    }

    userMenuItems = [
        { 
          icon: 'pi pi-fw pi-user',
          items: [
                {
                  label: 'Configuracion',
                  icon: 'pi pi-fw pi-cog',
                  command: () => this.onProfile()
                },
                {
                  label: 'Salir',
                  icon: 'pi pi-fw pi-sign-out',
                  command: () => this.onLogout()
                }
        ]
      },
        
      ];

      onProfile() {
        console.log('Perfil');
      }
    
      onLogout() {
        this.authService.logout()
      }
      
 get containerClass() {
        return {
            'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
            'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
            'layout-static-inactive': this.layoutService.layoutState().staticMenuDesktopInactive && this.layoutService.layoutConfig().menuMode === 'static',
            'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
            'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
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

        return !(sidebarEl?.isSameNode(eventTarget) || sidebarEl?.contains(eventTarget) || topbarEl?.isSameNode(eventTarget) || topbarEl?.contains(eventTarget));
    }
    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({ ...prev, overlayMenuActive: false, staticMenuMobileActive: false, menuHoverActive: false }));
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
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }


    

    
}
