import React from 'react';
import PropTypes from 'prop-types';

import './DialTitle.css';

function DialTitle(props) {
    return (
        <div className="dial-title-container">
            <div
                className="dial-title-background"
                title={props.title}
            >

                <span>{props.title}</span>
            </div>
        </div>
    );
}

DialTitle.propTypes = {
    title: PropTypes.string.isRequired,
};

export default DialTitle;
