import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';

import DraggableTileContainer from '../draggable-tile-container/DraggableTileContainer';
import TileEditModal from '../common/tile-edit-modal/TileEditModal';

import _cloneDeep from 'lodash/cloneDeep';

import './DialFolder.css';

function onError(error) {
    console.error(`Error: ${error}`);
}

class DialFolder extends Component {
    constructor(props) {
        super(props);

        this.state = {
            folderData: {},
            isConfigLoaded: false,

            configuredTile: null,
        };

        this.configPromise = browser.storage.local.get(`folder${props.folderId}`);
        this.scriptPort = browser.runtime.connect();

        this.scriptPort.onMessage.addListener(({ id, ...rest }) => {
            this.setState((prevState) => {
                const newFolder = _cloneDeep(prevState.folderData);

                newFolder[id] = rest;

                browser.storage.local.set({ [`folder${props.folderId}`]: newFolder }).then(null, onError);

                return {
                    folderData: newFolder,
                };
            });
        });

        this.onDialUpdate = this.onDialUpdate.bind(this);
        this.onEditModalClose = this.onEditModalClose.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onEdit = this.onEdit.bind(this);
    }

    componentWillMount() {
        this.configPromise.then((data) => {
            const folderData = data[`folder${this.props.folderId}`];

            this.setState({
                folderData: folderData ? folderData : {},
                isConfigLoaded: true,
            });
        });
    }

    onDialUpdate(id, url) {
        this.scriptPort.postMessage({
            id: id,
            url: url,
        });
    }

    onClick(index) {
        const node = this.props.bookmarks[index].treeNode;

        if (node.type === 'folder') {
            this.props.onOpenFolder(node.id);
        } else if (node.type === 'bookmark') {
            window.location.href = node.url;
        }
    }

    onEdit(index, id) {
        // Do not allow simultaneous editing of multiple tiles
        if (!this.state.configuredTile || !this.testCurrentEditTileExists()) {

            this.setState({
                configuredTile: {
                    index,
                    id,
                },
            });
        }
    }

    testCurrentEditTileExists() {
        const tile = this.props.bookmarks[this.state.configuredTile.index];
        return tile && tile.treeNode.id === this.state.configuredTile.id;
    }

    onEditModalClose() {
        this.setState({
            configuredTile: null,
        });
    }

    render() {
        const bookmarkTree = this.props.bookmarks;
        const configuredTile = this.state.configuredTile;
        const dialsStyle = {
            width: this.props.width,
            height: this.props.height,
        };

        return (
            <div
                id="speed-dial"
                className="speed-dial-view-plane config-close"
                style={dialsStyle}>

                {
                    this.state.isConfigLoaded && bookmarkTree.map(({ treeNode, view }, index) => {
                        const dialData = {
                            node: treeNode,
                            view: view,
                            dialMeta: this.state.folderData[treeNode.id],
                            onUpdate: this.onDialUpdate,
                            onEdit: this.onEdit,
                        };

                        return (
                            <DraggableTileContainer
                                xPos={view.dialPosX}
                                yPos={view.dialPosY}
                                id={index}
                                onDrag={this.props.onDialDrag}
                                onDragEnd={this.props.onDragEnd}

                                onClick={this.onClick}

                                key={'' + treeNode.id}
                                data={dialData}>

                            </DraggableTileContainer>


                        );
                    })
                }

                {configuredTile && this.testCurrentEditTileExists() &&
                    <Portal node={document && document.getElementById('modals')}>
                        <TileEditModal onClose={this.onEditModalClose}>
                        </TileEditModal>
                    </Portal>
                }
            </div>
        );
    }
}

DialFolder.propTypes = {
    bookmarks: PropTypes.array.isRequired,
    onOpenFolder: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onDialDrag: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func,
    folderId: PropTypes.string.isRequired,
};

export default DialFolder;