import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SectionMain from './components/sections/section-main/SectionMain';
import SectionBookmarks from './components/sections/section-bookmarks/SectionBookmarks';
import SectionDebugging from './components/sections/section-debugging/SectionDebugging';

import _cloneDeep from 'lodash/cloneDeep';

import './ConfigurationContainer.css';

const sections = ['bookmarks', 'main', 'debug'];

function getSection(sectionName, { key, ...props }) {
    switch (sectionName) {
        case 'debug':
            return <SectionDebugging key={key} {...props}></SectionDebugging>;
        case 'bookmarks':
            return <SectionBookmarks key={key} {...props}></SectionBookmarks>;
        case 'main':
            return <SectionMain key={key} {...props}></SectionMain>;
        default:
            return null;
    }
}

class ConfigurationContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            openSections: [],
            zIndex: 1,
            transitionInProgress: false,
        };

        this.onBack = this.onBack.bind(this);
        this.onClose = this.onClose.bind(this);        
        this.onOpenSection = this.onOpenSection.bind(this);
        this.onRemoved = this.onRemoved.bind(this);
        this.onMounted = this.onMounted.bind(this);
        this.onOpened = this.onOpened.bind(this);
        this.transitionEnded = this.transitionEnded.bind(this);
        this.onConfigChange = this.onConfigChange.bind(this);

        this.defaultConfig = {
            sectionName: 'main',
            key: 'main',
            isMain: true,
            isRemoved: false,
            isOpen: true,
            onBack: this.onBack,
            onClose: this.onClose,
            onRemoved: this.onRemoved,
            onOpenSection: this.onOpenSection,
            onMounted: this.onMounted,
            onOpened: this.onOpened,
            onConfigChange: this.onConfigChange,
        };

        this.basezIndex = 10000;
    }

    componentWillMount() {
        this.setState((prevstate) => {
            const sectionConfig = Object.assign({},
                this.defaultConfig, { zIndex: this.basezIndex + this.state.zIndex });

            return {
                openSections: [sectionConfig],
                zIndex: prevstate.zIndex + 1,
            };
        });
    }

    transitionEnded() {
        if (!this.props.isOpen) {
            this.setState((prevState) => {
                // At this point, the user can't really see sidebar, 
                //   so there is no point to remove section one by one with transitions
                //   just remove all sections but first one and reset to default options
                const newOpenSections = _cloneDeep(prevState.openSections.slice(0, 1));

                return {
                    openSections: newOpenSections,
                    zIndex: 1,
                    transitionInProgress: false,
                };
            }); 
        }
    }

    onConfigChange(config) {
        this.props.onConfigChange(config);
    }

    onClose() {
        this.props.onClose();
    }

    onBack() {
        // Is this is the main section
        if (this.state.openSections.length < 2) {
            this.props.onClose();
            return;
        }

        // If there is currently already a transition
        if (this.state.transitionInProgress) {
            return;
        }

        this.setState((prevState) => {
            const newOpenSections = _cloneDeep(prevState.openSections);

            newOpenSections[newOpenSections.length - 1].isRemoved = true;
            newOpenSections[newOpenSections.length - 1].isOpen = false;

            return {
                openSections: newOpenSections,
                transitionInProgress: true,
            };
        });
    }

    onOpened() {
        this.setState({
            transitionInProgress: false,
        });
    }

    onMounted() {
        // First section, no need to do anything
        if (this.state.openSections.length < 2) {
            return;
        }

        this.setState((prevState) => {
            const newOpenSections = _cloneDeep(prevState.openSections);

            newOpenSections[newOpenSections.length - 1].isOpen = true;

            return {
                openSections: newOpenSections,
            };
        });
    }

    onRemoved() {
        this.setState((prevState) => {
            // Assumes that the reported tansition was from the last section
            const newOpenSections = _cloneDeep(prevState.openSections.slice(0, -1));

            return {
                openSections: newOpenSections,
                transitionInProgress: false,
            };
        });
    }

    onOpenSection(sectionName) {
        // If there is currently already a transition
        if (this.state.transitionInProgress) {
            return;
        }

        if (!sections.includes(sectionName)) {
            console.warn(`Section ${sectionName} does not exist`);
            return;
        }

        this.setState((prevState) => {
            const sectionConfig = Object.assign(this.defaultConfig, {
                sectionName: sectionName,
                key: sectionName,
                isMain: false,
                isRemoved: false,
                isOpen: false,
                zIndex: this.basezIndex + prevState.zIndex,
            });

            const newOpenSections = _cloneDeep(prevState.openSections);

            newOpenSections.push(sectionConfig);

            return {
                openSections: newOpenSections,
                zIndex: prevState.zIndex + 1,
                transitionInProgress: true,
            };
        });
    }

    render() {
        let sidebarClass = 'configuration-sidebar ';
        sidebarClass += this.props.isOpen ? 'sidebar-open' : '';

        const sidebarStyle = {
            zIndex: this.basezIndex,
        };

        const sections = this.state.openSections.map(({ sectionName, ...config }) => {
            const newConfig = Object.assign(config, {
                currentConfig: this.props.currentConfig,
            });

            return getSection(sectionName, newConfig);
        });

        return (
            <div className={sidebarClass} 
                style={sidebarStyle} 
                onTransitionEnd={this.transitionEnded}>

                {sections}
            </div>
        );
    }
}

ConfigurationContainer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfigChange: PropTypes.func.isRequired,
    currentConfig: PropTypes.object.isRequired,
};

export default ConfigurationContainer;