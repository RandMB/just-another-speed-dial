import React from 'react';
import PropTypes from 'prop-types';

import './DialTile.css';
import folderImage from '../../../../assets/folder.png';

function DialTile(props) {
    return (
        <div
            className="dial-tile rounded-borders"
            title={props.url}
            onMouseDown={props.onMouseDown}
            style={props.tileStyle}>

            {props.type === 'folder' &&
                <img alt="" draggable="false" src={folderImage} />
            }
            {props.type === 'bookmark' &&
                <a>{new URL(props.url).host}</a>
            }
        </div>
    );
}

DialTile.propTypes = {
    url: PropTypes.string,
    type: PropTypes.string.isRequired,
    onMouseDown: PropTypes.func.isRequired,
    tileStyle: PropTypes.object,
};

export default DialTile;