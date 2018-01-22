import React, { PureComponent } from 'react';
import { Portal } from 'react-portal';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import DialEditModal from '../dial-edit-modal/DialEditModal';
import ModalWithOverlay from '../common/modal-with-overlay/ModalWithOverlay';
import DialTile from '../dial-tile/DialTile';
import browserUtils from '../../utils/browser';

import './Dial.css';

const DRAG_ZINDEX = 5000;
const TRANSITION_DURATION = 0.25;

class Dial extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            currentPosX: props.xPos,
            currentPosY: props.yPos,

            isEdited: false,
            isModalShown: false,
        };

        this.refNode = null;

        this.onEditMouseDown = this.onEditMouseDown.bind(this);
        this.onNodeMounted = this.onNodeMounted.bind(this);
        this.onSave = this.onSave.bind(this);
        this.animate = this.animate.bind(this);
    }

    async componentWillMount() {
        if (!this.props.dialMeta.background && this.props.node.get('type') !== 'folder') {
            const colorData = await browserUtils.colors.getColors();
            this.props.onUpdate(this.props.node.get('id'), colorData);
        }
    }

    componentDidUpdate(prevProps) {
        // See: https://medium.com/developers-writing/animating-the-unanimatable-1346a5aab3cd
        if (!this.props.isDragged) {
            // Extract the coordinates, as they can change between updates
            const newX = this.props.xPos;
            const newY = this.props.yPos;

            // If the coordinates changed, no point in animating if they didn't
            if (prevProps.xPos !== this.props.xPos || prevProps.yPos !== this.props.yPos) {
                requestAnimationFrame(() => {
                    // Set the dial to it's previous position. We do this in order to
                    //   avoid dial teleportig to it's new position because
                    //   the DOM node can get remounted, skipping transitions
                    this.animate(prevProps.xPos, prevProps.yPos, 0);

                    requestAnimationFrame(() => {
                        // Set the dial to it's new postion in the DOM, with transition
                        this.animate(newX, newY, TRANSITION_DURATION);
                    });
                });
            } else if (this.props.isDragged === false && prevProps.isDragged === true) {
                // When dragging ends, the dial can end up floatng in the middle of nowhere
                //    because at that point coordinates do not change
                // The dial has stopped being dragged. Update position again
                requestAnimationFrame(() => {
                    this.animate(newX, newY, TRANSITION_DURATION);
                });
            }
        }
    }

    onNodeMounted(node) {
        this.refNode = node;
        this.props.elementRef(node);
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

        if (value.hasOwnProperty('data')) {
            this.props.onUpdate(this.props.node.get('id'), value.data);
        }

        this.setState({ isModalShown: false });
    }

    animate(x, y, duration) {
        this.refNode.style.transform = `translate3D(${x}px,${y}px,0)`;
        this.refNode.style.transitionDuration = `${duration}s`;
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

        return (
            <div
                ref={(n) => this.onNodeMounted(n)}
                className={dialClass}
                style={dialStyle}
                draggable="false"
            >

                <DialTile
                    data={dialMeta}
                    node={node}
                    onMouseDown={onMouseDown}
                    onEditMouseDown={this.onEditMouseDown}
                />

                {this.state.isEdited &&
                    <Portal node={document && document.getElementById('modals')}>
                        <ModalWithOverlay in={this.state.isModalShown}>
                            <DialEditModal
                                in={this.state.isModalShown}
                                data={dialMeta}
                                node={node}
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
