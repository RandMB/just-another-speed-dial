import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SpeedDialItem from '../speed-dial-item/SpeedDialItem';

import './SpeedDialViewPlane.css';

class SpeedDialViewPlane extends Component {
    render() {
        const bookmarkTree = this.props.bookmarks;
        const dialsStyle = {
            width: this.props.width,
            height: this.props.height,
        };

        return (
            <div
                id="speed-dial"
                className="speed-dial-view-plane config-close"
                style={dialsStyle}>

                {bookmarkTree.map(({ id, treeNode, data }, index) =>
                    <SpeedDialItem
                        onOpenFolder={this.props.onOpenFolder}
                        key={'' + id}
                        node={treeNode}
                        data={data}
                        id={id}
                        onDrag={this.props.onDialDrag}
                    />)}
            </div>
        );
    }
}

SpeedDialViewPlane.propTypes = {
    bookmarks: PropTypes.array.isRequired,
    onOpenFolder: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onDialDrag: PropTypes.func.isRequired,
};

export default SpeedDialViewPlane;