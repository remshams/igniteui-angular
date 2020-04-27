import { Component, ViewChild } from '@angular/core';
import { data } from './data';

import {
    IgxGridComponent
} from 'igniteui-angular';

@Component({
    selector: 'app-grid-cellediting',
    templateUrl: 'grid-cellEditing.component.html'
})
export class GridCellEditingComponent {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public gridWithPK: IgxGridComponent;

    data: any;
    public density = 'compact';
    public displayDensities;

    constructor() {
        this.data = data;
    }
}
