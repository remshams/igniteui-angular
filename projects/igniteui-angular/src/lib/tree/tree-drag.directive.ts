import { Directive, Input, OnDestroy, NgModule, TemplateRef } from '@angular/core';
import { IgxDragDirective } from '../directives/drag-drop/drag-drop.directive';
import { IgxTree, IgxTreeNode } from './common';
import { IgxTreeNodeComponent } from './tree-node/tree-node.component';


const ghostBackgroundClass = 'igx-grid__tr--ghost';
const gridCellClass = 'igx-grid__td';
const rowSelectedClass = 'igx-grid__tr--selected';
const cellSelectedClass = 'igx-grid__td--selected';
const cellActiveClass = 'igx-grid__td--active';

interface INodeDragBaseEvent {
    dragDirective: IgxNodeDragDirective;
    node: IgxTreeNode<any>;
    owner: IgxTree;
}
export interface INodeDragEndEvent extends INodeDragBaseEvent {
    animation: boolean;
}

export interface INodeDragStartEventArgs extends INodeDragBaseEvent {
    cancel: boolean;
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxNodeDrag]'
})
export class IgxNodeDragDirective extends IgxDragDirective implements OnDestroy {
    @Input('igxNodeDrag')
    public node: IgxTreeNodeComponent<any>;
    private _nodeDragStarted = false;

    public onPointerDown(event) {
        event.preventDefault();
        this._nodeDragStarted = false;
        this._removeOnDestroy = false;
        super.onPointerDown(event);
    }

    public onPointerMove(event) {
        super.onPointerMove(event);
        if (this._dragStarted && !this._nodeDragStarted) {
            this._nodeDragStarted = true;
            const args: INodeDragStartEventArgs = {
                dragDirective: this,
                node: this.node,
                cancel: false,
                owner: this.node.tree
            };

            this.node.dragStart.emit(args);
            if (args.cancel) {
                this.ghostElement.parentNode.removeChild(this.ghostElement);
                this.ghostElement = null;
                this._dragStarted = false;
                this._clicked = false;
                return;
            }
            this.node.tree.markForCheck();
        }
    }

    public onPointerUp(event) {

        if (!this._clicked) {
            return;
        }

        const args: INodeDragEndEvent = {
            dragDirective: this,
            node: this.node,
            animation: false,
            owner: this.node.tree
        };
        this.zone.run(() => {
            this.node.dragEnd.emit(args);
        });

        const dropArea = this._lastDropArea;
        super.onPointerUp(event);
        if (!dropArea && this.ghostElement) {
            this.ghostElement.addEventListener('transitionend', this.transitionEndEvent, false);
        }   else {
            this.endDragging();
        }
    }

    protected createGhost(pageX, pageY) {
        this.node.tree.markForCheck();
        this.ghostContext = {
            $implicit: this.node,
            data: this.node,
            tree: this.node.tree
        };
        super.createGhost(160, 160, this.node.nativeElement);

        // check if there is an expander icon and create the ghost at the corresponding position

        const ghost = this.ghostElement;

        const nodeRect = this.node.nativeElement.getBoundingClientRect();
        ghost.style.overflow = 'hidden';
        ghost.style.width = nodeRect.width + 'px';
        ghost.style.height = nodeRect.height + 'px';

        this.renderer.addClass(ghost, ghostBackgroundClass);
        this.renderer.removeClass(ghost, rowSelectedClass);

        const ghostCells = ghost.getElementsByClassName(gridCellClass);
        for (const cell of ghostCells) {
            this.renderer.removeClass(cell, cellSelectedClass);
            this.renderer.removeClass(cell, cellActiveClass);
        }
    }

    private emitEndDrag() {
        const args: INodeDragEndEvent = {
            dragDirective: this,
            node: this.node,
            animation: false,
            owner: this.node.tree
        };
        this.zone.run(() => {
            this.node.dragEnd.emit(args);
        });
    }

    private endDragging() {
        this.onTransitionEnd(null);
        this.emitEndDrag();
        this.node.tree.markForCheck();
    }

    private transitionEndEvent = (evt?) => {
        if (this.ghostElement) {
            this.ghostElement.removeEventListener('transitionend', this.transitionEndEvent, false);
        }
        this.endDragging();
    };
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxNodeDragIndicatorIcon]'
})

export class IgxNodeDragIndicatorIconDirective {
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxNodeDragGhost]'
})

export class IgxNodeDragGhostDirective  {
    constructor(public templateRef: TemplateRef<any>) { }
}

@NgModule({
    declarations: [IgxNodeDragDirective, IgxNodeDragGhostDirective, IgxNodeDragIndicatorIconDirective],
    entryComponents: [],
    exports: [IgxNodeDragDirective, IgxNodeDragGhostDirective, IgxNodeDragIndicatorIconDirective],
    imports: []
})

export class IgxNodeDragModule {
}
