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
        if (block.id == this.block.id) return;
        if (!block.connectingSide) return;

        const connectVector = this._opposites[this._getBumpVector(block).direction];
        if (!connectVector.isNeighbour) return;

        const oppositeSide = this._opposites[block.connectingSide];
        const isConnected = this.block.type.includes(oppositeSide) && oppositeSide == connectVector.direction;

        this.block.live = isConnected;
        this.block.linkedBlock = block;

        if (!isConnected) return;

        this.block.connectingSide = this._getOtherSide(oppositeSide);
        this.block.connectedToLed = block.led || block.connectedToLed;

        if (this.block.y == (this.boardSize - 1) && this.block.type.includes('south')) {
            if (this.block.connectedToLed || this.block.led) {
                setTimeout(_ => this._eventAggregator.publish('ledGrounded'), 50);
            } else {
                this.block.shortCircuit();
                this._eventAggregator.publish('shortCircuit');
            }
        }
        setTimeout(_ => this._eventAggregator.publish('connectNeighbours', this.block), 50);
    }

    //
    _handleBump(block, direction) {
        const bumpVector = this._getBumpVector(block);
        if (bumpVector.fromSelf) return; // it's me
        if (!bumpVector.isNeighbour) return;
        if (!bumpVector.isCoaxial) return;

        // first bump from click
        if (direction === 'all') {
            this._eventAggregator.publish('bump', {
                block: this.block,
                direction: bumpVector.direction
            });
            return;
        }

        // propagated bump
        if (bumpVector.direction === direction) {
            this._eventAggregator.publish('bump', {
                block: this.block,
                direction: direction
            });
        }
    }

    // returns direction, distance and isCoaxial as object
    _getBumpVector(block) {

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
        const isNeighbour = isCoaxial && absDistance === 1;

        const bumpVector = {
            fromSelf: fromSelf,
            isCoaxial: isCoaxial,
            isNeighbour: isNeighbour,
            direction: bumpDirection,
            distance: absDistance,
        }
        return bumpVector;
    }

    // returns 'direction' of other connection
    _getOtherSide = direction => {
        if (this.empty) return;
        const directions = this.block.type.split('-');
        const directionIndex = directions.indexOf(direction);
        if (directionIndex == -1) return;
        const otherDirection = directions[(directionIndex + 1) % 2];
        return otherDirection;
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
        if (this.block.y == 0 && !this.block.empty) {
            this.block.live = this.block.type.includes('north');
            if (this.block.live) {
                this.block.connectingSide = this._getOtherSide('north');
                setTimeout(_ => this._eventAggregator.publish('connectNeighbours', this.block), 300);
            }
        }
    }

    _shortCircuit = () => {
        this.block.isShortCircuited = true;
        this.block.linkedBlock?.shortCircuit();
    }

    bump() {
        if (!this._movingAllowed) return;
        this.block.isClickTarget = true;
        this._eventAggregator.publish('bump', { block: this.block, direction: 'all' });
    }
}
