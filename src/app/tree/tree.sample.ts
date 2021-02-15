import { useAnimation } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { growVerIn, growVerOut, IgxTreeComponent } from 'igniteui-angular';
import { HIERARCHICAL_SAMPLE_DATA } from '../shared/sample-data';

@Component({
    selector: 'app-tree-sample',
    templateUrl: 'tree.sample.html',
    styleUrls: ['tree.sample.scss']
})
export class TreeSampleComponent {
    @ViewChild(IgxTreeComponent, { read: IgxTreeComponent })
    public tree: IgxTreeComponent;

    public animationDuration = 400;

    public data = HIERARCHICAL_SAMPLE_DATA;

    public get animationSettings() {
        return  {
            openAnimation: useAnimation(growVerIn, {
                params: {
                    duration: `${this.animationDuration}ms`
                }
            }),
            closeAnimation: useAnimation(growVerOut, {
                params: {
                    duration: `${this.animationDuration}ms`
                }
            })
        };
    }
}
