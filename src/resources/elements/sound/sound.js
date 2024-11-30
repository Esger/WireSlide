import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)

export class SoundCustomElement {
    constructor(element, eventAggregator) {
        this._element = element;
        this._eventAggregator = eventAggregator;
        this.sounds = [
            'slide',
            'bump'
        ];
        this.addBumpSubscription();
    }

    attached() {
        this.sounds.forEach(sound => {
            this._element.querySelector('.' + sound)?.addEventListener('load', _ => this.addBumpSubscription(), { once: true });
        });
    }

    addBumpSubscription = _ => {
        this._bumpSubscription?.dispose();
        this._slideSubscription?.dispose();
        this._bumpSubscription = this._eventAggregator.subscribeOnce('bumpSound', _ => this._playSound('bump'));
        this._slideSubscription = this._eventAggregator.subscribeOnce('slideSound', _ => this._playSound('slide'));
    }

    _playSound(name) {
        this._element.querySelector('.' + name)?.play();
        clearTimeout(this.timeOutHandle);
        this.timeOutHandle = setTimeout(this.addBumpSubscription, 500);
    }

    detached() {
        this._bumpSubscription.dispose();
        this._slideSubscription.dispose();
    }
}
