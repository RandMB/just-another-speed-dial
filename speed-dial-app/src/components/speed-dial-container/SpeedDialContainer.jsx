import React, { Component } from 'react';
import SpeedDialViewPlane from './components/speed-dial-view-plane/SpeedDialViewPlane';
import PropTypes from 'prop-types';
import './SpeedDialContainer.css';

import _debounce from 'lodash/debounce';
import _cloneDeep from 'lodash/merge';

const DIAL_HEIGHT = 239;
const DIAL_WIDTH = 250;
const WIDTH_TO_LEAVE = 100;

class SpeedDialContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentBookmarkFolderId: props.bookmarkTreeId,
            previousBookmarkFolderId: null,
            currentFolderNodes: null,

            dialColumns: this.computeColumns(),
        };

        // Dispatch the request immediately, but don't call setState() in constructor,
        //   even if it completes immediately
        this.childrenPromise = browser.bookmarks.getChildren(props.bookmarkTreeId);

        this.openFolder = this.openFolder.bind(this);
        this.goBack = this.goBack.bind(this);
        this.onResize = this.onResize.bind(this);

        window.addEventListener('resize',
            _debounce(this.onResize, 200, { trailing: true }));
    }

    computeColumns() {
        const effectiveWidth = window.innerWidth - WIDTH_TO_LEAVE;
        // Minimum one tile
        return Math.max(Math.floor(effectiveWidth / DIAL_WIDTH), 1);
    }

    computeRows(tileCount, columnCount) {
        return Math.ceil(tileCount / columnCount);
    }

    componentWillMount() {
        this.childrenPromise.then((children) => {
            this.setState({
                currentFolderNodes: this.transformChildren(children),
            });
        });
    }

    onResize() {
        const columns = this.computeColumns();

        if (columns !== this.state.dialColumns) {
            const newChildren = _cloneDeep(this.state.currentFolderNodes);

            // Iterate while skipping first columns, as they are unaffected
            for (let i = 0; i < newChildren.length; i++) {
                newChildren[i].data.view = {
                    dialPosX: this.computeDialXPos(i, columns),
                    dialPosY: this.computeDialYPos(i, columns),
                };
            }

            this.setState({
                currentFolderNodes: newChildren,
                dialColumns: columns,
            });
        }
    }

    computeDialXPos(index, columnCount) {
        return DIAL_WIDTH * (index % columnCount);
    }

    computeDialYPos(index, columnCount) {
        return DIAL_HEIGHT * Math.floor(index / columnCount);
    }

    transformChildren(children) {
        return children.filter((child) => {
            if (child.type === 'bookmark') {
                return !(child.url.startsWith('place:') || child.url.startsWith('about:'));
            }

            return child.type === 'folder';
        }).map((child, index) => {
            return {
                treeNode: child,
                data: {
                    view: {
                        dialPosX: this.computeDialXPos(index, this.state.dialColumns),
                        dialPosY: this.computeDialYPos(index, this.state.dialColumns),
                    },
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
            <div className="speed-dials">
                <div className="dial-container-top config-close">
                    {!isRoot &&
                        <button type="button" onClick={this.goBack}> &lt;&lt; Back</button>
                    }
                </div>

                <div className="dial-container config-close">
                    {children &&
                        <SpeedDialViewPlane
                            bookmarks={children}
                            onOpenFolder={this.openFolder}
                            width={(DIAL_WIDTH * this.state.dialColumns) - 30}
                            height={DIAL_HEIGHT * this.computeRows(children.length, this.state.dialColumns)}
                        >
                        </SpeedDialViewPlane>
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