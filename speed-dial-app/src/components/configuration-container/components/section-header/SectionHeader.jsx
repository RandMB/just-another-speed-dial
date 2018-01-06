import React from 'react';
import PropTypes from 'prop-types';

import './SectionHeader.css';

function HeaderIcon(props) {
    if (!props.isMain) {
        return <i className="fas fa-angle-left"></i>;
    }

    return null;
}

function SectionHeader(props) {
    const iconTitle = props.isMain ? 'Close' : 'Back';

    return (
        <div className="sidebar-top-container">
            <div
                className="sidebar-top-icon"
                onClick={() => props.onBack()}
                title={iconTitle}>
                <HeaderIcon isMain={props.isMain}></HeaderIcon>
            </div>
            <div className="sidebar-section-name">
                <p>{props.sectionName}</p>
            </div>

            <div className="sidebar-section-close">
                <button type="button" onClick={props.onClose}>Close</button>
            </div>
        </div>
    );
}

SectionHeader.propTypes = {
    sectionName: PropTypes.string.isRequired,
    onBack: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isMain: PropTypes.bool.isRequired
};

HeaderIcon.propTypes = {
    isMain: PropTypes.bool
};

export default SectionHeader;