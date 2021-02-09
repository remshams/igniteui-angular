import {
    Component, OnInit,
    OnDestroy, Input, Inject, ViewChild, TemplateRef, AfterViewInit, QueryList, ContentChildren, Optional, SkipSelf,
    HostBinding
} from '@angular/core';
import { IgxSelectionAPIService } from '../../core/selection';
import { IGX_TREE_COMPONENT, IgxTree, IgxTreeNode, IGX_TREE_NODE_COMPONENT } from '../common';
import { IgxTreeService } from '../tree.service';


let nodeId = 0;

/**
 *
 * The tree node component represents a child node of the tree component or another tree node.
 * Usage:
 *
 * ```html
 *  <igx-tree>
 *  ...
 *    <igx-tree-node [data]="data" [selected]="service.isNodeSelected(data.Key)" [expanded]="service.isNodeExpanded(data.Key)">
 *      {{ data.FirstName }} {{ data.LastName }}
 *    </tree>
 *  ...
 *  </igx-tree>
 * ```
 */
@Component({
    selector: 'igx-tree-node',
    templateUrl: 'tree-node.component.html',
    styleUrls: ['tree-node.component.scss'],
    providers: [
        { provide: IGX_TREE_NODE_COMPONENT, useExisting: IgxTreeNodeComponent }
    ]
})
export class IgxTreeNodeComponent implements IgxTreeNode, OnInit, AfterViewInit, OnDestroy {
    @Input()
    public data: any;

    @Input()
    public selectMarker: TemplateRef<any>;

    @Input()
    public expandIndicator: TemplateRef<any>;

    @HostBinding('class.igx-tree-node')
    public cssClass='igx-tree-node';

    @ContentChildren(IGX_TREE_NODE_COMPONENT, { read: IGX_TREE_NODE_COMPONENT })
    public children: QueryList<IgxTreeNode>;

    @ViewChild('defaultSelect', { read: TemplateRef, static: true })
    private _defaultSelectMarker: TemplateRef<any>;

    @ViewChild('defaultIndicator', { read: TemplateRef, static: true })
    private _defaultExpandIndicatorTemplate: TemplateRef<any>;

    public inEdit = false;

    public id = `igxTreeNode_${nodeId++}`;

    constructor(
        @Inject(IGX_TREE_COMPONENT) public tree: IgxTree,
        protected selectionService: IgxSelectionAPIService,
        protected treeService: IgxTreeService,
        @Optional() @SkipSelf() @Inject(IGX_TREE_NODE_COMPONENT) public parentNode: IgxTreeNode
    ) { }

    public get level(): number {
        return this.parentNode ? this.parentNode.level + 1 : 0;
    }

    @Input()
    public get selected(): boolean {
        return this.selectionService.get(this.tree.id).has(this.id);
    }

    public set selected(val: boolean) {
        if (val) {
            this.tree.select(this);
        } else {
            this.tree.deselect(this);
        }
    }

    @Input()
    public get expanded() {
        return this.treeService.isExpanded(this.id);
    }

    public set expanded(val: boolean) {
        if (val) {
            this.tree.expand(this);
        } else {
            this.tree.collapse(this);
        }
    }

    public get selectMarkerTemplate(): TemplateRef<any> {
        return this.selectMarker ? this.selectMarker : this._defaultSelectMarker;
    }

    public get expandIndicatorTemplate(): TemplateRef<any> {
        return this.expandIndicator ? this.expandIndicator : this._defaultExpandIndicatorTemplate;
    }

    public get templateContext(): any {
        return {
            $implicit: this
        };
    }

    /** @hidden @internal */
    public cancelInteraction(event: any) {
        event.cancel = true;
    }

    public ngOnInit() {
    }

    public ngAfterViewInit() {
    }

    public ngOnDestroy() {

    }
}
