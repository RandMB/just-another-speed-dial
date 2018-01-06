import React from 'react';
import PropTypes from 'prop-types';

import Section from '../../section/Section';
import RootFolderConfig from '../../configs/root-folder-config/RootFolderConfig';

import './SectionBookmarks.css';

function SectionBookmarks(props) {
    const {
        onOpenSection,
        currentConfig,
        onConfigChange,
        ...sectionProps,
    } = props;

    return (
        <Section
            sectionName="Bookmarks"
            {...sectionProps}>

            <div className="section-content-padded">
                <RootFolderConfig
                    onConfigChange={onConfigChange}
                    currentConfig={currentConfig}>
                </RootFolderConfig>
            </div>

        </Section>
    );
}

SectionBookmarks.propTypes = {
    onOpenSection: PropTypes.func.isRequired,
    onConfigChange: PropTypes.func.isRequired,
    currentConfig: PropTypes.object.isRequired,
};


export default SectionBookmarks;