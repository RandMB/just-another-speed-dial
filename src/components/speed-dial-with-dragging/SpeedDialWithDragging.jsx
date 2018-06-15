import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DraggableDial from '../draggable-dial/DraggableDial';
import dialUtils from '../../utils/dials';
import browserUtils from '../../utils/browser';

class SpeedDialWithDragging extends Component {
    constructor(props) {
        super(props);

        this.onDrag = this.onDrag.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    onDrag(dragData) {
        const normalizedPositions = {
            x: dialUtils.nomalizePosX(
                dragData.dragPosX,
                this.props.columnCount,
                this.props.config.dialWidth + this.props.config.hSpace,
                this.props.config.hSpace,
            ),

            y: dialUtils.nomalizePosY(
                dragData.dragPosY,
                this.props.bookmarks.length,
                this.props.columnCount,
                this.props.config.dialHeight + this.props.config.vSpace,
            ),
        };

        const newIndex = dialUtils.computeDialIndex(
            normalizedPositions,
            this.props.columnCount,
            this.props.bookmarks.length,
            this.props.config.dialWidth + this.props.config.hSpace,
            this.props.config.dialHeight + this.props.config.vSpace,
        );

        if (newIndex !== dragData.index) {
            this.props.onItemMoved(dragData.index, newIndex);
        }
    }

    onDragEnd(oldIndex, newIndex) {
        if (newIndex !== oldIndex) {
            let indexToMove;

            if (newIndex < oldIndex) {
                indexToMove = this.props.bookmarks[newIndex + 1].treeNode.index;
            } else {
                indexToMove = this.props.bookmarks[newIndex - 1].treeNode.index;

                // Chrome behaves different when moving bookmarks forward
                if (browserUtils.browserType === 'chrome') {
                    indexToMove += 1;
                }
            }

            this.props.moveBookmark(oldIndex, newIndex, indexToMove);
        }
    }

    render() {
        const { bookmarks, config } = this.props;

        return (
            bookmarks.map((child, index) => {
                const id = child.treeNode.id;
                const data = this.props.data[id] || {};
                const local = this.props.local[id] || {};

                return (
                    <DraggableDial
                        xPos={child.view.dialPosX}
                        yPos={child.view.dialPosY}
                        id={index}
                        onDrag={this.onDrag}
                        onDragEnd={this.onDragEnd}
                        onClick={this.props.onOpen}
                        key={'' + id}
                        config={config}

                        node={child.treeNode}
                        view={child.view}
                        data={data}
                        local={local}
                        onUpdate={this.props.onDialUpdate}
                    />

                );
            })
        );
    }
}

SpeedDialWithDragging.propTypes = {
    bookmarks: PropTypes.array.isRequired,
    columnCount: PropTypes.number.isRequired,
    onItemMoved: PropTypes.func.isRequired,
    onDialUpdate: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    local: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    moveBookmark: PropTypes.func.isRequired,
};

export default SpeedDialWithDragging;
