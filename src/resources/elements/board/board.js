import { bindable } from 'aurelia-framework';

export class Board {
    @bindable value;

    constructor() {
        this.boardSize = 4;
        this.blocks = [];
    }
    attached() {
        this.fillBoard();
    }

    fillBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                this.blocks.push({ x: i, y: j });
            }
        }
    }
}
