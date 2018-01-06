import React, { Component } from 'react';
import SpeedDialItem from '../speed-dial-item/SpeedDialItem';
import PropTypes from 'prop-types';
import './SpeedDialViewPlane.css';

class SpeedDialViewPlane extends Component {
    render() {
        const bookmarkTree = this.props.bookmarks;
        const dialsStyle = {
            width: this.props.width,
            height: this.props.height,
        };

        return (
            <div className="speed-dial-view-plane config-close"
                style={dialsStyle}>

                {bookmarkTree.map(({ treeNode, data }) =>
                    <SpeedDialItem
                        onOpenFolder={this.props.onOpenFolder}
                        key={treeNode.id}
                        node={treeNode}
                        data={data}
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
};

export default SpeedDialViewPlane;