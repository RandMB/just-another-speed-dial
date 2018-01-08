import React, { Component } from 'react';
import PropTypes from 'prop-types';

import _throttle from 'lodash/throttle';

import './SpeedDialItem.css';
import folderImage from '../../../../assets/folder.png';

function extractRGB(a) {
    return `rgb(${a[0]},${a[1]},${a[2]})`;
}

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

        // 16ms = 60fps, but updates also take time, so lower value has to be used
        this.throttledMouseMove = _throttle(this.onMouseMove, 14);
        // 250ms was selected by simply testing
        this.throttledDrag = _throttle(this.props.onDrag, 250);

        this.dragTimeout = null;
        this.suppressOnClick = false;

        this.cachedState = [];

        if (!props.dialMeta && props.node.type !== 'folder') {
            this.props.onUpdate(props.node.id, props.node.url);
        }
    }

    componentWillReceiveProps(newProps) {
        const viewData = newProps.data.view;

        if (viewData.dialPosX !== this.state.currentPosX ||
            viewData.dialPosY !== this.state.currentPosY) {

            const newState = {
                currentPosX: viewData.dialPosX,
                currentPosY: viewData.dialPosY,
                transitionDuration: 0.25,
            };

            // If the element is being dragged, skip the workaround, as i creates janky transition
            if (this.state.isDragged) {
                this.setState(newState);
            } else {
                this.cachedState.push(newState);
            }
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
        // 0 button means left click
        if (event.nativeEvent.button !== 0) {
            return;
        }

        event.persist();

        if (this.dragTimeout) {
            clearTimeout(this.dragTimeout);
        }

        document.addEventListener('mouseup', this.onDragEnd);

        // Delay the event, to allow click event to do the work
        this.dragTimeout = setTimeout(() => {
            const nativeEvent = event.nativeEvent;

            document.addEventListener('mousemove', this.throttledMouseMove);

            this.setState({
                mouseDragStartPosX: nativeEvent.clientX,
                mouseDragStartPosY: nativeEvent.clientY,

                dragPosX: this.state.currentPosX,
                dragPosY: this.state.currentPosY,

                dragStartPosX: this.state.currentPosX,
                dragStartPosY: this.state.currentPosY,

                isDragged: true,
            });
        }, 300);
    }

    onDragEnd(event) {
        if (this.state.isDragged) {
            document.removeEventListener('mousemove', this.throttledMouseMove);

            this.setState({
                isDragged: false,
            });

            this.suppressOnClick = true;
        }

        document.removeEventListener('mouseup', this.onDragEnd);

        if (this.dragTimeout) {
            clearTimeout(this.dragTimeout);
            this.dragTimeout = null;
        }

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
                dragTransitionDuration: 0.1
            };
        });
    }

    componentDidUpdate() {
        // HACK: React remounts the component, skipping transition.
        // Delay the state change to allow the browser to process and paint stuff
        if (this.cachedState.length > 0) {
            const state = this.cachedState.pop();
            setTimeout(() => {
                window.requestAnimationFrame(() => {
                    console.log(this.props.node.id);
                    this.setState(state);
                });
            }, 10);
        }
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

        let dialTileStyle = {};

        if (this.props.dialMeta) {
            dialTileStyle = {
                background: extractRGB(this.props.dialMeta.background),
                color: extractRGB(this.props.dialMeta.text),
            };
        }

        return (
            <div
                draggable="true"
                className={dialClass}
                style={dialStyle}>

                <div
                    className="dial-tile rounded-borders"
                    title={url}
                    onClick={this.onClick}
                    onMouseDown={this.onDragStart}
                    style={dialTileStyle}>

                    {type === 'folder' &&
                        <img alt="" draggable="false" src={folderImage} />
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
    dialMeta: PropTypes.object,
    onOpenFolder: PropTypes.func.isRequired,
    onDrag: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default SpeedDialItem;