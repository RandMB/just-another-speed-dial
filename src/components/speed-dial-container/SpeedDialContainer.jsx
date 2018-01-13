import React, { Component } from 'react';
import { List } from 'immutable';
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

function updateChild(child, index, columnCount, itemCount) {
    return {
        treeNode: Object.assign({}, child.treeNode),
        view: Object.assign(
            {},
            child.view,
            {
                zIndex: itemCount - index,
                index,
                dialPosX: dialUtils.computeDialXPos(index, columnCount, DIAL_WIDTH),
                dialPosY: dialUtils.computeDialYPos(index, columnCount, DIAL_HEIGHT),
            },
        ),
    };
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
        this.onItemMoved = this.onItemMoved.bind(this);

        window.addEventListener(
            'resize',
            _debounce(this.onResize, 200, { trailing: true }),
        );
    }

    async componentWillMount() {
        this.updateList();

        browserUtils.bookmarks.onMoved((id, moveInfo) => {
            if (moveInfo.parentId === this.state.currFolderId ||
                moveInfo.oldParentId === this.state.currFolderId) {

                this.updateList();
            }
        });

        browserUtils.bookmarks.onCreated((id, bookmarkInfo) => {
            if (bookmarkInfo.parentId === this.state.currFolderId) {
                this.updateList();
            }
        });

        browserUtils.bookmarks.onRemoved((id, removedInfo) => {
            if (removedInfo.parentId === this.state.currFolderId) {
                this.updateList();
            }
        });

        browserUtils.bookmarks.onChanged((id, changeInfo) => {
            // Attempt to find the bookmark in the collection
            const index = this.state.children.findIndex(bookmark =>
                bookmark.treeNode.id === id);

            if (index !== -1) {
                const { treeNode, view } = this.state.children.get(index);
                const newObject = {
                    treeNode: Object.assign({}, treeNode, changeInfo),
                    view: {
                        ...view,
                    },
                };

                const newChildren = this.state.children.set(index, newObject);

                this.setState({
                    children: newChildren,
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

    async updateList() {
        const children =
            await browserUtils.bookmarks.getFolderChildren(this.state.currFolderId);

        this.setState({
            children: List(this.transformChildren(children)),
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

        this.setState(() => ({
            children: List(this.transformChildren(children)),
            currFolderId: folderId,
            prevFolderId: folder[0].parentId,
        }));
    }

    async openFolder(folderId) {
        const children =
            await browserUtils.bookmarks.getFolderChildren(folderId);

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
