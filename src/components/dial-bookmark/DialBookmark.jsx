import React from 'react';
import PropTypes from 'prop-types';

import './DialBookmark.css';

function DialBookmark(props) {
    const tileStyle = {
        background: props.data.background || '#ffffff',
        color: props.data.color || '#000000',
    };

    return (
        <div style={tileStyle} className="dial-tile-bookmark">
            <p draggable="false">{props.url}</p>
        </div>
    );
}

DialBookmark.propTypes = {
    url: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};

export default DialBookmark;
