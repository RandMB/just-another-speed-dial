import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FolderPicker from '../folder-picker/FolderPicker';
import './FolderPickerContainer.css';

function getFolderPickerComponent(bookmarkTree, onFolderSelect, onFolderRequest) {
    if (bookmarkTree) {
        return (
            <div className="folder-picker-component rounded-borders">
                <FolderPicker
                    bookmarkTree={bookmarkTree}
                    onFolderSelect={onFolderSelect}
                    onFolderRequest={onFolderRequest}
                />
            </div>
        );
    } else {
        return (
            <div>
                This should be a loading indicator
            </div>
        );
    }
}

class FolderPickerContainer extends Component {
    constructor(props) {
        super(props);

        // Initialize state
        this.state = {
            bookmarkTree: null,
            selectedFolderId: null,
        };

        this.folderIdMap = new Map();

        this.onFolderSelect = this.onFolderSelect.bind(this);
        this.onFolderRequest = this.onFolderRequest.bind(this);
        this.onUseFolder = this.onUseFolder.bind(this);

        this.browserUtils = props.browserUtils;
    }

    async componentWillMount() {
        const rootFolderNodes =
            await this.browserUtils.bookmarks.getRootChildren({ selected: false });

        rootFolderNodes.forEach((element) => {
            this.folderIdMap.set(element.id, element);
        });

        this.setState({
            bookmarkTree: rootFolderNodes,
        });
    }

    onFolderSelect(folderId) {
        // Don't do anything if user selected alredy selected folder
        if (folderId === this.state.selectedFolderId) {
            return;
        }

        // Unset the previously selected folder - Hacky
        if (this.state.selectedFolderId) {
            this.folderIdMap.get(this.state.selectedFolderId).selected = false;
        }

        // Set the currently selected folder as selected - Hacky
        this.folderIdMap.get(folderId).selected = true;

        this.setState({
            selectedFolderId: folderId,
        });
    }

    async onFolderRequest(folderId) {
        const folderChildren =
            await this.browserUtils.bookmarks.getSubfolders(folderId, { selected: false });

        folderChildren.forEach((element) => {
            this.folderIdMap.set(element.id, element);
        });

        // Add newly retrieved children - Hacky
        this.folderIdMap.get(folderId).children = folderChildren;

        // No need to update if there are no children
        if (folderChildren && folderChildren.length > 0) {
            // We need to force a rerender. Yes, we should not mutate state
            this.forceUpdate();
        }
    }

    onUseFolder() {
        if (this.state.selectedFolderId !== null) {
            this.props.onSelect(this.state.selectedFolderId);
        }
    }

    render() {
        const bookmarkTree = this.state.bookmarkTree;
        const isSelected = this.state.selectedFolderId !== null;

        return (
            <div className="folder-picker-container config-close">
                <div className="folder-picker-wrapper rounded-borders">
                    <p className="folder-pick-text">
                        Pick a bookmark folder for your speed dial:
                    </p>
                    {
                        getFolderPickerComponent(
                            bookmarkTree,
                            this.onFolderSelect,
                            this.onFolderRequest,
                        )
                    }
                    <div className="new-folder-container">
                        <button
                            className="button-transparent"
                            type="button"
                            disabled
                        >
                            New Folder
                        </button>
                        <button
                            className="button-transparent"
                            type="button"
                            onClick={this.onUseFolder}
                            disabled={!isSelected}
                        >
                            Use selected folder
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

FolderPickerContainer.propTypes = {
    onSelect: PropTypes.func.isRequired,
    browserUtils: PropTypes.object.isRequired,
};

export default FolderPickerContainer;
