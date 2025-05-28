import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../../../../core/services/auth.service';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
    <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem="!item.separator"
                    [item]="item"
                    [index]="i"
                    [root]="true">  </li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>`
})
export class AppMenu {
    @Input() model: MenuItem[] = [];
}
