import { Component } from '@angular/core';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MenuModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
    menu = null;

    items = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];
  
}
