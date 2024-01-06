import { bindable, inject } from 'aurelia-framework';
import { BlockCustomElement } from './block';

export class BlockEmptyCustomElement extends BlockCustomElement {
    @bindable block;
    @bindable boardSize;

    attached() {
        super.attached();
        this._connectSubscription.dispose();
        this._bumpEchoSubscription.dispose();
    }

    _handleBump(block, direction) {
        const bumpDirection = this._getBumpDirection(block);
        if (bumpDirection === false) return; // it's not a neighbour

        if (block.id == this.block.id) return; // it's me

        if (bumpDirection == direction || direction === undefined) {
            this._switchPosition(block);
            const reverseDirection = this._opposites[bumpDirection];
            this._eventAggregator.publish('bumpEcho', {
                block: this.block,
                direction: reverseDirection
            });
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
