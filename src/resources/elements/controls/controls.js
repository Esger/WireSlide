import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
@inject(EventAggregator)
export class Controls {
    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this._ledGroundedSubscription = this._eventAggregator.subscribe('ledGrounded', _ => {
            this.nextButtonIsVisible = true;
        });
        this._shortCircuitSubscription = this._eventAggregator.subscribe('shortCircuit', _ => {
            this.nextButtonIsVisible = false;
        })
        this._nextSubscription = this._eventAggregator.subscribe('next', _ => {
            this.nextButtonIsVisible = false;
        })
    }

    detached() {
        this._ledGroundedSubscription.dispose();
        this._shortCircuitSubscription.dispose();
        this._nextSubscription.dispose();
    }

}
