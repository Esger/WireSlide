import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)

export class SoundCustomElement {
    constructor(element, eventAggregator) {
        this._element = element;
        this._eventAggregator = eventAggregator;
        this.sounds = [
            {
                name: 'slide',
                volume: 1
            },
            {
                name: 'bump',
                volume: .5
            },
            {
                name: 'short-circuit',
                volume: .1
            },
            {
                name: 'connected',
                volume: .1
            }
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
        this._ledGroundedSubscription ||= this._eventAggregator.subscribe('ledGrounded', _ => this._playSound('connected'));
    }

    _getVolume(name) {
        const sound = this.sounds.find(sound => sound.name === name);
        return sound ? sound.volume : 1;
    }

    _playSound(name) {
        const sound = this._element.querySelector('.' + name);
        console.log(this._getVolume(name));
        sound.volume = this._getVolume(name);
        sound?.play();
        clearTimeout(this.timeOutHandle);
        this.timeOutHandle = setTimeout(this.addSubscriptions, 500);
    }

    detached() {
        this._bumpSubscription?.dispose();
        this._slideSubscription?.dispose();
        this._shortCircuitSubscription?.dispose();
        this._ledGroundedSubscription?.dispose();
    }
}
