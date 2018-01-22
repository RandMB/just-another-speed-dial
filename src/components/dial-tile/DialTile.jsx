import React from 'react';
import PropTypes from 'prop-types';

import './DialTile.css';
import DialFolder from '../dial-folder/DialFolder';
import DialBookmark from '../dial-bookmark/DialBookmark';
import DialTitle from '../dial-title/DialTitle';

function DialTile(props) {
    const title = props.node.get('title');
    const type = props.node.get('type');
    const fullUrl = props.node.get('url');

    let url = fullUrl;

    try {
        url = new URL(fullUrl).host;
    } catch (error) {
        // Nothing to do, url is not a valid url, just display full url
    }

    // Chrome doesn't throw if url invalid... Workaround
    if (!url) {
        url = fullUrl;
    }

    return (
        <React.Fragment>
            <div
                draggable="false"
                onDragStart={(event) => { event.preventDefault(); }}
                className="dial-tile rounded-borders"
                title={fullUrl}
                onMouseDown={props.onMouseDown}
            >

                {type === 'folder' &&
                    <DialFolder data={props.data} />
                }

                {type === 'bookmark' &&
                    <DialBookmark url={url} data={props.data} />
                }

                <div
                    onMouseDown={props.onEditMouseDown}
                    className="tile-edit-button"
                >
                    <i className="fas fa-edit" />
                </div>
            </div>

            <DialTitle title={title} />
        </React.Fragment>
    );
}

DialTile.propTypes = {
    data: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    onMouseDown: PropTypes.func,
    onEditMouseDown: PropTypes.func,
};

export default DialTile;
