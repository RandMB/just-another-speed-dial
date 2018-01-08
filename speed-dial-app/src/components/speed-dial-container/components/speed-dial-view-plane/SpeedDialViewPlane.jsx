import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SpeedDialItem from '../speed-dial-item/SpeedDialItem';

import _cloneDeep from 'lodash/cloneDeep';

import './SpeedDialViewPlane.css';

function onError(error) {
    console.error(`Error: ${error}`);
}

class SpeedDialViewPlane extends Component {
    constructor(props) {
        super(props);

        this.state = {
            folderData: {},
            isConfigLoaded: false,
        };

        this.configPromise = browser.storage.local.get(`folder${props.folderId}`);
        this.scriptPort = browser.runtime.connect();

        this.scriptPort.onMessage.addListener(({id, ...rest}) => {
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

                {this.state.isConfigLoaded && bookmarkTree.map(({ id, treeNode, data }, index) =>
                    <SpeedDialItem
                        onOpenFolder={this.props.onOpenFolder}
                        key={'' + id}
                        node={treeNode}
                        data={data}
                        dialMeta={this.state.folderData[id]}
                        onUpdate={this.onDialUpdate}
                        onDrag={this.props.onDialDrag}
                    />)
                }
            </div>
        );
    }
}

SpeedDialViewPlane.propTypes = {
    bookmarks: PropTypes.array.isRequired,
    onOpenFolder: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onDialDrag: PropTypes.func.isRequired,
    folderId: PropTypes.string.isRequired,
};

export default SpeedDialViewPlane;