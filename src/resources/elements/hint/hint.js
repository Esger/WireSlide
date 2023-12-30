import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class HintCustomElement {

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.gameStates = ['Wire the green light!', 'connected', 'shortcircuit'];
        this.gameState = 0;
    }

    attached() {
        this._shortCircuitSubscription = this._eventAggregator.subscribe('shortCircuit', _ => this.gameState = 2);
        this._ledGroundedSubscription = this._eventAggregator.subscribe('ledGrounded', _ => this.gameState = 1);
        this._restartSubscription = this._eventAggregator.subscribe('restart', _ => this.gameState = 0);
        this._restartLevelSubscription = this._eventAggregator.subscribe('restartlevel', _ => this.gameState = 0);
        this._nextSubscription = this._eventAggregator.subscribe('next', _ => this.gameState = 0);

    }

    detached() {
        this._shortCircuitSubscription.dispose();
        this._ledGroundedSubscription.dispose();
        this._restartSubscription.dispose();
        this._restartLevelSubscription.dispose();
        this._nextSubscription.dispose();
    }
}
