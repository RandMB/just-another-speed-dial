import React, { PureComponent } from 'react';
import { Portal } from 'react-portal';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import TileEditModal from '../tile-edit-modal/TileEditModal';
import ModalWithOverlay from '../common/modal-with-overlay/ModalWithOverlay';
import DialTitle from '../dial-title/DialTitle';
import DialTile from '../dial-tile/DialTile';
import browserUtils from '../../utils/browser';

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
            isModalShown: false,
        };

        if (!props.dialMeta && props.node.get('type') !== 'folder') {
            this.props.onUpdate(props.node.get('id'), props.node.get('url'));
        }

        this.willUnmount = false;

        this.onEditMouseDown = this.onEditMouseDown.bind(this);
        this.onSave = this.onSave.bind(this);
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
                window.requestAnimationFrame(() => {
                    // Don't call if the component is going to be unmounted
                    if (!this.willUnmount) {
                        this.setState(newState);
                    }
                });

            }, 10);
        }
    }

    componentWillUnmount() {
        this.willUnmount = true;
    }

    onEditMouseDown(event) {
        event.stopPropagation();

        window.addEventListener('mouseup', () => {
            this.setState({
                isEdited: true,
                isModalShown: true,
            });
        }, { once: true });
    }

    onSave(value) {
        if (value.hasOwnProperty('title') || value.hasOwnProperty('url')) {
            const changed = {};

            if (value.hasOwnProperty('title')) {
                changed.title = value.title;
            }

            if (value.hasOwnProperty('url')) {
                changed.url = value.url;
            }

            browserUtils.bookmarks.update(
                this.props.node.get('id'),
                changed,
            );
        }

        this.setState({ isModalShown: false });
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
                draggable="false"
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
                        <ModalWithOverlay in={this.state.isModalShown}>
                            <TileEditModal
                                in={this.state.isModalShown}
                                title={title}
                                url={url}
                                onClose={() => this.setState({ isModalShown: false })}
                                onExited={() => this.setState({ isEdited: false })}
                                onSave={this.onSave}
                            />
                        </ModalWithOverlay>
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
