import { EventEmitter, InjectionToken, QueryList, TemplateRef } from '@angular/core';
import { IBaseCancelableBrowserEventArgs, IBaseEventArgs, mkenum } from '../core/utils';

// Component interfaces

export interface IgxTree {
    id: string;
    selection: IGX_TREE_SELECTION_TYPE;
    selectMarker: TemplateRef<any>;
    expandIndicator: TemplateRef<any>;
    nodeExpanding: EventEmitter<ITreeNodeTogglingEventArgs>;
    nodeExpanded: EventEmitter<ITreeNodeToggledEventArgs>;
    nodeCollapsing: EventEmitter<ITreeNodeTogglingEventArgs>;
    nodeCollapsed: EventEmitter<ITreeNodeToggledEventArgs>;
    expand(node: IgxTreeNode): void;
    collapse(node: IgxTreeNode): void;
    toggle(node: IgxTreeNode): void;
    select(node: IgxTreeNode): void;
    deselect(node: IgxTreeNode): void;
}

// Item interfaces
export interface IgxTreeNode {
    parentNode?: IgxTreeNode | null;
    expanded: boolean | null;
    selected: boolean | null;
    level: number;
    data: any;
    children: QueryList<IgxTreeNode> | null;
}

// Events
export interface ITreeNodeSelectionEvent extends IBaseCancelableBrowserEventArgs {
    node: IgxTreeNode;
}

export interface ITreeNodeEditingEvent extends IBaseCancelableBrowserEventArgs {
    node: IgxTreeNode;
    value: string;
}

export interface ITreeNodeEditedEvent extends IBaseEventArgs {
    node: IgxTreeNode;
    value: any;
}

export interface ITreeNodeTogglingEventArgs extends IBaseEventArgs, IBaseCancelableBrowserEventArgs {
    node: IgxTreeNode;
}

export interface ITreeNodeToggledEventArgs extends IBaseEventArgs {
    node: IgxTreeNode;
}

// Enums
export const IGX_TREE_SELECTION_TYPE = mkenum({
    None: 'None',
    BiState: 'BiState',
    Cascading: 'Cascading'
});
export type IGX_TREE_SELECTION_TYPE = (typeof IGX_TREE_SELECTION_TYPE)[keyof typeof IGX_TREE_SELECTION_TYPE];

// Token
export const IGX_TREE_COMPONENT = new InjectionToken<IgxTree>('IgxTreeToken');
export const IGX_TREE_NODE_COMPONENT = new InjectionToken<IgxTreeNode>('IgxTreeNodeToken');
