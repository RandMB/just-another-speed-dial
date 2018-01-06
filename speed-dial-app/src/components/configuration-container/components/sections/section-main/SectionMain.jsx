import React from 'react';
import PropTypes from 'prop-types';

import Section from '../../section/Section';
import SectionLink from '../../section-link/SectionLink';

import './SectionMain.css';

function SectionMain(props) {
    const {
        onOpenSection,
        ...sectionProps,
    } = props;

    return (
        <Section
            sectionName="Settings"
            {...sectionProps}>

            <SectionLink
                icon={<i className="far fa-bookmark"></i>}
                linkTitle="Manage bookmark folder"
                linkHint="Change speed dial folder"
                onClick={() => onOpenSection('bookmarks')}>
            </SectionLink>

            <SectionLink
                icon={<i className="fas fa-bug"></i>}
                linkTitle="Options for debugging"
                linkHint=""
                onClick={() => onOpenSection('debug')}>
            </SectionLink>
        </Section>
    );
}

SectionMain.propTypes = {
    onOpenSection: PropTypes.func,
    onConfigChange: PropTypes.func,
};


export default SectionMain;