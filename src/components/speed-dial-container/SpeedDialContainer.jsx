import React, { Component } from 'react';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import _debounce from 'lodash/debounce';

import DialFolder from '../dial-folder/DialFolder';
import dialUtils from '../../utils/dials';

import './SpeedDialContainer.css';

const DIAL_HEIGHT = 239;
const DIAL_WIDTH = 250;
const BETWEEN_DIALS = 30;
const WIDTH_TO_LEAVE = 60;

function updateChild(child, index, columnCount, itemCount) {
    Object.assign(
        child.view,
        {
            zIndex: itemCount - index,
            index,
            dialPosX: dialUtils.computeDialXPos(index, columnCount, DIAL_WIDTH),
            dialPosY: dialUtils.computeDialYPos(index, columnCount, DIAL_HEIGHT),
        },
    );

    return child;
}

function updateChildren(children, columnCount) {
    return children.map((child, index) => {
        return updateChild(child, index, columnCount, children.count());
    });
}

function updateChildrenPartial(children, columnCount, start, end) {
    let newChildren = children;

    for (let index = start; index <= end; index++) {
        const updated = updateChild(newChildren.get(index), index, columnCount, children.count());
        newChildren = newChildren.set(index, updated);
    }

    return newChildren;
}

class SpeedDialContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currFolderId: props.bookmarkTreeId,
            prevFolderId: null,
            children: null,

            dialColumns: dialUtils.computeColumns(DIAL_WIDTH, WIDTH_TO_LEAVE),
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

        const list1 = List(this.transformChildren(children));

        this.setState({
            children: list1,
        });
    }

    onResize() {
        const columns = dialUtils.computeColumns(DIAL_WIDTH, WIDTH_TO_LEAVE);

        if (columns !== this.state.dialColumns) {
            this.setState(({ children }) => {
                const newChildren = updateChildren(children, columns);

                return {
                    children: newChildren,
                    dialColumns: columns,
                };
            });
        }
    }

    onDrag(dragData) {
        const normalizedPositions = {
            x: dialUtils.nomalizePosX(
                dragData.dragPosX,
                this.state.dialColumns,
                DIAL_WIDTH,
                BETWEEN_DIALS,
            ),

            y: dialUtils.nomalizePosY(
                dragData.dragPosY,
                this.state.children.count(),
                this.state.dialColumns,
                DIAL_HEIGHT,
            ),
        };

        const newIndex = dialUtils.computeDialIndex(
            normalizedPositions,
            this.state.dialColumns,
            this.state.children.count(),
            DIAL_WIDTH,
            DIAL_HEIGHT,
        );

        if (newIndex !== dragData.index) {
            this.setState(({ children }) => {
                const removed = children.get(dragData.index);
                const newchildren = children.splice(dragData.index, 1);
                const insertedChildren = newchildren.splice(newIndex, 0, removed);

                const updatedChildren = updateChildrenPartial(
                    insertedChildren,
                    this.state.dialColumns,
                    Math.min(newIndex, dragData.index),
                    Math.max(newIndex, dragData.index),
                );

                return {
                    children: updatedChildren,
                };
            });
        }
    }

    async onDragEnd(oldIndex, newIndex) {
        if (newIndex !== oldIndex) {
            let indexToMove;

            if (newIndex < oldIndex) {
                indexToMove = this.state.children.get(newIndex + 1).treeNode.index;
            } else {
                indexToMove = this.state.children.get(newIndex - 1).treeNode.index;

                // Chrome behaves different when moving bookmarks forward
                if (this.browserUtils.browserType === 'chrome') {
                    indexToMove += 1;
                }
            }

            await this.browserUtils.bookmarks.move(
                this.state.children.get(newIndex).treeNode.id,
                { index: indexToMove },
            );

            const children =
                await this.browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

            this.setState({
                children: List(this.transformChildren(children)),
            });
        }
    }

    getDialWidth() {
        return dialUtils.computeDialsWidth(this.state.dialColumns, DIAL_WIDTH, BETWEEN_DIALS);
    }

    getDialHeight() {
        return dialUtils.computeDialsHeight(
            this.state.children.count(),
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
            children: List(this.transformChildren(children)),
            currFolderId: folderId,
            prevFolderId: folder[0].parentId,
        }));
    }

    async openFolder(folderId) {
        const children =
            await this.browserUtils.bookmarks.getFolderChildren(folderId);

        const list1 = List(this.transformChildren(children));

        this.setState(prevState => ({
            children: list1,
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
                dialPosX: dialUtils.computeDialXPos(index, this.state.dialColumns, DIAL_WIDTH),
                dialPosY: dialUtils.computeDialYPos(index, this.state.dialColumns, DIAL_HEIGHT),
            },
        }));
    }

    render() {
        const children = this.state.children;
        const isRoot = this.state.currFolderId === this.props.bookmarkTreeId;

        return (
            <div
                className="speed-dials"
                onDragOver={event => event.preventDefault()}
            >
                <div className="dial-container-top">
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

                <div className="dial-container">
                    {children &&
                        <DialFolder
                            key={this.state.currFolderId}
                            folderId={this.state.currFolderId}
                            bookmarks={children}
                            onOpenFolder={this.openFolder}
                            onDialDrag={this.onDrag}
                            onDragEnd={this.onDragEnd}
                            browserUtils={this.browserUtils}

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
