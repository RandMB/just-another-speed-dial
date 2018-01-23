import React, { Component } from 'react';
import { Map, List } from 'immutable';
import PropTypes from 'prop-types';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';

import SpeedDialWithDragging from '../speed-dial-with-dragging/SpeedDialWithDragging';
import dialUtils from '../../utils/dials';
import browserUtils from '../../utils/browser';

import './SpeedDial.css';

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

class SpeedDial extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currFolderId: props.bookmarkTreeId,
            prevFolderId: null,
            children: null,

            // Data associated with dials, which is synced
            metaData: {},
            // Data associated with dials, which isn't synced (cache)
            localData: {},

            isConfigLoaded: false,

            dialColumns: dialUtils.computeColumns(DIAL_WIDTH, WIDTH_TO_LEAVE),
        };

        this.openFolder = this.openFolder.bind(this);
        this.goBack = this.goBack.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onItemMoved = this.onItemMoved.bind(this);
        this.onDialUpdate = this.onDialUpdate.bind(this);
        this.onBookmarkMoved = this.onBookmarkMoved.bind(this);
        this.onBookmarkCreated = this.onBookmarkCreated.bind(this);
        this.onBookmarkRemoved = this.onBookmarkRemoved.bind(this);
        this.onBookmarkChanged = this.onBookmarkChanged.bind(this);
        this.moveBookmark = this.moveBookmark.bind(this);
        this.onOpen = this.onOpen.bind(this);

        this.throttledSave = _throttle(this.saveChanges, 500);

        window.addEventListener(
            'resize',
            _debounce(this.onResize, 200, { trailing: true }),
        );

        this.scheduledUpdate = [];
    }

    async componentWillMount() {
        browserUtils.bookmarks.onMoved.addEventListener(this.onBookmarkMoved);
        browserUtils.bookmarks.onCreated.addEventListener(this.onBookmarkCreated);
        browserUtils.bookmarks.onRemoved.addEventListener(this.onBookmarkRemoved);
        browserUtils.bookmarks.onChanged.addEventListener(this.onBookmarkChanged);

        const childrenPromise =
            browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);
        const dataMetaPromise = browserUtils.localStorage.get('metaData');
        const dataLocalPromise = browserUtils.localStorage.get('localData');

        const [children, dataMeta, dataLocal] =
            await Promise.all([childrenPromise, dataMetaPromise, dataLocalPromise]);

        const metaData = dataMeta['metaData'] || {};
        const localData = dataLocal['localData'] || {};

        this.updateList(children, {
            metaData,
            localData,
            isConfigLoaded: true,
        });
    }

    componentWillUnmount() {
        browserUtils.bookmarks.onMoved.removeEventListener(this.onBookmarkMoved);
        browserUtils.bookmarks.onCreated.removeEventListener(this.onBookmarkCreated);
        browserUtils.bookmarks.onRemoved.removeEventListener(this.onBookmarkRemoved);
        browserUtils.bookmarks.onChanged.removeEventListener(this.onBookmarkChanged);
    }

    async onBookmarkChanged(id) {
        const bookmark = await browserUtils.bookmarks.get(id);

        if (bookmark[0].parentId === this.state.currFolderId) {
            const children =
                await browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

            this.updateList(children);
        }
    }

    async onBookmarkRemoved(id, removedInfo) {
        if (removedInfo.parentId === this.state.currFolderId) {
            const children =
                await browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

            this.updateList(children);
        }
    }

    async onBookmarkCreated(id, bookmark) {
        if (bookmark.parentId === this.state.currFolderId) {
            const children =
                await browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

            this.updateList(children);
        }
    }

    async onBookmarkMoved(id, moveInfo) {
        if (moveInfo.parentId === this.state.currFolderId &&
            moveInfo.oldParentId === this.state.currFolderId) {
            const index = this.scheduledUpdate.findIndex(el => el === id);

            // If we have done this move before, skip full update
            if (index !== -1) {
                this.scheduledUpdate.splice(index, 1);
                return;
            }
        }

        if (moveInfo.parentId === this.state.currFolderId ||
            moveInfo.oldParentId === this.state.currFolderId) {
            const children =
                await browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

            this.updateList(children);
        }
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

    onOpen(index) {
        const node = this.state.children.getIn([index, 'treeNode']);

        if (node.get('type') === 'folder') {
            this.openFolder(node.get('id'));
        } else if (node.get('type') === 'bookmark') {
            window.location.href = node.get('url');
        }
    }

    async onDialUpdate(id, metaData, localData) {
        if (metaData) {
            this.state.metaData[id] = Object.assign({}, this.state.metaData[id], metaData);
        }

        if (localData) {
            this.state.localData[id] = Object.assign({}, this.state.localData[id], localData);
        }

        this.throttledSave();
        this.forceUpdate();
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

    moveBookmark(oldIndex, newIndex, indexToMove) {
        const id = this.state.children.getIn([newIndex, 'treeNode', 'id']);
        this.scheduledUpdate.push(id);

        browserUtils.bookmarks.move(
            id,
            { index: indexToMove },
        );

        let children = this.state.children.setIn([newIndex, 'treeNode', 'index'], indexToMove);

        if (newIndex > oldIndex) {
            // The bookmark was moved forward
            // Decrement items indexes form oldIndex to index - 1, inclusive
            // The start is at zero as because we don't really know where to start from
            //   as filtered elements make gaps in our indexes
            for (let i = oldIndex; i < newIndex; i++) {
                children = children.updateIn([i, 'treeNode', 'index'], index => index - 1);
            }
        } else if (newIndex < oldIndex) {
            // The bookmark was moved backwards
            // Increment items indexes form newIndex + 1 to oldIndex, inclusive
            // Start from the next one ahead of changed one
            for (let i = newIndex + 1; i <= oldIndex; i++) {
                children = children.updateIn([i, 'treeNode', 'index'], index => index + 1);
            }
        }

        this.setState({ children });
    }

    async saveChanges() {
        const metaData = this.state.metaData;
        const localData = this.state.localData;

        await browserUtils.localStorage.set({ metaData, localData });
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

        // Reset
        this.scheduledUpdate = [];

        this.updateList(children, {
            currFolderId: folderId,
            prevFolderId: folder[0].parentId,
        });
    }

    async openFolder(folderId) {
        const children =
            await browserUtils.bookmarks.getFolderChildren(folderId);

        const prevFolder = this.state.currFolderId;

        // Reset
        this.scheduledUpdate = [];

        this.updateList(children, {
            currFolderId: folderId,
            prevFolderId: prevFolder,
        });
    }

    render() {
        const children = this.state.children;
        const { metaData, localData } = this.state;
        const isRoot = this.state.currFolderId === this.props.bookmarkTreeId;

        const dialsStyle = {
            width: this.getDialWidth(),
            height: this.getDialHeight(),
        };

        return (
            <div
                className="speed-dials"
                draggable="false"
                onDragOver={event => event.preventDefault()}
            >
                <div className="dial-container-top">
                    <div className="dial-container-start" />
                    <div className="dial-container-middle" >
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
                    <div className="dial-container-end" >
                        <div
                            className="config-open-button"
                            onClick={() => chrome.tabs.create({ url: browserUtils.runtime.getURL('options.html') })}
                            tile="Open configuration sidebar"
                        >
                            <i className="fas fa-cog" />
                        </div>
                    </div>

                </div>

                {this.state.isConfigLoaded && children &&
                    <div className="dial-container" style={dialsStyle}>

                        <SpeedDialWithDragging
                            key={this.state.currFolderId}
                            folderId={this.state.currFolderId}
                            bookmarks={children}
                            data={metaData}
                            local={localData}
                            columnCount={this.state.dialColumns}
                            onOpen={this.onOpen}
                            onItemMoved={this.onItemMoved}
                            onEdit={this.onEdit}
                            onDialUpdate={this.onDialUpdate}
                            moveBookmark={this.moveBookmark}
                        />

                    </div>
                }
            </div>
        );
    }
}

SpeedDial.propTypes = {
    bookmarkTreeId: PropTypes.string.isRequired,
};

export default SpeedDial;
