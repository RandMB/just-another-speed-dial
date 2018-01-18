import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import DialTitle from '../dial-title/DialTitle';
import DialTile from '../dial-tile/DialTile';

import './DialContainer.css';

const DRAG_ZINDEX = 5000;
const TRANSITION_DURATION = 0.25;

function extractRGB(a) {
    return `rgb(${a[0]},${a[1]},${a[2]})`;
}

class DialContainer extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            currentPosX: props.xPos,
            currentPosY: props.yPos,
        };

        if (!props.dialMeta && props.node.get('type') !== 'folder') {
            this.props.onUpdate(props.node.get('id'), props.node.get('url'));
        }

        this.willUnmount = false;

        this.onEditMouseDown = this.onEditMouseDown.bind(this);
    }

    componentWillReceiveProps(newProps) {
        const newState = {
            currentPosX: newProps.xPos,
            currentPosY: newProps.yPos,
        };

        // If the element is being dragged, skip the workaround, as it creates janky transition
        if (this.props.isDragged) {
            this.setState(newState);
        } else if (newState.currentPosX !== this.state.currentPosX ||
            newState.currentPosY !== this.state.currentPosY) {
            // HACK: React remounts DOM node, skipping transition.
            // Delay the state change to allow the browser to process and paint stuff
            setTimeout(() => {
                if (!this.willUnmount) {
                    window.requestAnimationFrame(() => {
                        this.setState(newState);
                    });
                }
            }, 10);
        }
    }

    componentWillUnmount() {
        this.willUnmount = true;
    }

    onEditMouseDown(event) {
        event.stopPropagation();

        window.addEventListener('mouseup', () => {
            this.props.onEdit(this.props.view.get('index'), this.props.node.get('id'));
        }, { once: true });
    }

    render() {
        const {
            node,
            isDragged,
            dialMeta,
            onMouseDown,
            view,
        } = this.props;

        const { currentPosX, currentPosY } = this.state;

        const title = node.get('title');
        const type = node.get('type');
        const url = node.get('url');

        const transitionDuration = isDragged ? 0 : TRANSITION_DURATION;

        const dialClass = ClassNames({
            'dial-item-container': true,
            'dial-dragged': isDragged,
        });

        const dialStyle = {
            transform: `translate3D(${currentPosX}px,${currentPosY}px,0)`,
            transitionDuration: `${transitionDuration}s`,
            zIndex: isDragged ? DRAG_ZINDEX : view.get('zIndex'),
        };

        let dialTileStyle = {};

        // During initial render dialMeta can be undefined
        if (dialMeta) {
            dialTileStyle = {
                background: extractRGB(dialMeta.background),
                color: extractRGB(dialMeta.text),
            };
        }

        return (
            <div
                className={dialClass}
                style={dialStyle}
            >

                <DialTile
                    url={url}
                    type={type}
                    onMouseDown={onMouseDown}
                    onEditMouseDown={this.onEditMouseDown}
                    tileStyle={dialTileStyle}
                />

                <DialTitle title={title} />
            </div>
        );
    }
}

DialContainer.propTypes = {
    node: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    dialMeta: PropTypes.object,
    xPos: PropTypes.number.isRequired,
    yPos: PropTypes.number.isRequired,
    isDragged: PropTypes.bool.isRequired,
    onMouseDown: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default DialContainer;
