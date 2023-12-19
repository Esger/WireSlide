import { bindable } from 'aurelia-framework';

export class BlockCustomElement {
    @bindable block;

    toggleLive() {
        this.block.live = !this.block.live;
    }
}
