import React from 'react';
import PropTypes from 'prop-types';

import './DialTile.css';
import folderImage from '../../assets/folder.png';

function DialTile(props) {
    return (
        <div
            draggable="false"
            className="dial-tile rounded-borders"
            title={props.url}
            onMouseDown={props.onMouseDown}
            style={props.tileStyle}
        >

            {props.type === 'folder' &&
                <img
                    alt=""
                    draggable="false"
                    src={folderImage}
                    onDragStart={(event) => { event.preventDefault(); }}
                />
            }
            {props.type === 'bookmark' &&
                <span>{new URL(props.url).host}</span>
            }
            <div
                onMouseDown={props.onEditMouseDown}
                className="tile-edit-button"
            >

                <i className="fas fa-edit" />
            </div>
        </div>
    );
}

DialTile.propTypes = {
    url: PropTypes.string,
    type: PropTypes.string.isRequired,
    onMouseDown: PropTypes.func.isRequired,
    onEditMouseDown: PropTypes.func.isRequired,
    tileStyle: PropTypes.object,
};

export default DialTile;
