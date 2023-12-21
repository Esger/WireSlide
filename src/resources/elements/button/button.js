import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class ButtonCustomElement {
    @bindable textContent;
    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
    }
    newGame() {
        this._eventAggregator.publish('newGame');
    }
}
