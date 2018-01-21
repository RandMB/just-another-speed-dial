import React from 'react';
import PropTypes from 'prop-types';

import './DialTile.css';
import folderImage from '../../assets/folder.png';

function DialTile(props) {
    let url = props.url;

    try {
        url = new URL(props.url).host;
    } catch (error) {
        // Nothing to do, url is not a valid url, just display full url
    }

    // Chrome doesn't throw if url invalid... Workaround
    if (!url) {
        url = props.url;
    }

    return (
        <div
            draggable="false"
            onDragStart={(event) => { event.preventDefault(); }}
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
                <p draggable="false">{url}</p>
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
    tileStyle: PropTypes.object,
    onMouseDown: PropTypes.func,
    onEditMouseDown: PropTypes.func,
};

export default DialTile;
