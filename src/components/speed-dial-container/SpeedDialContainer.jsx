import React, { Component } from 'react';
import { Map, List } from 'immutable';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';

import DragDialContainer from '../drag-dial-container/DragDialContainer';
import TileEditModal from '../common/tile-edit-modal/TileEditModal';
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
            data: {},
            configuredTile: null,
            isConfigLoaded: false,

            dialColumns: dialUtils.computeColumns(DIAL_WIDTH, WIDTH_TO_LEAVE),
        };

        this.openFolder = this.openFolder.bind(this);
        this.goBack = this.goBack.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onItemMoved = this.onItemMoved.bind(this);
        this.onDialUpdate = this.onDialUpdate.bind(this);
        this.onEditModalClose = this.onEditModalClose.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.onEdit = this.onEdit.bind(this);

        this.throttledSave = _throttle(this.saveChanges, 500);

        window.addEventListener(
            'resize',
            _debounce(this.onResize, 200, { trailing: true }),
        );
    }

    async componentWillMount() {
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

        const newChildren =
            await browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

        this.updateList(newChildren);

        const data = await browserUtils.localStorage.get('metaData');
        const dialData = data['metaData'];

        this.setState({
            data: dialData || {},
            isConfigLoaded: true,
        });
    }

    onResize() {
        const columns = dialUtils.computeColumns(DIAL_WIDTH, WIDTH_TO_LEAVE);

        if (columns !== this.state.dialColumns) {
            this.setState(({ children }) => {
                const newChildren = updateChildren(children, columns);

                const updatedTile = this.updateEditTile(newChildren);

                return {
                    children: newChildren,
                    dialColumns: columns,
                    configuredTile: updatedTile,
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

            const updatedTile = this.updateEditTile(updatedChildren);

            return {
                children: updatedChildren,
                configuredTile: updatedTile,
            };
        });
    }

    onOpen(index) {
        const node = this.state.children.getIn([index, 'treeNode']);

        if (node.get('type') === 'folder') {
            this.openFolder(node.get('id'));
        } else if (node.get('type') === 'bookmark') {
            window.location.href = node.get('url');
        }
    }

    onEdit(index, id) {
        // Do not allow simultaneous editing of multiple tiles
        if (!this.state.configuredTile) {
            this.setState({
                configuredTile: {
                    index,
                    id,
                },
            });
        }
    }

    onEditModalClose() {
        this.setState({
            configuredTile: null,
        });
    }

    async onDialUpdate(id) {
        const colorData = await browserUtils.getColor();
        this.state.data[id] = colorData;

        this.forceUpdate();
        this.throttledSave();
    }

    getDialWidth() {
        return dialUtils.computeDialsWidth(this.state.dialColumns, DIAL_WIDTH, BETWEEN_DIALS);
    }

    getDialHeight() {
        const count = this.state.children ? this.state.children.count() : 0;

        return dialUtils.computeDialsHeight(
            count,
            this.state.dialColumns,
            DIAL_HEIGHT,
        );
    }

    saveChanges() {
        browserUtils.localStorage.set({ metaData: this.state.data }).then();
    }

    updateEditTile(newChildren) {
        // This is code needed to ensure that changing the position of editable tile
        //    does not close the edit dialog
        if (this.state.configuredTile) {
            const book = newChildren.get(this.state.configuredTile.index);
            // Tile does not exist or it's not the same tile
            const sameTile = book && book.getIn(['treeNode', 'id']) === this.state.configuredTile.id;

            // At set index, tile is not the same
            if (!sameTile) {
                // Attempt to find the bookmark in the collection
                const index = newChildren.findIndex(bookmark =>
                    bookmark.getIn(['treeNode', 'id']) === this.state.configuredTile.id);

                if (index !== -1) {
                    // We found the bookmark, update state
                    return {
                        index,
                        id: this.state.configuredTile.id,
                    };
                } else {
                    // Bookmark no longer exists in this folder
                    return null;
                }
            }
        }

        return this.state.configuredTile;
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

        const updatedTile = this.updateEditTile(updatedChildren);

        this.setState({
            children: updatedChildren,
            ...additionalState,
            configuredTile: updatedTile,
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
        const data = this.state.data;
        const isRoot = this.state.currFolderId === this.props.bookmarkTreeId;
        const editTileExists = this.state.configuredTile !== null;

        const dialsStyle = {
            width: this.getDialWidth(),
            height: this.getDialHeight(),
        };

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

                {this.state.isConfigLoaded && children &&
                    <div className="dial-container" style={dialsStyle}>

                        <DragDialContainer
                            key={this.state.currFolderId}
                            folderId={this.state.currFolderId}
                            bookmarks={children}
                            data={data}
                            columnCount={this.state.dialColumns}
                            onOpen={this.onOpen}
                            onItemMoved={this.onItemMoved}
                            onEdit={this.onEdit}
                            onDialUpdate={this.onDialUpdate}
                        />

                    </div>
                }

                {editTileExists &&
                    <Portal node={document && document.getElementById('modals')}>
                        <TileEditModal onClose={this.onEditModalClose} />
                    </Portal>
                }
            </div>
        );
    }
}

SpeedDialContainer.propTypes = {
    bookmarkTreeId: PropTypes.string.isRequired,
};

export default SpeedDialContainer;
