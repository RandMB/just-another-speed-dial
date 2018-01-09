import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DialTitle from '../dial-title/DialTitle';
import DialTile from '../dial-tile/DialTile';

import './DialContainer.css';

function extractRGB(a) {
    return `rgb(${a[0]},${a[1]},${a[2]})`;
}

class DialContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPosX: props.xPos,
            currentPosY: props.yPos,
            transitionDuration: 0,
        };

        this.cachedState = null;

        if (!props.dialMeta && props.node.type !== 'folder') {
            this.props.onUpdate(props.node.id, props.node.url);
        }
    }

    componentWillReceiveProps(newProps) {

        const newState = {
            currentPosX: newProps.xPos,
            currentPosY: newProps.yPos,
        };

        // If the element is being dragged, skip the workaround, as it creates janky transition
        if (this.state.isDragged) {
            this.setState(newState);
        } else if (newState.currentPosX !== this.state.currentPosX ||
            newState.currentPosY !== this.state.currentPosY) {

            this.cachedState = newState;
        }

    }

    componentDidUpdate() {
        // HACK: React remounts the component, skipping transition.
        // Delay the state change to allow the browser to process and paint stuff
        if (this.cachedState) {
            const state = this.cachedState;
            this.cachedState = null;
            setTimeout(() => {
                window.requestAnimationFrame(() => {
                    this.setState(state);
                });
            }, 10);
        }
    }

    render() {
        const {
            node,
            isDragged,
            dialMeta,
            onMouseDown,
        } = this.props;

        const { 
            currentPosX, 
            currentPosY,
        } = this.state;

        const transitionDuration = isDragged ? 0 : 0.25;

        const {
            title,
            type,
            url,
        } = node;

        let dialClass = 'dial-item-container';
        dialClass += isDragged ? ' dial-dragged' : '';

        const dialStyle = {
            transform: `translate3D(${currentPosX}px,${currentPosY}px,0)`,
            transitionDuration: `${transitionDuration}s`,
        };

        const dialTileStyle = !dialMeta ? {} : {
            background: extractRGB(dialMeta.background),
            color: extractRGB(dialMeta.text),
        };

        return (
            <div
                className={dialClass}
                style={dialStyle}>

                <DialTile
                    url={url}
                    type={type}
                    onMouseDown={onMouseDown}
                    tileStyle={dialTileStyle}>

                </DialTile>

                <DialTitle title={title}></DialTitle>
            </div>
        );
    }
}

DialContainer.propTypes = {
    node: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    dialMeta: PropTypes.object,
    onUpdate: PropTypes.func.isRequired,
    xPos: PropTypes.number.isRequired,
    yPos: PropTypes.number.isRequired,
    isDragged: PropTypes.bool.isRequired,
    onMouseDown: PropTypes.func.isRequired,
};

export default DialContainer;