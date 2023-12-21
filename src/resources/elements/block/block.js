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
        this.block.isNeighbour = this._getDirectionIfNeighbour;
        this.block.setPosition = this._setPosition;
        this.block.connectIfTopRow = this._connectIfTopRow;
    }

    attached() {
        this._setPosition();
        this._connectSubscription = this._eventAggregator.subscribe('connectNeighbours', block => {
            if (this.block.empty || this.block.live) return;
            if (block.id == this.block.id) return;
            if (!block.connectingSide) return;

            // get direction false means not a neighbour
            const neighbourDirection = this._getDirectionIfNeighbour(block.x, block.y);
            if (!neighbourDirection) return;
            console.log('connectNeighbours', block.x, block.y, ': ', this.block.x, this.block.y);

            const otherSide = this._opposites[block.connectingSide];
            const isConnected = this.block.type.includes(otherSide) && otherSide == neighbourDirection;

            this.block.live = isConnected || this.block.live;
        });
    }

    // returns false or 'direction' (= truthy)
    _getDirectionIfNeighbour = (x, y) => {
        // check out of bounds
        if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) return false;

        // check for same row
        if (y == this.block.y) {
            const dx = x - this.block.x;
            if (Math.abs(dx) < 2) {
                const directions = ['west', false, 'east'];
                // const directions = ['west', false, 'east'];
                return directions[dx + 1];
            } else return false;
        }
        // check if for same column
        if (x == this.block.x) {
            const dy = y - this.block.y;
            if (Math.abs(dy) < 2) {
                const directions = ['north', false, 'south'];
                // const directions = ['north', false, 'south'];
                return directions[dy + 1];
            } return false
        }
        return false;
    }

    // returns 'direction'
    _getOtherSide = direction => {
        if (this.empty) return;
        const directions = this.block.type.split('-');
        const directionIndex = directions.indexOf(direction);
        if (directionIndex == -1) return;
        const otherDirection = directions[(directionIndex + 1) % 2];
        return otherDirection;
    }

    _setPosition = () => {
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

    toEmpty() {
        this._eventAggregator.publish('toEmpty', this.block);
    }
}
