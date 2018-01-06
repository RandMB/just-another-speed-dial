import React from 'react';
import PropTypes from 'prop-types';

import Section from '../../section/Section';

import './SectionDebugging.css';

function ClearLocalStorage() {
    browser.storage.local.clear().then();
}

function SectionDebugging(props) {
    const {
        onOpenSection,
        ...sectionProps,
    } = props;

    return (
        <Section
            sectionName="Settings"
            {...sectionProps}>

            <div className="section-content-padded">
                <p>Clear local storage</p>
                <button onClick={ClearLocalStorage}>Reset storage</button>
            </div>
        </Section>
    );
}

SectionDebugging.propTypes = {
    onOpenSection: PropTypes.func,
};


export default SectionDebugging;