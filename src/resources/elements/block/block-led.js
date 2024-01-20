import { bindable } from 'aurelia-framework';
import { BlockCustomElement } from './block';

export class BlockLedCustomElement extends BlockCustomElement {
    @bindable block;
    @bindable boardSize;

}
