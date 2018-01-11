import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SpeedDialContainer from '../speed-dial-container/SpeedDialContainer';
import FolderPickerContainer from '../folder-picker-container/FolderPickerContainer';

import _isEmpty from 'lodash/isEmpty';

import './App.css';
import backgroundImageUrl from '../../assets/background-default.jpg';

function Container(props) {
    if (props.rootBookmarkTreeId) {
        return <SpeedDialContainer bookmarkTreeId={props.rootBookmarkTreeId}></SpeedDialContainer>;
    }
    else {
        return <FolderPickerContainer onSelect={props.onFolderSelect}></FolderPickerContainer>;
    }
}

Container.propTypes = {
    rootBookmarkTreeId: PropTypes.string,
    onFolderSelect: PropTypes.func.isRequired,
};

function onError(error) {
    console.error(`Error: ${error}`);
}

class App extends Component {
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

        this.configPromise = browser.storage.local.get('config');
    }

    componentWillMount() {
        this.configPromise.then((config) => {
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
        }, onError);
    }

    onFolderSelect(folderId) {
        const newConfig = {
            rootId: folderId,
        };

        const setConfigPromise = browser.storage.local.set({ config: newConfig });
        // Just force execution
        setConfigPromise.then(null, onError);

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
                        rootBookmarkTreeId={rootBookmarkTreeId}>
                    </Container>
                }

                <div
                    className="config-open-button"
                    onClick={(event) => browser.runtime.openOptionsPage().then()}
                    tile="Open configuration sidebar">

                    <i className="fas fa-cog"></i>
                </div>

            </React.Fragment>
        );
    }
}

export default App;
