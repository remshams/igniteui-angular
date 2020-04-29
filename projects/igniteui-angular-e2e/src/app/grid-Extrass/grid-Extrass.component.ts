import { Component, ViewChild } from '@angular/core';
import { data } from '../data/data';

import {
    IgxGridComponent
} from 'igniteui-angular';

@Component({
    selector: 'app-grid-extras',
    templateUrl: 'grid-extras.component.html'
})
export class GridExtrasComponent {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public gridWithPK: IgxGridComponent;

    data: any;
    public density = 'compact';
    public displayDensities;

    constructor() {
        this.data = data;
    }
}
