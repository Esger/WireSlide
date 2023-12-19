import { bindable } from 'aurelia-framework';

export class Board {
    @bindable value;

    constructor() {
        this.boardSize = 4;
        this.blocks = [];
        this.types = ['north-south', 'east-west', 'north-east', 'north-west', 'south-east', 'south-west', 'north-south'];
    }
    attached() {
        this.fillBoard();
    }

    fillBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const type = this.types[Math.floor(Math.random() * this.types.length)];
                const block = {
                    x: i,
                    y: j,
                    type: type
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
