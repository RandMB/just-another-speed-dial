import React from 'react';
import PropTypes from 'prop-types';

import './Section.css';

function Section(props) {
    return (
        <div className="section">
            {props.children}
        </div >
    );
}

Section.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Section;
