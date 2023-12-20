import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class BlockCustomElement {
    @bindable block;

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
    }

    toggleLive() {
        this.block.live = !this.block.live;
    }

    toEmpty() {
        this._eventAggregator.publish('toEmpty', this.block);
    }
}
