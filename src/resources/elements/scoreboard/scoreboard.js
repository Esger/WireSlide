import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Scoreboard {

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.moves = 0;
        this.wins = 0;
    }

    attached() {
        this._restartSubscription = this._eventAggregator.subscribe('restart', _ => this.moves = 0);
        this._restartLevelSubscription = this._eventAggregator.subscribe('restartlevel', _ => this.moves = 0);
        this._nextSubscription = this._eventAggregator.subscribe('next', _ => this.moves = 0);
        this._toEmptySubscription = this._eventAggregator.subscribe('toEmpty', _ => this.moves++);
        this._ledGroundedSubscription = this._eventAggregator.subscribe('ledGrounded', _ => this.wins++);
    }

    detached() {
        this._restartSubscription.dispose();
        this._nextSubscription.dispose();
        this._toEmptySubscription.dispose();
        this._ledGroundedSubscription.dispose();
        this._restartLevelSubscription.dispose();
    }
}
