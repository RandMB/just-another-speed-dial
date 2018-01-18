import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import DialContainer from '../dial-container/DialContainer';

function computeDistance(startX, startY, endX, endY) {
    return Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
}

const DRAG_DISTANCE_THRESHOLD = 10;

class DraggableDialContainer extends PureComponent {
    static computeDragPos(dragStart, mouseDragStart, currentMouseDrag) {
        return (dragStart - (mouseDragStart - currentMouseDrag));
    }

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
        this.dragStartIndex = null;
    }

    componentWillUnmount() {
        // Prevent calling setState on component which is going to unmount
        this.currentDragState.isDraggedCurrently = false;
        // General cleanup
        clearInterval(this.dragReportInterval);
        document.removeEventListener('mousemove', this.onMouseMove);
    }

    onMouseDown(event) {
        // 0 button means left click
        if (event.nativeEvent.button !== 0) {
            return;
        }

        document.addEventListener('mouseup', this.onMouseUp, { once: true });
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
        }, 100);

        this.setState({
            isDragged: true,
        });

        this.dragAnimate();

        this.dragStartIndex = this.props.id;
    }

    onMouseUp() {
        document.removeEventListener('mousemove', this.onMouseMove);

        if (!this.currentDragState.hasDragThresholdCrossed) {
            this.props.onClick(this.props.id);
        } else if (this.props.onDragEnd) {
            this.props.onDragEnd(this.dragStartIndex, this.props.id);
        }

        Object.assign(this.currentDragState, this.dragDefault);

        this.setState({ isDragged: false });
        this.dragStartIndex = null;

        clearInterval(this.dragReportInterval);
    }

    onMouseMove(event) {
        if (!this.currentDragState.hasDragThresholdCrossed
            && this.currentDragState.isDraggedCurrently) {
            const distance = computeDistance(
                this.currentDragState.mouseDragStartPosX,
                this.currentDragState.mouseDragStartPosY,
                event.clientX,
                event.clientY,
            );

            if (distance > DRAG_DISTANCE_THRESHOLD) {
                this.currentDragState.hasDragThresholdCrossed = true;
            }
        }

        Object.assign(this.currentDragState, {
            currentMousePosX: event.clientX,
            currentMousePosY: event.clientY,
        });
    }

    dragAnimate() {
        if (this.currentDragState.isDraggedCurrently) {
            this.setState({
                dragPosX: DraggableDialContainer.computeDragPos(
                    this.currentDragState.dragStartPosX,
                    this.currentDragState.mouseDragStartPosX,
                    this.currentDragState.currentMousePosX,
                ),

                dragPosY: DraggableDialContainer.computeDragPos(
                    this.currentDragState.dragStartPosY,
                    this.currentDragState.mouseDragStartPosY,
                    this.currentDragState.currentMousePosY,
                ),
            });

            window.requestAnimationFrame(this.dragAnimate);
        }
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
                {...data}
            />
        );
    }
}

DraggableDialContainer.propTypes = {
    xPos: PropTypes.number.isRequired,
    yPos: PropTypes.number.isRequired,
    id: PropTypes.any.isRequired,
    data: PropTypes.object.isRequired,
    onDrag: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func,
    onClick: PropTypes.func.isRequired,
};

export default DraggableDialContainer;
