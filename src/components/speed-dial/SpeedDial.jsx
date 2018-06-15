import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _debounce from 'lodash/debounce';
import _throttle from 'lodash/throttle';

import SpeedDialWithDragging from '../speed-dial-with-dragging/SpeedDialWithDragging';
import dialUtils from '../../utils/dials';
import utils from '../../utils/browser';

import './SpeedDial.css';

function updateChild(child, index, columnCount, itemCount, dialWidth, dialHeight) {
    Object.assign(
        child.view,
        {
            zIndex: itemCount - index,
            index,
            dialPosX: dialUtils.computeDialXPos(index, columnCount, dialWidth),
            dialPosY: dialUtils.computeDialYPos(index, columnCount, dialHeight),
        },
    );
}

function updateChildrenPartial(children, columnCount, start, end, dialWidth, dialHeight) {
    for (let index = start; index <= end; index++) {
        updateChild(children[index], index, columnCount, children.length, dialWidth, dialHeight);
    }

    return children;
}

class SpeedDial extends Component {
    constructor(props) {
        super(props);

        const columns = dialUtils.computeColumns(
            props.config.dialWidth,
            props.config.hSpace,
            props.config.edgeWidth,
        );

        this.state = {
            currFolderId: props.config.rootId,
            prevFolderId: null,
            children: null,

            // Data associated with dials, which is synced
            metaData: {},
            // Data associated with dials, which isn't synced (cache)
            localData: {},

            isConfigLoaded: false,

            dialColumns: columns,
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
        utils.bookmarks.onMoved.addListener(this.onBookmarkMoved);
        utils.bookmarks.onCreated.addListener(this.onBookmarkCreated);
        utils.bookmarks.onRemoved.addListener(this.onBookmarkRemoved);
        utils.bookmarks.onChanged.addListener(this.onBookmarkChanged);

        const childrenPromise =
            utils.bookmarks.getFolderChildren(this.state.currFolderId);
        const dataMetaPromise = utils.storage.local.get('metaData');
        const dataLocalPromise = utils.storage.local.get('localData');

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

    componentDidUpdate(oldProps) {
        const newConfig = this.props.config;
        const oldConfig = oldProps.config;

        if (newConfig.dialWidth !== oldConfig.dialWidth ||
            newConfig.dialHeight !== oldConfig.dialHeight) {
            this.onResize(null, true);
        }
    }

    componentWillUnmount() {
        utils.bookmarks.onMoved.removeListener(this.onBookmarkMoved);
        utils.bookmarks.onCreated.removeListener(this.onBookmarkCreated);
        utils.bookmarks.onRemoved.removeListener(this.onBookmarkRemoved);
        utils.bookmarks.onChanged.removeListener(this.onBookmarkChanged);
    }

    async onBookmarkChanged(id) {
        const bookmark = await utils.bookmarks.get(id);

        if (bookmark[0].parentId === this.state.currFolderId) {
            const children =
                await utils.bookmarks.getFolderChildren(this.state.currFolderId);

            this.updateList(children);
        }
    }

    async onBookmarkRemoved(id, removedInfo) {
        if (removedInfo.parentId === this.state.currFolderId) {
            const children =
                await utils.bookmarks.getFolderChildren(this.state.currFolderId);

            this.updateList(children);
        }
    }

    async onBookmarkCreated(id, bookmark) {
        if (bookmark.parentId === this.state.currFolderId) {
            const children =
                await utils.bookmarks.getFolderChildren(this.state.currFolderId);

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
                await utils.bookmarks.getFolderChildren(this.state.currFolderId);

            this.updateList(children);
        }
    }

    onResize(event, force = false) {
        const columns = dialUtils.computeColumns(
            this.props.config.dialWidth,
            this.props.config.hSpace,
            this.props.config.edgeWidth,
        );

        if (columns !== this.state.dialColumns || force) {
            this.setState(({ children }) => {
                const newChildren = this.updateChildren(
                    children,
                    columns,
                );

                return {
                    children: newChildren,
                    dialColumns: columns,
                };
            });
        }
    }

    onItemMoved(oldIndex, newIndex) {
        this.setState(({ children }) => {
            const removed = children[oldIndex];
            children.splice(oldIndex, 1);
            children.splice(newIndex, 0, removed);

            const updatedChildren = this.updateChildren(
                children,
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
        const node = this.state.children[index].treeNode;

        if (node.type === 'folder') {
            this.openFolder(node.id);
        } else if (node.type === 'bookmark') {
            window.location.href = node.url;
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
        return dialUtils.computeDialsWidth(
            this.state.dialColumns,
            this.props.config.dialWidth + this.props.config.hSpace,
            this.props.config.hSpace,
        );
    }

    getDialHeight() {
        const count = this.state.children ? this.state.children.length : 0;

        return dialUtils.computeDialsHeight(
            count,
            this.state.dialColumns,
            this.props.config.dialHeight + this.props.config.vSpace,
        );
    }

    updateChildren(children, columns, start = 0, end) {
        const endIndex = end || children.length - 1;

        return updateChildrenPartial(
            children,
            columns,
            start,
            endIndex,
            this.props.config.dialWidth + this.props.config.hSpace,
            this.props.config.dialHeight + this.props.config.vSpace,
        );
    }

    moveBookmark(oldIndex, newIndex, indexToMove) {
        const id = this.state.children[newIndex].treeNode.id;
        this.scheduledUpdate.push(id);

        utils.bookmarks.move(
            id,
            { index: indexToMove },
        );

        this.state.children[newIndex].treeNode.index = indexToMove;

        if (newIndex > oldIndex) {
            // The bookmark was moved forward
            // Decrement items indexes form oldIndex to index - 1, inclusive
            // The start is at zero as because we don't really know where to start from
            //   as filtered elements make gaps in our indexes
            for (let i = oldIndex; i < newIndex; i++) {
                this.state.children[i].treeNode.index -= 1;
            }
        } else if (newIndex < oldIndex) {
            // The bookmark was moved backwards
            // Increment items indexes form newIndex + 1 to oldIndex, inclusive
            // Start from the next one ahead of changed one
            for (let i = newIndex + 1; i <= oldIndex; i++) {
                this.state.children[i].treeNode.index += 1;
            }
        }

        this.forceUpdate();
    }

    async saveChanges() {
        const metaData = this.state.metaData;
        const localData = this.state.localData;

        await utils.storage.local.set({ metaData, localData });
    }

    updateList(children, additionalState) {
        // We need a different structure than just an plain array
        const newChildren = children.map(child => {
            return {
                treeNode: child,
                view: {},
            };
        });

        const updatedChildren = this.updateChildren(
            newChildren,
            this.state.dialColumns,
        );

        this.setState({
            children: updatedChildren,
            ...additionalState,
        });
    }

    async goBack() {
        if (this.state.currFolderId === this.props.config.rootId) {
            console.warn('Attempting to go back beyond the root folder');
            return;
        }

        const folderId = this.state.prevFolderId;

        const childrenNodes = utils.bookmarks.getFolderChildren(folderId);
        const folderNode = utils.bookmarks.get(folderId);

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
            await utils.bookmarks.getFolderChildren(folderId);

        const prevFolder = this.state.currFolderId;

        // Reset
        this.scheduledUpdate = [];

        this.updateList(children, {
            currFolderId: folderId,
            prevFolderId: prevFolder,
        });
    }

    render() {
        const { config } = this.props;
        const { metaData, localData, children, dialColumns } = this.state;
        const isRoot = this.state.currFolderId === this.props.config.rootId;

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
                            onClick={() => chrome.tabs.create({ url: utils.runtime.getURL('options.html') })}
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
                            bookmarks={children}
                            data={metaData}
                            local={localData}
                            config={config}
                            columnCount={dialColumns}

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
    config: PropTypes.object.isRequired,
};

export default SpeedDial;
