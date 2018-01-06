import React from 'react';
import PropTypes from 'prop-types';

import './SectionLink.css';

function SectionLink(props) {
    //
    return (
        <div
            className="sidebar-section-link-container"
            onClick={props.onClick}
            title={props.linkHint}>
            <div className="sidebar-section-link-icon">
                {props.icon}
            </div>
            <div className="sidebar-section-link-description">
                <p className="sidebar-section-link-name">{props.linkTitle}</p>
                <p className="sidebar-section-link-hint">{props.linkHint}</p>
            </div>
        </div>
    );
}

SectionLink.propTypes = {
    icon: PropTypes.node,
    linkTitle: PropTypes.string,
    linkHint: PropTypes.string,
    onClick: PropTypes.func
};

export default SectionLink;