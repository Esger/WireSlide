import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)

export class SoundCustomElement {
    constructor(element, eventAggregator) {
        this._element = element;
        this._eventAggregator = eventAggregator;
        this.addBumpSubscription();
    }

    attached() {
        this._audioElement = this._element.querySelector('.slide');
        this._audioElement.addEventListener('load', _ => this.addBumpSubscription(), { once: true });
    }

    addBumpSubscription = _ => {
        this._bumpSubscription = this._eventAggregator.subscribeOnce('bump', _ => this._playSound());
    }

    _playSound() {
        this._audioElement.play();
        setTimeout(this.addBumpSubscription, 500);
    }

    detached() {
        this._bumpSubscription.dispose();
    }
}
