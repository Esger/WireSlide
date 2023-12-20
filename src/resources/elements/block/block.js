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
        const gapSize = boardStyles.getPropertyValue('--gapSize');
        this.position = {
            left: 'calc(' + this.block.x + ' * ' + blockSize + ' + ' + (this.block.x - 1) + ' * ' + gapSize + ')',
            top: 'calc(' + this.block.y + ' * ' + blockSize + ' + ' + (this.block.y - 1) + ' * ' + gapSize + ')'
        }
    }

    toggleLive() {
        this.block.live = !this.block.live;
    }

    toEmpty() {
        this._eventAggregator.publish('toEmpty', this.block);
    }
}
