import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DialFolder from '../dial-folder/DialFolder';
import dialUtils from '../../utils/dials';
import browserUtils from '../../utils/browser';

import './DragDialContainer.css';

const DIAL_HEIGHT = 239;
const DIAL_WIDTH = 250;
const BETWEEN_DIALS = 30;

class SpeedDialContainer extends Component {
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
                DIAL_WIDTH,
                BETWEEN_DIALS,
            ),

            y: dialUtils.nomalizePosY(
                dragData.dragPosY,
                this.props.bookmarks.count(),
                this.props.columnCount,
                DIAL_HEIGHT,
            ),
        };

        const newIndex = dialUtils.computeDialIndex(
            normalizedPositions,
            this.props.columnCount,
            this.props.bookmarks.count(),
            DIAL_WIDTH,
            DIAL_HEIGHT,
        );

        if (newIndex !== dragData.index) {
            this.props.onItemMoved(dragData.index, newIndex);
        }
    }

    onDragEnd(oldIndex, newIndex) {
        if (newIndex !== oldIndex) {
            let indexToMove;

            if (newIndex < oldIndex) {
                indexToMove = this.props.bookmarks.get(newIndex + 1).treeNode.index;
            } else {
                indexToMove = this.props.bookmarks.get(newIndex - 1).treeNode.index;

                // Chrome behaves different when moving bookmarks forward
                if (browserUtils.browserType === 'chrome') {
                    indexToMove += 1;
                }
            }

            browserUtils.bookmarks.move(
                this.props.bookmarks.get(newIndex).treeNode.id,
                { index: indexToMove },
            ).then(/* Don't do aything */);
        }
    }

    render() {
        const {
            columnCount,
            onItemMoved,
            ...rest
        } = this.props;

        return (
            <DialFolder
                onDialDrag={this.onDrag}
                onDragEnd={this.onDragEnd}
                {...rest}
            />
        );
    }
}

SpeedDialContainer.propTypes = {
    bookmarks: PropTypes.object.isRequired,
    columnCount: PropTypes.number.isRequired,
    onItemMoved: PropTypes.func.isRequired,
};

export default SpeedDialContainer;