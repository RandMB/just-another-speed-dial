import React from 'react';
import PropTypes from 'prop-types';

import './DialBookmark.css';

function DialBookmark(props) {
    const tileStyle = {
        backgroundColor: props.data.background || '#ffffff',
        color: props.data.color || '#000000',
    };

    if (props.data.backgroundType === 'colorImage' || props.data.backgroundType === 'image') {
        tileStyle.backgroundImage = `url("${props.data.backgroundImage}")`;
    }

    if (props.data.backgroundType === 'image') {
        tileStyle.backgroundColor = '#ffffff';
        tileStyle.backgroundSize = 'cover';
    }

    return (
        <div style={tileStyle} className="dial-tile-bookmark">
            {(!props.data.backgroundType || props.data.backgroundType === 'color') &&
                <p draggable="false">{props.url}</p>
            }
        </div>
    );
}

DialBookmark.propTypes = {
    url: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};

export default DialBookmark;
