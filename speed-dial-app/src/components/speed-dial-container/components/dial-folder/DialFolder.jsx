import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DraggableTileContainer from '../draggable-tile-container/DraggableTileContainer';

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
        this.onClick = this.onClick.bind(this);
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
        console.log(this.props.bookmarks[index]);
        if (this.props.bookmarks[index].treeNode.type === 'folder') {
            this.props.onOpenFolder(this.props.bookmarks[index].treeNode.id);
        } else if (this.props.bookmarks[index].treeNode.type === 'bookmark') {
            window.location.href = this.props.bookmarks[index].treeNode.url;
        }
    }

    render() {
        const bookmarkTree = this.props.bookmarks;
        const dialsStyle = {
            width: this.props.width,
            height: this.props.height,
        };

        return (
            <div
                id="speed-dial"
                className="speed-dial-view-plane config-close"
                style={dialsStyle}>

                {this.state.isConfigLoaded && bookmarkTree.map(({ treeNode, view }, index) => {
                    const dialData = {
                        node: treeNode,
                        view: view,
                        dialMeta: this.state.folderData[treeNode.id],
                        onUpdate: this.onDialUpdate,
                    };

                    return (
                        <DraggableTileContainer
                            xPos={view.dialPosX}
                            yPos={view.dialPosY}
                            id={index}
                            onDrag={this.props.onDialDrag}
                            onClick={this.onClick}

                            key={'' + treeNode.id}
                            data={dialData}>

                        </DraggableTileContainer>
                    );
                })
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
    folderId: PropTypes.string.isRequired,
};

export default DialFolder;