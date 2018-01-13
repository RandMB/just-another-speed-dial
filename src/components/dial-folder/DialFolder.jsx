import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import _cloneDeep from 'lodash/cloneDeep';
import _throttle from 'lodash/throttle';

import DraggableTileContainer from '../draggable-tile-container/DraggableTileContainer';
import TileEditModal from '../common/tile-edit-modal/TileEditModal';

import './DialFolder.css';

function onError(error) {
    console.error(`Error: ${error}`);
}

class DialFolder extends Component {
    constructor(props) {
        super(props);
        this.browserUtils = props.browserUtils;

        this.state = {
            folderData: {},
            isConfigLoaded: false,

            configuredTile: null,
        };

        this.configPromise = this.browserUtils.localStorage.get('metaData');

        this.onDialUpdate = this.onDialUpdate.bind(this);
        this.onEditModalClose = this.onEditModalClose.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.saveChanges = this.saveChanges.bind(this);

        this.throttledSave = _throttle(this.saveChanges, 500);
        this.pendingSave = null;
    }

    componentWillMount() {
        this.configPromise.then((data) => {
            const folderData = data['metaData'];

            this.setState({
                folderData: folderData || {},
                isConfigLoaded: true,
            });
        });
    }

    async onDialUpdate(id) {
        const colorData = await this.browserUtils.getColor();
        const newFolder = this.pendingSave || _cloneDeep(this.state.folderData);

        newFolder[id] = colorData;
        this.pendingSave = newFolder;

        this.throttledSave(this.props.folderId, newFolder);
    }

    onClick(index) {
        const node = this.props.bookmarks.get(index).treeNode;

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

    onEditModalClose() {
        this.setState({
            configuredTile: null,
        });
    }

    saveChanges(folderId, newFolder) {
        this.setState({
            folderData: newFolder,
        });

        this.browserUtils.localStorage.set({ metaData: newFolder }).then(null, onError);
    }

    testCurrentEditTileExists() {
        const tile = this.props.bookmarks[this.state.configuredTile.index];
        return tile && tile.treeNode.id === this.state.configuredTile.id;
    }

    render() {
        const bookmarkTree = this.props.bookmarks;
        const configuredTile = !!this.state.configuredTile;
        const dialsStyle = {
            width: this.props.width,
            height: this.props.height,
        };

        return (
            <div
                id="speed-dial"
                className="speed-dial-view-plane config-close"
                style={dialsStyle}
            >

                {
                    this.state.isConfigLoaded && bookmarkTree.map(({ treeNode, view }, index) => {
                        const dialData = {
                            node: treeNode,
                            view,
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
                                data={dialData}
                            />

                        );
                    })
                }

                {configuredTile && this.testCurrentEditTileExists() &&
                    <Portal node={document && document.getElementById('modals')}>
                        <TileEditModal onClose={this.onEditModalClose} />
                    </Portal>
                }
            </div>
        );
    }
}

DialFolder.propTypes = {
    bookmarks: PropTypes.object.isRequired,
    onOpenFolder: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onDialDrag: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func,
    folderId: PropTypes.string.isRequired,
    browserUtils: PropTypes.object.isRequired,
};

export default DialFolder;
