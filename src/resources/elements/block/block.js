import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class BlockCustomElement {
    @bindable block;
    @bindable boardSize;

    constructor(element, eventAggregator) {
        this._eventAggregator = eventAggregator;
        this._element = element;
        this._opposites = {
            'north': 'south',
            'south': 'north',
            'east': 'west',
            'west': 'east'
        }
    }

    bind() {
        this.block.live = false;
        this.block.setPosition = this._setPositionStyle;
        this.block.connectIfTopRow = this._connectIfTopRow;
        this.block.shortCircuit = this._shortCircuit;
        this._movingAllowed = true;
    }

    attached() {
        this._setPositionStyle();

        // listen to bump event
        this._bumpSubscription = this._eventAggregator.subscribe('bump', data => this._handleBump(data.block, data.direction));

        this._connectSubscription = this._eventAggregator.subscribe('connectNeighbours', block => this._handleConnect(block));

        this._groundedSubscription = this._eventAggregator.subscribe('ledGrounded', _ => {
            if (this.block.led) {
                this.block.grounded = true;
            }
            this._movingAllowed = false;
        });

        this._shortCircuitSubscription = this._eventAggregator.subscribe('shortCircuit', _ => {
            this._movingAllowed = false;
        })
    }

    detached() {
        this._connectSubscription.dispose();
        this._groundedSubscription.dispose();
        this._shortCircuitSubscription.dispose();
        this._bumpSubscription.dispose();
    }

    _handleConnect(block) {
        if (this.block.live) return;
        if (!block.outConnectionSide) return;

        const connectVector = this._getVector(block);
        if (!connectVector.isAdjacent) return;

        const connectInDirection = this._opposites[block.outConnectionSide];
        const neededDirection = this._opposites[connectVector.direction];
        const isConnected = this.block.type.includes(connectInDirection) && connectInDirection == neededDirection;
        this.block.live = isConnected;
        if (!isConnected) return;

        this.block.linkedBlock = block;

        this.block.outConnectionSide = this._getOtherConnectingSide(connectInDirection);
        this.block.connectedToLed = block.led || block.connectedToLed;

        const onLastRow = this.block.y == this.boardSize - 1;
        const grounded = this.block.type.includes('south');
        if (onLastRow && grounded) {
            if (this.block.connectedToLed || this.block.led) {
                setTimeout(_ => this._eventAggregator.publish('ledGrounded'), 50);
            } else {
                this.block.shortCircuit();
                this._eventAggregator.publish('shortCircuit');
            }
            return;
        }
        setTimeout(_ => this._eventAggregator.publish('connectNeighbours', this.block), 25);
    }

    //
    _handleBump(block, direction) {
        const bumpVector = this._getVector(block);
        if (!bumpVector.isAdjacent) return; // don't bother

        // first bump from click
        const fromClick = direction === 'all';
        const samedirection = bumpVector.direction === direction;
        const propagatedDirection = fromClick ? bumpVector.direction : samedirection ? direction : false;
        if (!propagatedDirection) return;

        const data = {
            block: this.block,
            direction: propagatedDirection
        };
        this._eventAggregator.publish('bump', data);
    }

    // returns direction, distance and isCoaxial as object
    _getVector(block) {

        const fromSelf = block.id === this.block.id;
        const dx = this.block.x - block.x;
        const dy = this.block.y - block.y;
        const sameColumn = dx == 0;
        const sameRow = dy == 0;
        const isCoaxial = sameColumn || sameRow;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const absDistance = absDx + absDy;
        const horizontalDirections = ['west', false, 'east'];
        const verticalDirections = ['north', false, 'south'];
        const normalizedDx = dx == 0 ? 0 : dx / absDx + 1;
        const normalizedDy = dy == 0 ? 0 : dy / absDy + 1;
        const bumpDirection = sameColumn ? verticalDirections[normalizedDy] : horizontalDirections[normalizedDx];
        const isAdjacent = isCoaxial && absDistance === 1;

        const bumpVector = {
            fromSelf: fromSelf,
            isCoaxial: isCoaxial,
            isAdjacent: isAdjacent,
            direction: bumpDirection,
            distance: absDistance,
        }
        return bumpVector;
    }

    // returns 'direction' of other connecting side
    _getOtherConnectingSide = inSide => {
        if (this.empty) return;
        const directions = this.block.type.split('-');
        const outSide = directions.filter(side => side !== inSide);

        return outSide;
    }

    _setPositionStyle = _ => {
        const boardStyles = window.getComputedStyle(this._element.parentElement);
        const blockSize = boardStyles.getPropertyValue('--blockSize');
        this.position = {
            left: 'calc(' + this.block.x + ' * ' + blockSize + ')',
            top: 'calc(' + this.block.y + ' * ' + blockSize + ')'
        }
    }

    _connectIfTopRow = () => {
        if (this.block.y != 0 || this.block.empty) return;

        this.block.live = this.block.type.includes('north');
        if (!this.block.live) return;

        this.block.outConnectionSide = this._getOtherConnectingSide('north');
        setTimeout(_ => this._eventAggregator.publish('connectNeighbours', this.block), 300);
    }

    _shortCircuit = () => {
        this.block.isShortCircuited = true;
        this.block.linkedBlock?.shortCircuit();
    }

    bump() {
        if (!this._movingAllowed) return;
        this._eventAggregator.publish('bump', { block: this.block, direction: 'all' });
    }
}
