import { bindable, inject } from 'aurelia-framework';
import { BlockCustomElement } from './block';

export class BlockEmptyCustomElement extends BlockCustomElement {
    @bindable block;
    @bindable boardSize;
}
