import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _isEmpty from 'lodash/isEmpty';

import SpeedDialContainer from '../speed-dial-container/SpeedDialContainer';
import FolderPickerContainer from '../folder-picker-container/FolderPickerContainer';

import browserUtils from '../../utils/browser';

import './DialApp.css';
import backgroundImageUrl from '../../assets/background-default.jpg';

function Container(props) {
    if (props.rootBookmarkTreeId) {
        return (
            <SpeedDialContainer
                bookmarkTreeId={props.rootBookmarkTreeId}
                browserUtils={props.browserUtils}
            />
        );
    } else {
        return (
            <FolderPickerContainer
                onSelect={props.onFolderSelect}
                browserUtils={props.browserUtils}
            />
        );
    }
}

Container.propTypes = {
    rootBookmarkTreeId: PropTypes.string,
    onFolderSelect: PropTypes.func.isRequired,
    browserUtils: PropTypes.object.isRequired,
};

class DialApp extends Component {
    constructor(props) {
        super(props);

        // Initialize state
        this.state = {
            config: {
                rootId: null,
            },

            isLoaded: false,
        };

        this.onFolderSelect = this.onFolderSelect.bind(this);
    }

    async componentWillMount() {
        const config = await browserUtils.localStorage.get('config');

        let newConfig = {
            rootId: null,
        };

        if (!_isEmpty(config)) {
            newConfig = config.config;
        }

        this.setState({
            config: newConfig,
            isLoaded: true,
        });
    }

    async onFolderSelect(folderId) {
        const newConfig = {
            rootId: folderId,
        };

        await browserUtils.localStorage.set({ config: newConfig });

        this.setState({
            config: newConfig,
        });
    }

    render() {
        // Styling for page body
        document.body.style = `background-image: url('${backgroundImageUrl}'); background-size: cover;`;

        const rootBookmarkTreeId = this.state.config.rootId;

        return (
            <React.Fragment>
                {this.state.isLoaded &&
                    <Container
                        key={rootBookmarkTreeId}
                        onFolderSelect={this.onFolderSelect}
                        rootBookmarkTreeId={rootBookmarkTreeId}
                    />
                }

                <div
                    className="config-open-button"
                    onClick={() => browser.runtime.openOptionsPage().then()}
                    tile="Open configuration sidebar"
                >

                    <i className="fas fa-cog" />
                </div>

            </React.Fragment>
        );
    }
}

export default DialApp;
