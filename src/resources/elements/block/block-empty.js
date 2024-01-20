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
        const bumpVector = this._getVector(block);
        if (!bumpVector.isCoaxial || bumpVector.fromSelf) return;

        this._bumpStack.push({ block: block, direction: direction, bumpVector: bumpVector });

        clearTimeout(this._processStackTimerId);
        this._processStackTimerId = setTimeout(_ => this._processBumpStack());
    }

    _processBumpStack() {
        this._bumpStack.sort((a, b) => b.bumpVector.distance - a.bumpVector.distance);
        while (this._bumpStack.length) {
            const bump = this._bumpStack.pop();
            if (bump.direction === bump.bumpVector.direction || bump.direction === 'all')
                this._switchPosition(bump.block);
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
