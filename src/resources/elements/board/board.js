import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Board {
    @bindable value;

    constructor(eventAggregator) {
        this._eventAggregator = eventAggregator;
        this.boardSize = 4;
        this.blocks = [];
        this.types = ['north-south', 'east-west', 'north-east', 'north-west', 'south-east', 'south-west', 'north-south'];
    }

    attached() {
        this._newGame();
        this.switchSubscription = this._eventAggregator.subscribe('toEmpty', block => {
            this._switchBlocks(block);
        })
    }

    detached() {
        this.switchSubscription.dispose();
    }

    _newGame() {
        this._fillBoard();
        setTimeout(_ => {
            this._buildConnections();
        });
    }

    _switchBlocks(block) {
        const emptyBlock = this.blocks.find(b => b.empty);
        if (block.isNeighbour(emptyBlock.x, emptyBlock.y)) {
            const tempBlock = {
                x: emptyBlock.x,
                y: emptyBlock.y,
            };
            emptyBlock.x = block.x;
            emptyBlock.y = block.y;
            emptyBlock.setPosition();
            block.x = tempBlock.x;
            block.y = tempBlock.y;
            block.setPosition();
        }
        this._buildConnections();
    }

    _buildConnections() {
        this.blocks.forEach(block => {
            block.live = false;
            block.connectedToLed = false;
            block.grounded = false;
        });
        this.blocks.forEach(block => {
            block.connectIfTopRow();
        });
    }

    _fillBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const type = this.types[Math.floor(Math.random() * this.types.length)];
                const block = {
                    x: j,
                    y: i,
                    type: type,
                    id: i * this.boardSize + j,
                };
                this.blocks.push(block);
            }
        }
        // set type of one random block to 'empty'
        const randomIndex = Math.floor(Math.random() * this.blocks.length);
        this.blocks[randomIndex].empty = true;
        // set type of one random block to 'led'; index should be different from 'empty'
        let randomIndex2;
        do {
            randomIndex2 = (Math.floor(Math.random() * this.blocks.length));
        } while (randomIndex == randomIndex2)
        this.blocks[randomIndex2].led = true;
    }
}
