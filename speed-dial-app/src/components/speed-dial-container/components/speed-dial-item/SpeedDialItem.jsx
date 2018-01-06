import React, { Component } from 'react';
import PropTypes from 'prop-types';

import _throttle from 'lodash/throttle';

import './SpeedDialItem.css';
import folderImage from '../../../../assets/folder.png';

class SpeedDialItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            transitionDuration: 0,
            currentPosX: props.data.view.dialPosX,
            currentPosY: props.data.view.dialPosY,

            dragPosX: null,
            dragPosY: null,

            dragStartPosX: null,
            dragStartPosY: null,

            mouseDragStartPosX: null,
            mouseDragStartPosY: null,

            dragTransitionDuration: 0,

            isDragged: false,
        };

        this.onClick = this.onClick.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);

        // 16ms = 60fps
        this.throttledMouseMove = _throttle(this.onMouseMove, 16);
        this.throttledDrag = _throttle(this.props.onDrag, 60);

        this.dragTimeout = null;
        this.suppressOnClick = false;

        this.cachedState = [];
    }

    componentWillReceiveProps(newProps) {
        const viewData = newProps.data.view;

        if (viewData.dialPosX !== this.state.currentPosX ||
            viewData.dialPosY !== this.state.currentPosY) {

            this.cachedState.push({
                currentPosX: viewData.dialPosX,
                currentPosY: viewData.dialPosY,
                transitionDuration: 0.25,
            });
        }
    }

    onClick(event) {
        if (this.suppressOnClick) {
            this.suppressOnClick = false;
            return;
        }

        if (this.dragTimeout) {
            clearTimeout(this.dragTimeout);
            this.dragTimeout = null;
        }

        if (this.props.node.type === 'folder') {
            this.props.onOpenFolder(this.props.node.id);
        } else if (this.props.node.type === 'bookmark') {
            window.location.href = this.props.node.url;
        }
    }

    onDragStart(event) {
        console.log(event.nativeEvent);
        event.persist();
        // Delay the event, to allow click event to do the work
        this.dragTimeout = setTimeout(() => {
            const nativeEvent = event.nativeEvent;

            document.addEventListener('mousemove', this.throttledMouseMove);
            document.addEventListener('mouseup', this.onDragEnd);

            this.setState({
                mouseDragStartPosX: nativeEvent.clientX,
                mouseDragStartPosY: nativeEvent.clientY,

                dragPosX: this.state.currentPosX,
                dragPosY: this.state.currentPosY,

                dragStartPosX: this.state.currentPosX,
                dragStartPosY: this.state.currentPosY,

                isDragged: true,
            });
        }, 100);
    }

    onDragEnd(event) {
        document.removeEventListener('mousemove', this.throttledMouseMove);
        document.removeEventListener('mouseup', this.onDragEnd);

        this.setState({
            isDragged: false,
        });

        this.dragTimeout = null;
        this.suppressOnClick = true;
    }

    onMouseMove(event) {
        this.throttledDrag({
            index: this.props.data.view.index,
            dragPosX: this.state.dragStartPosX - (this.state.mouseDragStartPosX - event.clientX),
            dragPosY: this.state.dragStartPosY - (this.state.mouseDragStartPosY - event.clientY),
        });

        this.setState((prevState) => {
            return {
                dragPosX: prevState.dragStartPosX - (prevState.mouseDragStartPosX - event.clientX),
                dragPosY: prevState.dragStartPosY - (prevState.mouseDragStartPosY - event.clientY),
                dragTransitionDuration: 0.05
            };
        });
    }

    componentDidUpdate() {
        window.requestAnimationFrame(() => {
            setTimeout(() => {
                if (this.cachedState.length > 0) {
                    const state = this.cachedState.pop();
                    this.setState(state);
                }
            }, 0);
        });
    }

    render() {
        const {
            title,
            type,
            url,
        } = this.props.node;

        const {
            currentPosX,
            currentPosY,
        } = this.state;

        const xPos = this.state.isDragged ? this.state.dragPosX : currentPosX;
        const yPos = this.state.isDragged ? this.state.dragPosY : currentPosY;
        const transitionDuration = this.state.isDragged ? this.state.dragTransitionDuration : this.state.transitionDuration;

        let dialClass = 'dial-item-container';
        dialClass += this.state.isDragged ? ' dial-dragged' : '';

        const dialStyle = {
            transform: `translate3D(${xPos}px,${yPos}px,0)`,
            transitionDuration: `${transitionDuration}s`,
        };

        return (
            <div
                draggable="true"
                className={dialClass}
                style={dialStyle}
                onMouseDown={this.onDragStart}
                ref={(node) => { this.dialNode = node; }}
                data-index={this.props.data.view.index}
                data-drag={this.state.isDragged}>

                <div
                    className="dial-tile rounded-borders"
                    title={url}
                    onClick={this.onClick}>

                    {type === 'folder' &&
                        <img alt="" src={folderImage} />
                    }
                    {type === 'bookmark' &&
                        <a>{new URL(url).host}</a>
                    }
                </div>
                <div className="dial-title-container">
                    <div
                        className="dial-title-background"
                        title={title}>

                        <a>{title}</a>
                    </div>
                </div>
            </div>
        );
    }
}

SpeedDialItem.propTypes = {
    node: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onOpenFolder: PropTypes.func.isRequired,
    onDrag: PropTypes.func.isRequired,
};

export default SpeedDialItem;