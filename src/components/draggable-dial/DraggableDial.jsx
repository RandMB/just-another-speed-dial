import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Dial from '../dial/Dial';

function computeDistance(startX, startY, endX, endY) {
    return Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
}

const DRAG_DISTANCE_THRESHOLD = 15;

class DraggableDial extends PureComponent {
    static computeDragPos(dragStart, mouseDragStart, currentMouseDrag) {
        return (dragStart - (mouseDragStart - currentMouseDrag));
    }

    constructor(props) {
        super(props);

        this.state = {
            isDragged: false,
        };

        this.dragDefault = {
            dragStartPosX: 0,
            dragStartPosY: 0,

            mouseDragStartPosX: 0,
            mouseDragStartPosY: 0,

            currentDragPosX: 0,
            currentDragPosY: 0,

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
        this.willUnmount = false;

        this.elementRef = null;
    }

    componentWillUnmount() {
        // Prevent calling setState on component which is going to unmount
        this.currentDragState.isDraggedCurrently = false;
        this.willUnmount = true;
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

        this.currentDragState = Object.assign(this.currentDragState, {
            mouseDragStartPosX: nativeEvent.clientX,
            mouseDragStartPosY: nativeEvent.clientY,

            dragStartPosX: this.props.xPos,
            dragStartPosY: this.props.yPos,

            isDraggedCurrently: true,

            currentDragPosX: this.props.xPos,
            currentDragPosY: this.props.yPos,
        });

        this.dragReportInterval = setInterval(() => {
            if (this.currentDragState.isDraggedCurrently) {
                this.props.onDrag({
                    index: this.props.id,
                    dragPosX: this.currentDragState.currentDragPosX,
                    dragPosY: this.currentDragState.currentDragPosY,
                });
            }
        }, 100);

        this.setState({ isDragged: true });
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

        this.currentDragState.currentDragPosX = DraggableDial.computeDragPos(
            this.currentDragState.dragStartPosX,
            this.currentDragState.mouseDragStartPosX,
            event.clientX,
        );

        this.currentDragState.currentDragPosY = DraggableDial.computeDragPos(
            this.currentDragState.dragStartPosY,
            this.currentDragState.mouseDragStartPosY,
            event.clientY,
        );
    }

    dragAnimate() {
        if (this.currentDragState.isDraggedCurrently) {
            const dragPosX = this.currentDragState.currentDragPosX;
            const dragPosY = this.currentDragState.currentDragPosY;

            // If we have an element, apply the syles, otherwise, force an update.
            //  Animation with dom node is not in 'react' way , but is more efficient
            //  and has more chances to achieve desired 60 fps
            if (this.elementRef) {
                this.elementRef.style.transform = `translate3D(${dragPosX}px,${dragPosY}px,0)`;
                this.elementRef.style.transitionDuration = '0s';
            } else {
                // Sometimes we don't have a DOM node
                this.forceUpdate();
            }

            window.requestAnimationFrame(this.dragAnimate);
        } else if (!this.willUnmount) {
            // Tell the dial it's not being dragged anymore, unless we are being unmounted
            this.setState({ isDragged: false });
        }
    }

    render() {
        const {
            xPos,
            yPos,
            onDrag,
            onDragEnd,
            onClick,
            id,
            ...rest
        } = this.props;

        let currentPosX = xPos;
        let currentPosY = yPos;

        if (this.currentDragState.isDraggedCurrently) {
            currentPosX = this.currentDragState.currentDragPosX;
            currentPosY = this.currentDragState.currentDragPosY;
        }

        return (
            <Dial
                xPos={currentPosX}
                yPos={currentPosY}
                isDragged={this.state.isDragged}
                onMouseDown={this.onMouseDown}
                elementRef={el => this.elementRef = el}
                {...rest}
            />
        );
    }
}

DraggableDial.propTypes = {
    xPos: PropTypes.number.isRequired,
    yPos: PropTypes.number.isRequired,
    id: PropTypes.any.isRequired,
    onDrag: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func,
    onClick: PropTypes.func.isRequired,
};

export default DraggableDial;
