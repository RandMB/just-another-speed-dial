import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _cloneDeep from 'lodash/cloneDeep';
import _throttle from 'lodash/throttle';

import DraggableTileContainer from '../draggable-tile-container/DraggableTileContainer';
import browserUtils from '../../utils/browser';

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

        this.configPromise = browserUtils.localStorage.get('metaData');

        this.onDialUpdate = this.onDialUpdate.bind(this);
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
        const colorData = await browserUtils.getColor();
        const newFolder = this.pendingSave || _cloneDeep(this.state.folderData);

        newFolder[id] = colorData;
        this.pendingSave = newFolder;

        this.throttledSave(this.props.folderId, newFolder);
    }

    saveChanges(folderId, newFolder) {
        this.setState({
            folderData: newFolder,
        });

        browserUtils.localStorage.set({ metaData: newFolder }).then(null, onError);
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
                className="speed-dial-view-plane"
                style={dialsStyle}
            >

                {
                    this.state.isConfigLoaded && bookmarkTree.map((child, index) => {
                        const dialData = {
                            node: child.get('treeNode'),
                            view: child.get('view'),
                            dialMeta: this.state.folderData[child.getIn(['treeNode', 'id'])],
                            onUpdate: this.onDialUpdate,
                            onEdit: this.props.onEdit,
                        };

                        return (
                            <DraggableTileContainer
                                xPos={child.getIn(['view', 'dialPosX'])}
                                yPos={child.getIn(['view', 'dialPosY'])}
                                id={index}
                                onDrag={this.props.onDialDrag}
                                onDragEnd={this.props.onDragEnd}
                                onClick={this.props.onOpen}
                                key={'' + child.getIn(['treeNode', 'id'])}
                                data={dialData}
                            />

                        );
                    })
                }
            </div>
        );
    }
}

DialFolder.propTypes = {
    bookmarks: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onDialDrag: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func,
    folderId: PropTypes.string.isRequired,
    onOpen: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default DialFolder;
