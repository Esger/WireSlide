import { bindable, inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class Board {
    @bindable value;

    constructor(element, eventAggregator) {
        this._element = element;
        this._eventAggregator = eventAggregator;
        this._firstBoardSize = 4;
        this._maxBoardSize = 8;
        this._oddLevel = this._firstBoardSize % 2 == 1;
        this._straights = ['east-west', 'north-south'];
        this._bends = ['north-east', 'north-west', 'south-east', 'south-west'];
        this._types = [...this._straights, ...this._bends];
    }

    attached() {
        this._newGame();
        this._switchSubscription = this._eventAggregator.subscribe('toEmpty', block => this._switchBlocks(block));
        this._restartSubscription = this._eventAggregator.subscribe('restart', _ => this._newGame());
        this._restartLevelSubscription = this._eventAggregator.subscribe('restartlevel', _ => this._newGame(this.boardSize));
        // if random board has short circuit -> new game
        this._shortCircuitSubscription = this._eventAggregator.subscribe('shortCircuit', _ => {
            if (!this._played) {
                this._newGame();
            }
        });
        // if random board has led grounded -> new game
        this._ledGroundedSubscription = this._eventAggregator.subscribe('ledGrounded', _ => {
            if (!this._played) {
                this._newGame();
            }
        });
        this._nextSubscription = this._eventAggregator.subscribe('next', _ => {
            this._oddLevel = !this._oddLevel;
            if (this.boardSize < this._maxBoardSize) {
                if (!this._oddLevel) this.boardSize++
            } else this.boardSize = this._firstBoardSize;
            this._newGame(this.boardSize);
        })
    }

    detached() {
        this._switchSubscription.dispose();
        this._restartSubscription.dispose();
        this._shortCircuitSubscription.dispose();
        this._ledGroundedSubscription.dispose();
        this._nextSubscription.dispose();
        this._restartLevelSubscription.dispose();
    }

    _newGame(boardSize = this._firstBoardSize) {
        this._played = false;
        this.boardSize = boardSize;
        document.body.style.setProperty('--blockCount', this.boardSize);

        this._fillBoard();
        setTimeout(_ => {
            this._buildConnections();
        }, 300);
    }

    _switchBlocks(block) {
        this._played = true;
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
            block.isShortCircuited = false;
            block.linkedBlock = null;
        });
        this.blocks.forEach(block => {
            block.connectIfTopRow();
        });
    }

    _setTypes(count) {
        if (this._oddLevel) {
            this._types = [...this._bends];
            while (this._types.length < count) {
                this._types = [...this._types, ...this._bends];
            }
            this._types = this._types.slice(0, count);
        } else {
            this._types = [...this._straights, ...this._bends];
            while (this._types.length < count) {
                this._types = [...this._types, ...this._straights, ...this._bends];
            }
        }
    }

    _shuffleTypes() {
        for (let i = 0; i < this._types.length; i++) {
            const j = Math.floor(Math.random() * this._types.length);
            const temp = this._types[i];
            this._types[i] = this._types[j];
            this._types[j] = temp;
        }
    }

    _fillBoard() {
        // setup types based on odd level
        const count = this.boardSize * this.boardSize;
        this._setTypes(count);
        this._shuffleTypes();

        // set type of one random block to 'empty'
        const emptyIndex = Math.ceil(Math.random() * count);
        // let's set ledIndex opposite to emptyIndex
        let ledIndex = (emptyIndex + Math.ceil(count / 2)) % count;
        while (this._types[ledIndex] == this._types[emptyIndex] || ledIndex == 0) {
            ledIndex = (ledIndex + 1) % count;
        }

        // fill board
        this.blocks = [];
        let index = 0;
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const type = this._types[index++];
                const block = {
                    x: j,
                    y: i,
                    type: type,
                    id: index,
                    led: index == ledIndex,
                    empty: index == emptyIndex
                };
                this.blocks.push(block);
            }
        }
    }
}
