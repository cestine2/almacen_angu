import { ChangeDetectorRef, Component, HostBinding, inject, Input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../../../../core/services/layout.service';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-menuitem]',
    imports: [CommonModule, RouterModule, RippleModule, AppMenuitem],
    template: `
         <ng-container *ngIf="item">
            <div *ngIf="root && item.visible !== false"
                 class="layout-menuitem-root-text">
                {{ item.label }}
                </div>

            <a *ngIf="!root && item.visible !== false"
               [routerLink]="item.routerLink"
               [attr.href]="item.url"
               (click)="itemClick($event)"
               [ngClass]="item.styleClass"
               [attr.target]="item.target"
               tabindex="0"
               pRipple
               routerLinkActive="active-route"
               [routerLinkActiveOptions]="item.routerLinkActiveOptions || { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }">

                <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
                <span class="layout-menuitem-text">{{ item.label }}</span>
                <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items"></i>
            </a>

            <ul *ngIf="item.items && item.visible !== false && (root || active)">
                <ng-template ngFor let-child let-i="index" [ngForOf]="item.items">
                    <li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child['badgeClass']"></li>
                </ng-template>
            </ul>
        </ng-container>
    `
})
export class AppMenuitem {
    @Input() item: MenuItem | undefined; // Usamos | undefined para evitar errores iniciales

    @Input() index!: number;

    @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;

    @Input() parentKey!: string;

    active = false;

    menuSourceSubscription: Subscription;
    routerEventsSubscription: Subscription;
    menuResetSubscription: Subscription;

    key: string = '';

    layoutService = inject(LayoutService);
    router = inject(Router);
    cd = inject(ChangeDetectorRef);

    constructor() {
        this.menuSourceSubscription = this.layoutService.menuSource$.subscribe((value) => {
            Promise.resolve(null).then(() => {
                if (value.routeEvent) {
                    this.active = (value.key === this.key || value.key.startsWith(this.key + '-'));
                } else {
                    if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
                        this.active = false;
                    }
                }
                this.cd.markForCheck();
            });
        });

        this.menuResetSubscription = this.layoutService.resetSource$.subscribe(() => {
            this.active = false;
            this.cd.markForCheck();
        });

        this.routerEventsSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            if (this.item && this.item.routerLink) {
                this.updateActiveStateFromRoute();
            }
        });
    }

    ngOnInit() {
        this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);
        if (this.item && this.item.routerLink) {
            this.updateActiveStateFromRoute();
        }
    }

    updateActiveStateFromRoute() {
        if (this.item && this.item.routerLink) {
            let activeRoute = this.router.isActive(this.item.routerLink[0], { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' });
            if (activeRoute) {
                this.layoutService.onMenuStateChange({ key: this.key, routeEvent: true });
            }
        }
    }

    itemClick(event: Event) {
        if (!this.item) return;

        if (this.item.disabled) {
            event.preventDefault();
            return;
        }

        if (this.item.command) {
            this.item.command({ originalEvent: event, item: this.item });
        }

        // La propiedad 'active' se sigue usando para alternar la visibilidad
        if (this.item.items) {
            this.active = !this.active;
        }

        this.layoutService.onMenuStateChange({ key: this.key });
    }


    @HostBinding('class.active-menuitem')
    get activeClass() {
        return this.active && !this.root;
    }

    ngOnDestroy() {
        this.menuSourceSubscription?.unsubscribe();
        this.menuResetSubscription?.unsubscribe();
    }
    
}
