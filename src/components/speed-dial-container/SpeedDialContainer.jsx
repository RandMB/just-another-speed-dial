import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _debounce from 'lodash/debounce';
import _cloneDeep from 'lodash/cloneDeep';

import DialFolder from '../dial-folder/DialFolder';
import DialUtils from '../../utils/dialUtlis';

import './SpeedDialContainer.css';

const DIAL_HEIGHT = 239;
const DIAL_WIDTH = 250;
const BETWEEN_DIALS = 30;
const WIDTH_TO_LEAVE = 60;

function updateChildren(children, columnCount) {
    children.forEach((child, index) => {
        Object.assign(
            child.view,
            {
                zIndex: children.length - index,
                index,
                dialPosX: DialUtils.computeDialXPos(index, columnCount, DIAL_WIDTH),
                dialPosY: DialUtils.computeDialYPos(index, columnCount, DIAL_HEIGHT),
            },
        );
    });
}

function updateChildrenPartial(children, columnCount, start, end) {
    for (let index = start; index <= end; index++) {
        Object.assign(children[index].view, {
            zIndex: children.length - index,
            index,
            dialPosX: DialUtils.computeDialXPos(index, columnCount, DIAL_WIDTH),
            dialPosY: DialUtils.computeDialYPos(index, columnCount, DIAL_HEIGHT),
        });
    }
}

class SpeedDialContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currFolderId: props.bookmarkTreeId,
            prevFolderId: null,
            children: null,

            dialColumns: DialUtils.computeColumns(DIAL_WIDTH, WIDTH_TO_LEAVE),
        };

        this.openFolder = this.openFolder.bind(this);
        this.goBack = this.goBack.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);

        this.browserUtils = this.props.browserUtils;

        window.addEventListener(
            'resize',
            _debounce(this.onResize, 200, { trailing: true }),
        );
    }

    async componentWillMount() {
        const children =
            await this.browserUtils.bookmarks.getFolderChildren(this.props.bookmarkTreeId);

        this.setState({
            children: this.transformChildren(children),
        });
    }

    onResize() {
        const columns = DialUtils.computeColumns(DIAL_WIDTH, WIDTH_TO_LEAVE);

        if (columns !== this.state.dialColumns) {
            this.setState((prevState) => {
                const newChildren = _cloneDeep(prevState.children);
                updateChildren(newChildren, columns);

                return {
                    children: newChildren,
                    dialColumns: columns,
                };
            });
        }
    }

    onDrag(dragData) {
        const normalizedPositions = {
            x: DialUtils.nomalizePosX(
                dragData.dragPosX,
                this.state.dialColumns,
                DIAL_WIDTH,
                BETWEEN_DIALS,
            ),

            y: DialUtils.nomalizePosY(
                dragData.dragPosY,
                this.state.children.length,
                this.state.dialColumns,
                DIAL_HEIGHT,
            ),
        };

        const newIndex = DialUtils.computeDialIndex(
            normalizedPositions,
            this.state.dialColumns,
            this.state.children.length,
            DIAL_WIDTH,
            DIAL_HEIGHT,
        );

        if (newIndex !== dragData.index) {
            this.setState((prevState) => {
                const newChildren = _cloneDeep(prevState.children);

                const [removed] = newChildren.splice(dragData.index, 1);
                newChildren.splice(newIndex, 0, removed);

                updateChildrenPartial(
                    newChildren,
                    this.state.dialColumns,
                    Math.min(newIndex, dragData.index),
                    Math.max(newIndex, dragData.index),
                );

                return {
                    children: newChildren,
                };
            });
        }
    }

    async onDragEnd(oldIndex, newIndex) {
        if (newIndex !== oldIndex) {
            let indexToMove;

            if (newIndex < oldIndex) {
                indexToMove = this.state.children[newIndex + 1].treeNode.index;
            } else {
                indexToMove = this.state.children[newIndex - 1].treeNode.index;
            }

            await this.browserUtils.bookmarks.move(
                this.state.children[newIndex].treeNode.id,
                { index: indexToMove },
            );

            const children =
                await this.browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

            this.setState({
                children: this.transformChildren(children),
            });
        }
    }

    getDialWidth() {
        return DialUtils.computeDialsWidth(this.state.dialColumns, DIAL_WIDTH, BETWEEN_DIALS);
    }

    getDialHeight() {
        return DialUtils.computeDialsHeight(
            this.state.children.length,
            this.state.dialColumns,
            DIAL_HEIGHT,
        );
    }

    async goBack() {
        if (this.state.currFolderId === this.props.bookmarkTreeId) {
            console.warn('Attempting to go back beyond the root folder');
            return;
        }

        const folderId = this.state.prevFolderId;

        const childrenNodes = this.browserUtils.bookmarks.getFolderChildren(folderId);
        const folderNode = this.browserUtils.bookmarks.get(folderId);

        const [children, folder] = await Promise.all([childrenNodes, folderNode]);

        this.setState(() => ({
            children: this.transformChildren(children),
            currFolderId: folderId,
            prevFolderId: folder[0].parentId,
        }));
    }

    async openFolder(folderId) {
        const children =
            await this.browserUtils.bookmarks.getFolderChildren(folderId);

        this.setState(prevState => ({
            children: this.transformChildren(children),
            currFolderId: folderId,
            prevFolderId: prevState.currFolderId,
        }));
    }

    transformChildren(children) {
        return children.map((child, index) => ({
            treeNode: child,
            view: {
                index,
                zIndex: children.length - index,
                dialPosX: DialUtils.computeDialXPos(index, this.state.dialColumns, DIAL_WIDTH),
                dialPosY: DialUtils.computeDialYPos(index, this.state.dialColumns, DIAL_HEIGHT),
            },
        }));
    }

    render() {
        const children = this.state.children;
        const isRoot = this.state.currFolderId === this.props.bookmarkTreeId;

        return (
            <div
                className="speed-dials config-close"
                onDragOver={event => event.preventDefault()}
            >
                <div className="dial-container-top config-close">
                    {!isRoot &&
                        <button
                            className="button-transparent"
                            type="button"
                            onClick={this.goBack}
                        >
                            &lt;&lt; Back
                        </button>
                    }
                </div>

                <div className="dial-container config-close">
                    {children &&
                        <DialFolder
                            key={this.state.currFolderId}
                            folderId={this.state.currFolderId}
                            bookmarks={children}
                            onOpenFolder={this.openFolder}
                            onDialDrag={this.onDrag}
                            onDragEnd={this.onDragEnd}

                            width={this.getDialWidth()}
                            height={this.getDialHeight()}
                        />
                    }
                </div>
            </div>
        );
    }
}

SpeedDialContainer.propTypes = {
    bookmarkTreeId: PropTypes.string.isRequired,
    browserUtils: PropTypes.object.isRequired,
};

export default SpeedDialContainer;
