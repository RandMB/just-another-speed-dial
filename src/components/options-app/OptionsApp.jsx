import React, { Component } from 'react';

import './OptionsApp.css';
import OptionsNavigation from '../options-navigation/OptionsNavigation';
import SectionAppearance from '../section-appearance/SectionAppearance';
import SectionGeneral from '../section-general/SectionGeneral';
import SectionAdvanced from '../section-advanced/SectionAdvanced';

import utils from '../../utils/browser';

function getSection(hash, config, onChange) {
    switch (hash) {
        case '#advanced':
            return (<SectionAdvanced config={config} onChange={onChange} />);
        case '#appearance':
            return (<SectionAppearance config={config} onChange={onChange} />);
        default:
            return (<SectionGeneral config={config} onChange={onChange} />);
    }
}

function getTitle(hash) {
    switch (hash) {
        case '#advanced':
            return 'Just another speed dial - Settings - Advanced';
        case '#appearance':
            return 'Just another speed dial - Settings - Appearance';
        default:
            return 'Just another speed dial - Settings - General';
    }
}

class OptionsApp extends Component {
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

        this.state = {
            currentHash: window.location.hash,
            config: this.defaultConfig,
        };

        document.title = getTitle(window.location.hash);

        window.addEventListener('hashchange', (event) => {
            const url = event.newURL;
            const hashIndex = url.indexOf('#');

            if (hashIndex < 0) {
                // hash not set, set to default
                this.setState({ currentHash: '' });
            } else {
                const currentHash = url.substring(hashIndex);

                document.title = getTitle(currentHash);

                this.setState({ currentHash });
            }

        }, false);

        this.onChanged = this.onChanged.bind(this);
        this.onConfigChange = this.onConfigChange.bind(this);
    }

    async componentWillMount() {
        utils.storage.onChanged.addListener(this.onChanged);

        const configData = await utils.storage.local.get('config');
        const newConfig = configData['config'] || {};

        const config = Object.assign({}, this.defaultConfig, newConfig);

        this.setState({
            config,
        });
    }

    componentWillUnmount() {
        utils.storage.onChanged.removeListener(this.onChanged);
    }

    onChanged(changes, area) {
        // We are only interested in local configuration changes
        if (area === 'local' && changes.config) {
            const config = changes.config || {};

            this.setState({ config });
        }
    }

    async onConfigChange(value) {
        const newConfig = Object.assign({}, this.state.config, value);

        await utils.storage.local.set({ config: newConfig });

        this.setState({
            config: newConfig,
        });
    }

    render() {
        const { currentHash, config } = this.state;

        return (
            <div className="options-main">
                <div className="options-nav">
                    <OptionsNavigation selected={currentHash} />
                </div>

                <div className="options-section">
                    {getSection(currentHash, config, this.onConfigChange)}
                </div>
            </div>


        );
    }
}

export default OptionsApp;
