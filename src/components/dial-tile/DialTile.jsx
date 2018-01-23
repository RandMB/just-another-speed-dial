import React from 'react';
import PropTypes from 'prop-types';

import './DialTile.css';
import DialFolder from '../dial-folder/DialFolder';
import DialBookmark from '../dial-bookmark/DialBookmark';
import DialTitle from '../dial-title/DialTitle';

function DialTile(props) {
    const title = props.node.get('title');
    const type = props.node.get('type');
    const url = props.node.get('url');

    return (
        <React.Fragment>
            <div
                draggable="false"
                onDragStart={(event) => { event.preventDefault(); }}
                className="dial-tile rounded-borders"
                title={url}
                onMouseDown={props.onMouseDown}
            >

                {type === 'folder' &&
                    <DialFolder data={props.data} />
                }

                {type === 'bookmark' &&
                    <DialBookmark
                        url={url}
                        data={props.data}
                        onUpdate={props.onUpdate}
                    />
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
    onUpdate: PropTypes.func,
};

export default DialTile;
