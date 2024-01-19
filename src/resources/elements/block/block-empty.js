import { bindable, inject } from 'aurelia-framework';
import { BlockCustomElement } from './block';

export class BlockEmptyCustomElement extends BlockCustomElement {
    @bindable block;
    @bindable boardSize;

    attached() {
        super.attached();
        this._connectSubscription.dispose();
        this._bumpStack = [];
    }

    _handleBump(block, direction) {
        const bumpVector = this._getBumpVector(block);
        if (!bumpVector.isCoaxial || bumpVector.fromSelf) return;

        this._bumpStack.push({ block: block, direction: direction, bumpVector: bumpVector });

        clearTimeout(this._processStackTimerId);
        this._processStackTimerId = setTimeout(_ => this._processBumpStack(), 200);
    }

    _processBumpStack() {
        console.log('processing stack', console.table(this._bumpStack));
        // sort stack by distance
        this._bumpStack.sort((a, b) => a.bumpVector.distance - b.bumpVector.distance);
        while (this._bumpStack.length) {
            const bump = this._bumpStack.shift();
            // const reverseDirection = this._opposites[bump.bumpVector.direction];
            if (bump.direction === bump.bumpVector.direction || bump.direction === 'all') {
                this._switchPosition(bump.block);

                console.log('move', bump.block.x, bump.block.y, 'thisBlock', this.block.x, this.block.y, 'dir', bump.direction, 'bumpDir', bump.bumpVector.direction);

            }
        }
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
        this._eventAggregator.publish('move');
    }
}
