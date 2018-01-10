import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DialFolder from './components/dial-folder/DialFolder';
import DialUtils from '../../utils/dialUtlis';

import './SpeedDialContainer.css';

import _debounce from 'lodash/debounce';
import _cloneDeep from 'lodash/cloneDeep';

console.log(DialUtils);

const DIAL_HEIGHT = 239;
const DIAL_WIDTH = 250;
const BETWEEN_DIALS = 30;
const WIDTH_TO_LEAVE = 60;

function onError(error) {
    console.error(`Error: ${error}`);
}

class SpeedDialContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentBookmarkFolderId: props.bookmarkTreeId,
            previousBookmarkFolderId: null,
            currentFolderNodes: null,

            dialColumns: DialUtils.computeColumns(DIAL_WIDTH, WIDTH_TO_LEAVE),
        };

        // Dispatch the request immediately, but don't call setState() in constructor,
        //   even if it completes immediately
        this.childrenPromise = browser.bookmarks.getChildren(props.bookmarkTreeId);

        this.openFolder = this.openFolder.bind(this);
        this.goBack = this.goBack.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onDrag = this.onDrag.bind(this);

        window.addEventListener('resize',
            _debounce(this.onResize, 200, { trailing: true }));
    }

    componentWillMount() {
        this.childrenPromise.then((children) => {
            this.setState({
                currentFolderNodes: this.transformChildren(children),
            });
        });
    }

    onResize(event) {
        const columns = DialUtils.computeColumns(DIAL_WIDTH, WIDTH_TO_LEAVE);

        if (columns !== this.state.dialColumns) {
            const newChildren = _cloneDeep(this.state.currentFolderNodes);

            this.updateChildren(newChildren, columns);
        }
    }

    updateChildren(children, columnCount) {
        children.forEach((child, index) => {
            child.view = Object.assign(child.view, {
                zIndex: children.length - index,
                index: index,
                dialPosX: DialUtils.computeDialXPos(index, columnCount, DIAL_WIDTH),
                dialPosY: DialUtils.computeDialYPos(index, columnCount, DIAL_HEIGHT),
            });
        });

        this.setState({
            currentFolderNodes: children,
            dialColumns: columnCount,
        });
    }

    onDrag(dragData) {
        const normalizedPositions = {
            x: DialUtils.nomalizePosX(dragData.dragPosX, this.state.dialColumns, DIAL_WIDTH, BETWEEN_DIALS),
            y: DialUtils.nomalizePosY(dragData.dragPosY, this.state.currentFolderNodes.length, this.state.dialColumns, DIAL_HEIGHT),
        };

        const newIndex = DialUtils.computeDialIndex(normalizedPositions,
            this.state.dialColumns, this.state.currentFolderNodes.length, DIAL_WIDTH, DIAL_HEIGHT);

        if (newIndex !== dragData.index) {
            const newChildren = _cloneDeep(this.state.currentFolderNodes);

            const [removed] = newChildren.splice(dragData.index, 1);
            newChildren.splice(newIndex, 0, removed);

            browser.bookmarks.move(removed.treeNode.id, {
                // +1 because for mozilla arrays start at 1
                index: newIndex + 1,
            }).then(null, onError);

            this.updateChildren(newChildren, this.state.dialColumns);
        }
    }

    transformChildren(children) {
        const filteredChildren = children.filter((child) => {
            if (child.type === 'bookmark') {
                return !(child.url.startsWith('place:') || child.url.startsWith('about:'));
            }

            return child.type === 'folder';
        });

        return filteredChildren.map((child, index) => {
            return {
                treeNode: child,
                view: {
                    index: index,
                    zIndex: filteredChildren.length - index,
                    dialPosX: DialUtils.computeDialXPos(index, this.state.dialColumns, DIAL_WIDTH),
                    dialPosY: DialUtils.computeDialYPos(index, this.state.dialColumns, DIAL_HEIGHT),
                },
            };
        });
    }

    openFolder(folderId) {
        const childrenNodes = browser.bookmarks.getChildren(folderId);

        childrenNodes.then((children) => {
            const newChildren = this.transformChildren(children);
            this.setState((prevState, props) => {
                return {
                    currentFolderNodes: newChildren,
                    currentBookmarkFolderId: folderId,
                    previousBookmarkFolderId: prevState.currentBookmarkFolderId
                };
            });
        });
    }

    goBack() {
        if (this.state.currentBookmarkFolderId === this.props.bookmarkTreeId) {
            console.warn('Attempting to go back beyond the root folder');
            return;
        }

        const folderId = this.state.previousBookmarkFolderId;

        const childrenNodes = browser.bookmarks.getChildren(folderId);
        const folderNode = browser.bookmarks.get(folderId);

        Promise.all([childrenNodes, folderNode])
            .then(([children, folder]) => {
                this.setState((prevState, props) => ({
                    currentFolderNodes: this.transformChildren(children),
                    currentBookmarkFolderId: folderId,
                    previousBookmarkFolderId: folder[0].parentId,
                }));
            });
    }

    render() {
        const children = this.state.currentFolderNodes;
        const isRoot = this.state.currentBookmarkFolderId === this.props.bookmarkTreeId;

        return (
            <div className="speed-dials config-close" onDragOver={(event) => event.preventDefault()}>
                <div className="dial-container-top config-close">
                    {!isRoot &&
                        <button type="button" onClick={this.goBack}> &lt;&lt; Back</button>
                    }
                </div>

                <div className="dial-container config-close">
                    {children &&
                        <DialFolder
                            key={this.state.currentBookmarkFolderId}
                            folderId={this.state.currentBookmarkFolderId}
                            bookmarks={children}
                            onOpenFolder={this.openFolder}
                            onDialDrag={this.onDrag}
                            width={DialUtils.computeDialsWidth(this.state.dialColumns, DIAL_WIDTH, BETWEEN_DIALS)}
                            height={DialUtils.computeDialsHeight(children.length, this.state.dialColumns, DIAL_HEIGHT)}
                        >
                        </DialFolder>
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