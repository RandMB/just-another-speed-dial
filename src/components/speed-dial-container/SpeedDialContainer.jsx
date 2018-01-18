import React, { Component } from 'react';
import { Map, List } from 'immutable';
import PropTypes from 'prop-types';
import _debounce from 'lodash/debounce';

import DragDialContainer from '../drag-dial-container/DragDialContainer';
import dialUtils from '../../utils/dials';
import browserUtils from '../../utils/browser';

import './SpeedDialContainer.css';

const DIAL_HEIGHT = 239;
const DIAL_WIDTH = 250;
const BETWEEN_DIALS = 30;
const WIDTH_TO_LEAVE = 60;

function updateChild(children, index, columnCount, itemCount) {
    return children.setIn([index, 'view', 'zIndex'], itemCount - index)
        .setIn([index, 'view', 'index'], index)
        .setIn([index, 'view', 'dialPosX'], dialUtils.computeDialXPos(index, columnCount, DIAL_WIDTH))
        .setIn([index, 'view', 'dialPosY'], dialUtils.computeDialYPos(index, columnCount, DIAL_HEIGHT));
}

function updateChildrenPartial(children, columnCount, start, end) {
    let updated = children;

    for (let index = start; index <= end; index++) {
        updated = updateChild(updated, index, columnCount, children.count());
    }

    return updated;
}

function updateChildren(children, columnCount) {
    return updateChildrenPartial(children, columnCount, 0, children.count() - 1);
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
        this.onItemMoved = this.onItemMoved.bind(this);

        window.addEventListener(
            'resize',
            _debounce(this.onResize, 200, { trailing: true }),
        );
    }

    async componentWillMount() {
        const newChildren =
            await browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

        this.updateList(newChildren);

        browserUtils.bookmarks.onMoved(async (id, moveInfo) => {
            if (moveInfo.parentId === this.state.currFolderId ||
                moveInfo.oldParentId === this.state.currFolderId) {

                const children =
                    await browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

                this.updateList(children);
            }
        });

        browserUtils.bookmarks.onCreated(async (id, bookmarkInfo) => {
            if (bookmarkInfo.parentId === this.state.currFolderId) {
                const children =
                    await browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

                this.updateList(children);
            }
        });

        browserUtils.bookmarks.onRemoved(async (id, removedInfo) => {
            if (removedInfo.parentId === this.state.currFolderId) {
                const children =
                    await browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

                this.updateList(children);
            }
        });

        browserUtils.bookmarks.onChanged((id, changeInfo) => {
            // Attempt to find the bookmark in the collection
            const index = this.state.children.findIndex(bookmark =>
                bookmark.getIn(['treeNode', 'id']) === id);

            if (index !== -1) {
                let updated = this.state.children;

                if (changeInfo.title) {
                    updated = updated.updateIn(
                        [index, 'treeNode'],
                        (node) => node.set('title', changeInfo.title),
                    );
                }

                if (changeInfo.url) {
                    updated = updated.updateIn(
                        [index, 'treeNode'],
                        (node) => node.set('url', changeInfo.url),
                    );
                }

                this.setState({
                    children: updated,
                });
            }
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

    onItemMoved(oldIndex, newIndex) {
        this.setState(({ children }) => {
            const removed = children.get(oldIndex);
            const newchildren = children.splice(oldIndex, 1);
            const insertedChildren = newchildren.splice(newIndex, 0, removed);

            const updatedChildren = updateChildrenPartial(
                insertedChildren,
                this.state.dialColumns,
                Math.min(newIndex, oldIndex),
                Math.max(newIndex, oldIndex),
            );

            return {
                children: updatedChildren,
            };
        });
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

    updateList(children, additionalState) {
        // We need a different structure than just an plain array
        const newChildren = List(children).map(child => {
            return Map({
                treeNode: Map(child),
                view: Map({}),
            });
        });

        const updatedChildren = updateChildren(newChildren, this.state.dialColumns);

        this.setState({
            children: updatedChildren,
            ...additionalState,
        });
    }

    async goBack() {
        if (this.state.currFolderId === this.props.bookmarkTreeId) {
            console.warn('Attempting to go back beyond the root folder');
            return;
        }

        const folderId = this.state.prevFolderId;

        const childrenNodes = browserUtils.bookmarks.getFolderChildren(folderId);
        const folderNode = browserUtils.bookmarks.get(folderId);

        const [children, folder] = await Promise.all([childrenNodes, folderNode]);

        this.updateList(children, {
            currFolderId: folderId,
            prevFolderId: folder[0].parentId,
        });
    }

    async openFolder(folderId) {
        const children =
            await browserUtils.bookmarks.getFolderChildren(folderId);

        const prevFolder = this.state.currFolderId;

        this.updateList(children, {
            currFolderId: folderId,
            prevFolderId: prevFolder,
        });
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
                        <DragDialContainer
                            key={this.state.currFolderId}
                            folderId={this.state.currFolderId}
                            bookmarks={children}
                            columnCount={this.state.dialColumns}
                            onOpenFolder={this.openFolder}
                            onItemMoved={this.onItemMoved}

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
};

export default SpeedDialContainer;
