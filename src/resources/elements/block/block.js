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

        // listen to echo of bump event from empty block and move this block one spot in direction of empty block 
        this._bumpEchoSubscription = this._eventAggregator.subscribe('bumpEcho', data => this._handleBumpEcho(data.block, data.direction));

        // listen to bump event
        this._bumpSubscription = this._eventAggregator.subscribe('bump', data => this._handleBump(data.block, data.direction));

        this._connectSubscription = this._eventAggregator.subscribe('connectNeighbours', block => {
            if (this.block.empty || this.block.live) return;
            if (block.id == this.block.id) return;
            if (!block.connectingSide) return;

            // todo pass in block object
            // get direction false means not a neighbour
            const neighbourDirection = this._getDirectionIfNeighbour(block);
            if (!neighbourDirection) return;

            const oppositeSide = this._opposites[block.connectingSide];
            const isConnected = this.block.type.includes(oppositeSide) && oppositeSide == neighbourDirection;

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
        });

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

    _switchPosition(block) {
        const tempBlock = {
            x: this.block.x,
            y: this.block.y,
        };
        this.block.x = block.x;
        this.block.y = block.y;
        this.block.setPosition();
        block.x = tempBlock.x;
        block.y = tempBlock.y;
        block.setPosition();
    }

    _handleBumpEcho(block, direction) {
        if (block.id == this.block.id) return;

        const echoDirection = this._getBumpDirection(block);
        if (echoDirection == direction) {
            if (!this._isClickTarget) {
                this._eventAggregator.publish('bumpEcho', {
                    block: this.block,
                    direction: direction
                });
            }
            this._isClickTarget = false;
            this._switchPosition(block);
        }
    }

    //
    _handleBump(block, direction) {
        const bumpDirection = this._getBumpDirection(block);
        if (!bumpDirection) return; // it's not a neighbour

        if (block.id == this.block.id) return; // it's me

        // propagated bump
        if (bumpDirection == direction) {
            if (this.block.empty) {
                const reverseDirection = this._opposites[bumpDirection];
                this._eventAggregator.publish('bumpEcho', {
                    block: this.block,
                    direction: reverseDirection
                });
            } else {
                this._eventAggregator.publish('bump', {
                    block: this.block,
                    direction: direction
                });
            }
        }

        // first bump from click
        if (direction === undefined) {
            if (this.block.empty) {
                const reverseDirection = this._opposites[bumpDirection];
                this._eventAggregator.publish('bumpEcho', {
                    block: this.block,
                    direction: reverseDirection
                });
            } else {
                this._eventAggregator.publish('bump', {
                    block: this.block,
                    direction: bumpDirection
                });
            }
        }
    }

    // returns direction of bump if from adjacent neighbour
    _getBumpDirection(block) {
        const dx = this.block.x - block.x;
        const dy = this.block.y - block.y;
        const sameColumn = dx == 0;
        const sameRow = dy == 0;
        const isNeighbour = (sameColumn || sameRow) && Math.abs(dx) + Math.abs(dy) == 1;
        if (isNeighbour) {
            const horizontalDirections = ['west', false, 'east'];
            const verticalDirections = ['north', false, 'south'];
            const bumpDirection = sameColumn ? verticalDirections[dy + 1] : horizontalDirections[dx + 1];
            return bumpDirection;
        }
        return false;
    }

    // returns false or 'direction' (= truthy)
    _getDirectionIfNeighbour = (block) => {
        // check out of bounds
        if (block.x < 0 || block.x >= this.boardSize || block.y < 0 || block.y >= this.boardSize) return false;

        // check for same row
        if (block.y == this.block.y) {
            const dx = block.x - this.block.x;
            if (Math.abs(dx) < 2) {
                const directions = ['west', false, 'east'];
                // const directions = ['west', false, 'east'];
                return directions[dx + 1];
            } else return false;
        }
        // check if for same column
        if (block.x == this.block.x) {
            const dy = block.y - this.block.y;
            if (Math.abs(dy) < 2) {
                const directions = ['north', false, 'south'];
                // const directions = ['north', false, 'south'];
                return directions[dy + 1];
            } return false
        }
        return false;
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
        this._isClickTarget = true;
        this._eventAggregator.publish('bump', { block: this.block, direction: undefined });
    }
}
