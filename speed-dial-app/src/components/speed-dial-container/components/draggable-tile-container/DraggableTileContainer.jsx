import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DialContainer from '../dial-container/DialContainer';

function computeDistance(startX, startY, endX, endY) {
    return Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
}

const DRAG_DISTANCE_THRESHOLD = 10;

class DraggableDialContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dragPosX: 0,
            dragPosY: 0,

            isDragged: false,
        };

        this.dragDefault = {
            dragStartPosX: 0,
            dragStartPosY: 0,

            mouseDragStartPosX: 0,
            mouseDragStartPosY: 0,

            currentMousePosX: 0,
            currentMousePosY: 0,

            hasDragThresholdCrossed: false,
            isDraggedCurrently: false,
        };

        this.currentDragState = Object.assign({}, this.dragDefault);

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.dragAnimate = this.dragAnimate.bind(this);

        this.dragReportInterval = null;
    }

    dragAnimate() {
        if (this.currentDragState.isDraggedCurrently) {
            this.setState({
                dragPosX: this.computeDragPos(
                    this.currentDragState.dragStartPosX,
                    this.currentDragState.mouseDragStartPosX,
                    this.currentDragState.currentMousePosX),

                dragPosY: this.computeDragPos(
                    this.currentDragState.dragStartPosY,
                    this.currentDragState.mouseDragStartPosY,
                    this.currentDragState.currentMousePosY),
            });

            window.requestAnimationFrame(this.dragAnimate);
        }
    }

    computeDragPos(dragStart, mouseDragStart, currentMouseDrag) {
        return (dragStart - (mouseDragStart - currentMouseDrag));
    }

    onMouseDown(event) {
        // 0 button means left click
        if (event.nativeEvent.button !== 0) {
            return;
        }

        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);

        const nativeEvent = event.nativeEvent;

        this.currentDragState = {
            mouseDragStartPosX: nativeEvent.clientX,
            mouseDragStartPosY: nativeEvent.clientY,

            currentMousePosX: nativeEvent.clientX,
            currentMousePosY: nativeEvent.clientY,

            dragStartPosX: this.props.xPos,
            dragStartPosY: this.props.yPos,

            isDraggedCurrently: true,
        };

        this.dragReportInterval = setInterval(() => {
            this.props.onDrag({
                index: this.props.id,
                dragPosX: this.state.dragPosX,
                dragPosY: this.state.dragPosY,
            });
        }, 200);

        window.requestAnimationFrame(this.dragAnimate);
    }

    onMouseUp(event) {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);

        if (!this.currentDragState.hasDragThresholdCrossed) {
            console.log('distance');
            this.props.onClick(this.props.id);
        }

        this.currentDragState = Object.assign({}, this.dragDefault);

        this.setState({
            isDragged: false,
        });

        clearInterval(this.dragReportInterval);
    }

    onMouseMove(event) {
        if (!this.currentDragState.hasDragThresholdCrossed && this.currentDragState.isDraggedCurrently) {
            const distance = computeDistance(
                this.currentDragState.mouseDragStartPosX,
                event.clientX,
                this.currentDragState.mouseDragStartPosY,
                event.clientY,
            );

            if (distance > DRAG_DISTANCE_THRESHOLD) {
                this.currentDragState.hasDragThresholdCrossed = true;

                this.setState({
                    isDragged: true,
                });
            }
        }

        this.currentDragState = Object.assign(this.currentDragState, {
            currentMousePosX: event.clientX,
            currentMousePosY: event.clientY,
        });
    }

    render() {
        const {
            xPos,
            yPos,
            data,
        } = this.props;

        const currentPosX = this.currentDragState.isDraggedCurrently ? this.state.dragPosX : xPos;
        const currentPosY = this.currentDragState.isDraggedCurrently ? this.state.dragPosY : yPos;

        return (
            <DialContainer
                xPos={currentPosX}
                yPos={currentPosY}
                isDragged={this.state.isDragged}
                onMouseDown={this.onMouseDown}
                {...data}>

            </DialContainer>
        );
    }
}

DraggableDialContainer.propTypes = {
    xPos: PropTypes.number.isRequired,
    yPos: PropTypes.number.isRequired,
    id: PropTypes.any.isRequired,
    data: PropTypes.object.isRequired,
    onDrag: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default DraggableDialContainer;