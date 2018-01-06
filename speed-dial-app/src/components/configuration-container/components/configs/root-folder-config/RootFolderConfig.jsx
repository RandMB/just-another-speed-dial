import React, { Component } from 'react';
import PropTypes from 'prop-types';


import './RootFolderConfig.css';

class RootFolderConfig extends Component {
    constructor(props) {
        super(props);

        this.state = {
            folderId: props.currentConfig.rootId,
            folderName: null,
        };

        this.onResetFolder = this.onResetFolder.bind(this);
        this.folderDataPromise = this.getFolderData(props.currentConfig.rootId);
    }

    getFolderData(folderId) {
        // Passing null throws, return a rejecting promise
        if (folderId !== null) {
            return browser.bookmarks.get(folderId);
        } else {
            return Promise.reject();
        }
    }

    componentWillMount() {
        this.folderDataPromise.then((folderData) => {
            this.setState({
                folderName: folderData[0].title,
            });
        }).catch(
            // Folder id doesn't exist, do not do anything, defaults are already in place
            );
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.folderId !== nextProps.currentConfig.rootId) {
            this.getFolderData(nextProps.currentConfig.rootId)
                .then((folderData) => {
                    this.setState({
                        folderId: nextProps.currentConfig.rootId,
                        folderName: folderData[0].title,
                    });
                }).catch(() => {
                    this.setState({
                        folderId: nextProps.currentConfig.rootId,
                        folderName: null,
                    });
                });
        }
    }

    onResetFolder() {
        const newConfig = {
            rootId: null,
        };

        this.props.onConfigChange(newConfig);
    }

    render() {
        return (
            <React.Fragment>
                <h3>Bookmark folder</h3>
                <p>Here you can reset your root bookmark folder, so you could pick one again</p>
                <p>Current folder: {this.state.folderName}</p>
                <button type="button" onClick={this.onResetFolder}>Reset folder</button>
            </React.Fragment>

        );
    }
}

RootFolderConfig.propTypes = {
    onConfigChange: PropTypes.func.isRequired,
    currentConfig: PropTypes.object.isRequired,
};


export default RootFolderConfig;