import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SpeedDialContainer from '../speed-dial-container/SpeedDialContainer';
import FolderPickerContainer from '../folder-picker-container/FolderPickerContainer';
import ConfigurationContainer from '../configuration-container/ConfigurationContainer';

import _isEmpty from 'lodash/isEmpty';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/merge';

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
            isConfigLoaded: true,
            isConfigOpen: false,
        };

        this.onFolderSelect = this.onFolderSelect.bind(this);
        this.onConfigChange = this.onConfigChange.bind(this);

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

        document.getElementById('root').addEventListener('click', (event) => {
            if (event.target.matches('.config-close') && this.state.isConfigOpen) {
                this.setState({
                    isConfigOpen: false,
                });
            }
        }, false);
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

    onConfigChange(newPartialConfig) {
        const newConfig = _cloneDeep(this.state.config);
        _merge(newConfig, newPartialConfig);

        this.setState({
            config: newConfig,
        });

        browser.storage.local.set({ config: newConfig }).then(null, onError);
    }

    setConfigSidebarOpen(isOpen, event) {
        if (event) {
            event.stopPropagation();
        }

        this.setState({
            isConfigOpen: isOpen,
            isConfigLoaded: true,
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

                {this.state.isConfigLoaded &&
                    <ConfigurationContainer
                        onClose={() => this.setConfigSidebarOpen(false)}
                        isOpen={this.state.isConfigOpen}
                        onConfigChange={this.onConfigChange}
                        currentConfig={this.state.config}>
                    </ConfigurationContainer>
                }

                <div
                    className="config-open-button"
                    onClickCapture={(event) => this.setConfigSidebarOpen(true, event)}
                    tile="Open configuration sidebar">

                    <i className="fas fa-cog"></i>
                </div>

            </React.Fragment>
        );
    }
}

export default App;
