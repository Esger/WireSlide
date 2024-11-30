import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)

export class SoundCustomElement {
    constructor(element, eventAggregator) {
        this._element = element;
        this._eventAggregator = eventAggregator;
        this.sounds = [
            'slide',
            'bump',
            'short-circuit'
        ];
    }

    attached() {
        this.addSubscriptions();

    }

    addSubscriptions = _ => {
        this._bumpSubscription?.dispose();
        this._slideSubscription?.dispose();
        this._bumpSubscription = this._eventAggregator.subscribeOnce('bumpSound', _ => this._playSound('bump'));
        this._slideSubscription = this._eventAggregator.subscribeOnce('slideSound', _ => this._playSound('slide'));
        this._shortCircuitSubscription ||= this._eventAggregator.subscribe('shortCircuit', _ => this._playSound('short-circuit'));
    }

    _playSound(name) {
        const sound = this._element.querySelector('.' + name);
        if (name === 'bump') sound.volume = .5;
        if (name === 'short-circuit') sound.volume = .5;
        sound?.play();
        clearTimeout(this.timeOutHandle);
        this.timeOutHandle = setTimeout(this.addSubscriptions, 500);
    }

    detached() {
        this._bumpSubscription?.dispose();
        this._slideSubscription?.dispose();
        this._shortCircuitSubscription?.dispose();
    }
}
