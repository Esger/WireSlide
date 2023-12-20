import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class BlockCustomElement {
    @bindable block;

    constructor(element, eventAggregator) {
        this._eventAggregator = eventAggregator;
        this._element = element;
    }

    attached() {
        this.block.setPosition = _ => this._setPosition();
        this._setPosition();
    }

    _setPosition() {
        const boardStyles = window.getComputedStyle(this._element.parentElement);
        const blockSize = boardStyles.getPropertyValue('--blockSize');
        this.position = {
            left: 'calc(' + this.block.x + ' * ' + blockSize + ')',
            top: 'calc(' + this.block.y + ' * ' + blockSize + ')'
        }
    }

    toggleLive() {
        this.block.live = !this.block.live;
    }

    toEmpty() {
        this._eventAggregator.publish('toEmpty', this.block);
    }
}
