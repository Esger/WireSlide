import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Scoreboard {

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.moves = 0;
        this.wins = 0;
        this.gameStates = ['', 'connected', 'shortcircuit'];
        this.gameState = 0;
        this.hint = 'Wire the the green LED!';
    }

    attached() {
        this._restartSubscription = this._eventAggregator.subscribe('restart', _ => this._reset());
        this._restartLevelSubscription = this._eventAggregator.subscribe('restartlevel', _ => this._reset());
        this._nextSubscription = this._eventAggregator.subscribe('next', _ => this._reset());
        this._toEmptySubscription = this._eventAggregator.subscribe('toEmpty', _ => this.moves++);
        this._ledGroundedSubscription = this._eventAggregator.subscribe('ledGrounded', _ => this._win());
        this._shortCircuitSubscription = this._eventAggregator.subscribe('shortCircuit', _ => this._loose());
    }

    detached() {
        this._restartSubscription.dispose();
        this._nextSubscription.dispose();
        this._toEmptySubscription.dispose();
        this._ledGroundedSubscription.dispose();
        this._restartLevelSubscription.dispose();
    }

    _loose() {
        this.gameState = 2;
    }

    _win() {
        this.wins++;
        this.gameState = 1;
    }

    _reset() {
        this.moves = 0;
        this.gameState = 0;
    }

}
