import { CommonModule } from '@angular/common';
import {
    Component, QueryList, Input, Output, EventEmitter, ContentChild, Directive,
    NgModule, TemplateRef, OnInit, AfterViewInit, ContentChildren, OnDestroy, ViewChild, ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, takeWhile } from 'rxjs/operators';
import { growVerIn, growVerOut } from '../animations/grow';
import { IgxCheckboxModule } from '../checkbox/checkbox.component';
import { IgxSelectionAPIService } from '../core/selection';
import { IDragBaseEventArgs, IDragStartEventArgs, IgxDropDirective } from '../directives/drag-drop/drag-drop.directive';
import { IgxExpansionPanelModule } from '../expansion-panel/public_api';
import { ToggleAnimationSettings } from '../expansion-panel/toggle-animation-component';
import { IgxIconModule } from '../icon/public_api';
import { IgxInputGroupModule } from '../input-group/public_api';
import {
    IGX_TREE_COMPONENT, IGX_TREE_SELECTION_TYPE, IgxTree, ITreeNodeToggledEventArgs,
    ITreeNodeTogglingEventArgs, ITreeNodeSelectionEvent, IgxTreeNode, IgxTreeSearchResolver
} from './common';
import { IgxNodeDragModule } from './tree-drag.directive';
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
        { provide: IGX_TREE_COMPONENT, useExisting: IgxTreeComponent }
    ]
})
export class IgxTreeComponent implements IgxTree, OnInit, AfterViewInit, OnDestroy {


    @Input()
    public selection: IGX_TREE_SELECTION_TYPE = IGX_TREE_SELECTION_TYPE.BiState;

    @Input()
    public singleBranchExpand = false;

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


    @Input()
    public get dragDrop(): boolean {
        return this._dragDrop;
    };

    public set dragDrop(val: boolean) {
        this._dragDrop = val;
        if (this._dragDrop) {
            this.subscribeDragEvents();
        }
    }


    @ViewChild(IgxDropDirective, { read: IgxDropDirective })
    public dropDirective: IgxDropDirective;

    @ContentChildren(IgxTreeNodeComponent, { descendants: true })
    private nodes: QueryList<IgxTreeNodeComponent<any>>;

    @ViewChild('dragTemplate', { read: TemplateRef })
    private dragTemplate: TemplateRef<any>;

    @ViewChild('noDragTemplate', { read: TemplateRef })
    private noDragTemplate: TemplateRef<any>;

    public id = `tree-${init_id++}`;

    private _currentNode: IgxTreeNode<any> = null;
    private unsub$: Subject<any> = new Subject();
    private destroy$: Subject<any> = new Subject();
    private _nodeDragged: any = false;
    private _dragDrop = false;

    constructor(private selectionService: IgxSelectionAPIService, private treeService: IgxTreeService, private cdr: ChangeDetectorRef) {
        this.treeService.register(this);
    }

    /** @hidden @internal */
    public get template(): TemplateRef<any> {
        return this.dragDrop ? this.dragTemplate : this.noDragTemplate;
    }

    public expandAll(nodes: IgxTreeNodeComponent<any>[]) { }
    public collapseAll(nodes: IgxTreeNodeComponent<any>[]) { }
    public selectAll(nodes: IgxTreeNodeComponent<any>[]) { }

    public isNodeSelected(node: IgxTreeNodeComponent<any>): boolean {
        return this.selectionService.get(this.id).has(node.id);
    }


    public findNodes<T>(searchTerm: T, comparer?: IgxTreeSearchResolver): IgxTreeNode<T>[] | null {
        const compareFunc = comparer || this._comparer;
        return this.nodes.filter(e => compareFunc(searchTerm, e));
    }

    public ngOnInit() {
        this.selectionService.set(this.id, new Set());
    }
    public ngAfterViewInit() {
        if (this.dragDrop) {
            this.subscribeDragEvents();
        }
    }

    public ngOnDestroy() {
        this.selectionService.clear(this.id);
        this.destroy$.next();
        this.destroy$.complete();
        this.unsub$.next();
        this.unsub$.complete();
    }

    public markForCheck() {
        this.cdr.markForCheck();
    }

    private _comparer = <T>(data: T, node: IgxTreeNodeComponent<T>,) => node.data === data;

    private subscribeDragEvents() {
        this.unsub$.next();
        this.nodes.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.nodes.forEach(node => {
                node.dragEnd.pipe(takeUntil(this.unsub$)).subscribe(event => this.handleDragEnd(event, node));
                node.dragStart.pipe(takeUntil(this.unsub$)).subscribe(event => this.handleDragStart(event, node));
                node.mouseEnter.pipe(takeUntil(this.unsub$), takeWhile(() => this._nodeDragged)).subscribe(() => {
                    this.handleMouseEnter(node);
                });
                node.mouseLeave.pipe(takeUntil(this.unsub$), takeWhile(() => this._nodeDragged)).subscribe(() =>
                    this.handleMouseLeave(node)
                );
            });
        });
    }

    private handleMouseEnter(node: IgxTreeNode<any>) {
        this._currentNode = node;
        console.log(this._currentNode.data);
    }

    private handleMouseLeave(node: IgxTreeNode<any>) {

    }

    private handleDragStart(event: IDragStartEventArgs, node: IgxTreeNodeComponent<any>) {
        this._nodeDragged = true;
    }

    private handleDragEnd(event: IDragBaseEventArgs, node: IgxTreeNodeComponent<any>) {
        this._nodeDragged = false;
    }



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
        IgxExpansionPanelModule,
        IgxNodeDragModule
    ],
    exports: [
        IgxTreeSelectMarkerDirective,
        IgxTreeExpandIndicatorDirective,
        IgxTreeComponent,
        IgxTreeNodeComponent,
        IgxIconModule,
        IgxInputGroupModule,
        IgxCheckboxModule,
        IgxExpansionPanelModule,
        IgxNodeDragModule
    ]
})
export class IgxTreeModule {
}
