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
        this.fillBoard();
        this.switchSubscription = this._eventAggregator.subscribe('toEmpty', block => {
            this._switchBlocks(block);
        })
    }

    detached() {
        this.switchSubscription.dispose();
    }

    _switchBlocks(block) {
        const emptyBlock = this.blocks.find(b => b.type == 'empty');
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
    }

    fillBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const type = this.types[Math.floor(Math.random() * this.types.length)];
                const block = {
                    x: j,
                    y: i,
                    order: i * this.boardSize + j,
                    type: type,
                    live: false,
                    isNeighbour: (x, y) => {
                        if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) return false;
                        const isNeighbour = block.y == y && Math.abs(block.x - x) < 2 || block.x == x && Math.abs(block.y - y) < 2;
                        return isNeighbour;
                    }
                };
                this.blocks.push(block);
            }
        }
        // set type of one random block to 'empty'
        const randomIndex = Math.floor(Math.random() * this.blocks.length);
        this.blocks[randomIndex].type = 'empty';
        // set type of one random block to 'led'; index should be different from 'empty'
        let randomIndex2;
        do {
            randomIndex2 = (Math.floor(Math.random() * this.blocks.length));
        } while (randomIndex == randomIndex2)
        this.blocks[randomIndex2].type = 'led';
    }
}
