import { CommonModule } from '@angular/common';
import { Component, QueryList, Input, Output, EventEmitter, ContentChild, Directive,
    NgModule, TemplateRef, OnInit, AfterViewInit, ContentChildren, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { growVerIn, growVerOut } from '../animations/grow';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxExpansionPanelModule } from '../expansion-panel/public_api';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { IgxIconModule } from '../icon/public_api';
import { IgxInputGroupModule } from '../input-group/public_api';
import { IGX_TREE_COMPONENT, IGX_TREE_SELECTION_TYPE, IgxTree, ITreeNodeToggledEventArgs,
    ITreeNodeTogglingEventArgs, ITreeNodeSelectionEvent, IgxTreeNode } from './common';
import { IgxTreeNodeComponent } from './tree-node/tree-node.component';
import { IgxTreeService } from './tree.service';

let init_id = 0;

@Directive({
    selector: '[igxTreeSelectMarker]'
})
export class IgxTreeSelectMarkerDirective {
}

@Directive({
    selector: '[igxTreeExpandIndicator]'
})
export class IgxTreeExpandIndicatorDirective {
}

@Component({
    selector: 'igx-tree',
    templateUrl: 'tree.component.html',
    styleUrls: ['tree.component.scss'],
    providers: [
        IgxTreeService,
        { provide: IGX_TREE_COMPONENT, useExisting: IgxTreeComponent}
    ]
})
export class IgxTreeComponent implements IgxTree, OnInit, AfterViewInit, OnDestroy {
    @Input()
    public selection: IGX_TREE_SELECTION_TYPE = IGX_TREE_SELECTION_TYPE.BiState;

    @Input()
    public animationSettings: ToggleAnimationSettings = {
        openAnimation: growVerIn,
        closeAnimation: growVerOut
    };

    @Output()
    public nodeSelection = new EventEmitter<ITreeNodeSelectionEvent>();

    @Output()
    public nodeExpanding = new EventEmitter<ITreeNodeTogglingEventArgs>();

    @Output()
    public nodeExpanded = new EventEmitter<ITreeNodeToggledEventArgs>();

    @Output()
    public nodeCollapsing = new EventEmitter<ITreeNodeTogglingEventArgs>();

    @Output()
    public nodeCollapsed = new EventEmitter<ITreeNodeToggledEventArgs>();

    @ContentChild(IgxTreeSelectMarkerDirective, { read: TemplateRef })
    public selectMarker: TemplateRef<any>;

    @ContentChild(IgxTreeExpandIndicatorDirective, { read: TemplateRef })
    public expandIndicator: TemplateRef<any>;

    @ContentChildren(IgxTreeNodeComponent)
    private nodes: QueryList<IgxTreeNodeComponent<any>>;

    public id = `tree-${init_id++}`;

    constructor(private selectionService: IgxSelectionAPIService, private treeService: IgxTreeService) {}

    public select(node: IgxTreeNodeComponent<any>): void {
        this.selectionService.select_item(this.id, node.id);
    }

    public deselect(node: IgxTreeNodeComponent<any>): void {
        this.selectionService.deselect_item(this.id, node.id);
    }

    public isNodeSelected(node: IgxTreeNodeComponent<any>): boolean {
        return this.selectionService.get(this.id).has(node.id);
    }

    public expand(node: IgxTreeNodeComponent<any>): void {
        const nodeId = node.id;
        if (this.treeService.isExpanded(nodeId)) {
            return;
        }
        const args: ITreeNodeTogglingEventArgs = {
            owner: this,
            node,
            cancel: false

        };
        this.nodeExpanding.emit(args);
        if (!args.cancel) {
            this.treeService.expand(nodeId);
            this.nodeExpanded.emit({
                owner: this,
                node
            });
        }
    }

    public collapse(node: IgxTreeNodeComponent<any>): void {
        node.expanded = false;
    }



    public toggle(node: IgxTreeNodeComponent<any>): void {
        const nodeId = node.id;
        if (this.treeService.isExpanded(nodeId)) {
            this.collapse(node);
        } else {
            this.expand(node);
        }
    }


    public findNode(data: any, comparer?: <T>(node: IgxTreeNodeComponent<T>, data: T) => boolean): IgxTreeNode {
        const compareFunc = comparer || this.comparer;
        return this.nodes.find(e => compareFunc(e, data));
    }

    public ngOnInit() {
        this.selectionService.set(this.id, new Set());
    }
    public ngAfterViewInit() {

    }

    public ngOnDestroy() {
        this.selectionService.clear(this.id);
    }

    private comparer = <T>(node: IgxTreeNodeComponent<T>, data: T) => node.data === data;
}

/**
 * NgModule defining the components and directives needed for `igx-tree`
 */
@NgModule({
    declarations: [
        IgxTreeSelectMarkerDirective,
        IgxTreeExpandIndicatorDirective,
        IgxTreeComponent,
        IgxTreeNodeComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IgxIconModule,
        IgxInputGroupModule,
        IgxCheckboxModule,
        IgxExpansionPanelModule
    ],
    exports: [
        IgxTreeSelectMarkerDirective,
        IgxTreeExpandIndicatorDirective,
        IgxTreeComponent,
        IgxTreeNodeComponent,
        IgxIconModule,
        IgxInputGroupModule,
        IgxCheckboxModule,
        IgxExpansionPanelModule
    ]
})
export class IgxTreeModule {
}
