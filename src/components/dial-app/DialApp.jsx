import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SpeedDial from '../speed-dial/SpeedDial';
import FolderPickerContainer from '../folder-picker-container/FolderPickerContainer';

import utils from '../../utils/browser';

import './DialApp.css';
import backgroundImageUrl from '../../assets/background-default.jpg';

function Container(props) {
    if (props.config.rootId) {
        return (
            <SpeedDial
                config={props.config}
            />
        );
    } else {
        return (
            <FolderPickerContainer
                onSelect={props.onFolderSelect}
            />
        );
    }
}

Container.propTypes = {
    config: PropTypes.object.isRequired,
    onFolderSelect: PropTypes.func.isRequired,
};

class DialApp extends Component {
    constructor(props) {
        super(props);

        this.defaultConfig = {
            rootId: null,
            dialWidth: 220,
            dialHeight: 220,
            edgeWidth: 0,
            hSpace: 30,
            vSpace: 20,
        };

        // Initialize state
        this.state = {
            config: this.defaultConfig,

            isLoaded: false,
        };

        this.onFolderSelect = this.onFolderSelect.bind(this);
        this.onChanged = this.onChanged.bind(this);
    }

    async componentWillMount() {
        utils.storage.onChanged.addListener(this.onChanged);

        const configData = await utils.storage.local.get('config');
        const newConfig = configData['config'] || {};

        const config = Object.assign({}, this.defaultConfig, newConfig);

        this.setState({
            config,
            isLoaded: true,
        });
    }

    componentWillUnmount() {
        utils.storage.onChanged.removeListener(this.onChanged);
    }

    async onFolderSelect(folderId) {
        const newConfig = Object.assign({}, this.defaultConfig, { rootId: folderId });

        await utils.storage.local.set({ config: newConfig });

        this.setState({
            config: newConfig,
        });
    }

    onChanged(changes, area) {
        // We are only interested in local configuration changes
        if (area === 'local' && !!changes.config) {
            if (changes.config.newValue) {
                this.setState({ config: changes.config.newValue });
            } else {
                this.setState({ config: this.defaultConfig });
            }
        }
    }

    render() {
        // Styling for page body
        document.body.style = `background-image: url('${backgroundImageUrl}'); background-size: cover;`;

        return (
            <React.Fragment>
                {this.state.isLoaded &&
                    <Container
                        key={this.state.config.rootId}
                        onFolderSelect={this.onFolderSelect}
                        config={this.state.config}
                    />
                }
            </React.Fragment>
        );
    }
}

export default DialApp;
