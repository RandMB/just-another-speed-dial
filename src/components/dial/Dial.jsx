import React, { PureComponent } from 'react';
import { Portal } from 'react-portal';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import TileEditModal from '../common/tile-edit-modal/TileEditModal';
import DialTitle from '../dial-title/DialTitle';
import DialTile from '../dial-tile/DialTile';

import './Dial.css';

const DRAG_ZINDEX = 5000;
const TRANSITION_DURATION = 0.25;

function extractRGB(a) {
    return `rgb(${a[0]},${a[1]},${a[2]})`;
}

class Dial extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            currentPosX: props.xPos,
            currentPosY: props.yPos,

            isEdited: false,
        };

        if (!props.dialMeta && props.node.get('type') !== 'folder') {
            this.props.onUpdate(props.node.get('id'), props.node.get('url'));
        }

        this.willUnmount = false;

        this.onEditMouseDown = this.onEditMouseDown.bind(this);
        this.onEditModalClose = this.onEditModalClose.bind(this);
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
            this.setState({ isEdited: true });
        }, { once: true });
    }

    onEditModalClose() {
        this.setState({ isEdited: false });
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
                ref={this.props.elementRef}
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

                {this.state.isEdited &&
                    <Portal node={document && document.getElementById('modals')}>
                        <TileEditModal onClose={this.onEditModalClose} />
                    </Portal>
                }
            </div>
        );
    }
}

Dial.propTypes = {
    node: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    elementRef: PropTypes.func,
    dialMeta: PropTypes.object,
    xPos: PropTypes.number.isRequired,
    yPos: PropTypes.number.isRequired,
    isDragged: PropTypes.bool.isRequired,
    onMouseDown: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default Dial;
