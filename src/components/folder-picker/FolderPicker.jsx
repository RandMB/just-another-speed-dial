import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './FolderPicker.css';
import folderImage from '../../assets/folder.png';

class FolderPicker extends Component {
    static isFolderNotLoaded(folder) {
        // If the children folder values are undefined or false (falsy values)
        //   otherwise, the children property should be an empty array, which means
        //   that the folder is just empty
        return !folder.children;
    }

    static ifSelected(element) {
        return element.selected ? 'selected' : '';
    }

    onSeleted(folder) {
        if (FolderPicker.isFolderNotLoaded(folder)) {
            this.props.onFolderRequest(folder.id);
        }

        this.props.onFolderSelect(folder.id);
    }

    render() {
        const bookmarkTree = this.props.bookmarkTree;

        const folders = bookmarkTree.map(element => (
            <div key={element.id} className="folder-picker">
                <div
                    className={`folder-picker-header rounded-borders-half ${FolderPicker.ifSelected(element)}`}
                    onClick={() => this.onSeleted(element)}
                >

                    <div className="folder-icon">
                        <img height="32" width="32" src={folderImage} alt="" />
                    </div>

                    <div className="folder-title">
                        {element.title}
                    </div>
                </div>

                <div className="folder-children">
                    {element.children &&
                        <FolderPicker
                            bookmarkTree={element.children}
                            onFolderSelect={this.props.onFolderSelect}
                            onFolderRequest={this.props.onFolderRequest}
                        />
                    }

                </div>
            </div>
        ));

        return (folders);
    }
}

FolderPicker.propTypes = {
    bookmarkTree: PropTypes.array,
    onFolderSelect: PropTypes.func,
    onFolderRequest: PropTypes.func,
};

export default FolderPicker;
