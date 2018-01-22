import React from 'react';
import PropTypes from 'prop-types';

import './DialFolder.css';

function DialFolder(props) {
    const tileStyle = {
        background: props.data.background || '#ffffff',
        color: props.data.color || '#000000',
    };

    return (
        <div style={tileStyle} className="dial-tile-folder">
            <i className="far fa-folder fa-6x" />
        </div>
    );
}

DialFolder.propTypes = {
    data: PropTypes.object.isRequired,
};

export default DialFolder;
