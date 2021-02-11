import { Injectable } from '@angular/core';
import { IgxTreeNode } from './common';

@Injectable()
export class IgxTreeService {
    public expandedNodes: Set<string> = new Set<string>();
    private treeRoot: IgxTreeNode[];

    public expand(id: string): void {
        this.expandedNodes.add(id);
    }

    public collapse(id: string): void {
        this.expandedNodes.delete(id);
    }

    public isExpanded(id: string): boolean {
        return this.expandedNodes.has(id);
    }
}
