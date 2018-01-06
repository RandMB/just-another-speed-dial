import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FolderPicker from './components/folder-picker/FolderPicker';
import './FolderPickerContainer.css';

function getFolderPickerComponent(bookmarkTree, onFolderSelect, onFolderRequest) {
    if (bookmarkTree) {
        return (
            <div className="folder-picker-component rounded-borders">
                <FolderPicker
                    bookmarkTree={bookmarkTree}
                    onFolderSelect={onFolderSelect}
                    onFolderRequest={onFolderRequest}>
                </FolderPicker>
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

        this.onNewFolder = this.onNewFolder.bind(this);
        this.onFolderSelect = this.onFolderSelect.bind(this);
        this.onFolderRequest = this.onFolderRequest.bind(this);
        this.onUseFolder = this.onUseFolder.bind(this);
    }

    extractFolders(bookmarkArray) {
        return bookmarkArray
            .filter((element) => element.type === 'folder')
            .map((element) => {
                return {
                    id: element.id,
                    title: element.title,
                    selected: false,
                };
            });
    }

    componentWillMount() {
        browser.bookmarks.getTree()
            .then((tree) => {
                return browser.bookmarks.getChildren(tree[0].id);
            }).then((children) => {
                const folderChildren = this.extractFolders(children);

                folderChildren.forEach((element) => {
                    this.folderIdMap.set(element.id, element);
                });

                this.setState({
                    bookmarkTree: folderChildren,
                });
            });
    }

    onNewFolder() {
        console.warn('Not implemented yet');
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

    onFolderRequest(folderId) {
        console.log('Getting children for folder with id ' + folderId);

        browser.bookmarks.getChildren(folderId)
            .then((children) => {
                const folderChildren = this.extractFolders(children);

                folderChildren.forEach((element) => {
                    this.folderIdMap.set(element.id, element);
                });

                // Add newly retrieved children - Hacky
                this.folderIdMap.get(folderId).children = folderChildren;
                
                // No need to update if there are no children
                if (children && children.length > 0) {
                    // We need to force a rerender. Yes, we should not mutate state
                    this.setState((prevstate, props) => {
                        return {
                            bookmarkTree: prevstate.bookmarkTree
                        };
                    });
                }
            });
    }

    onUseFolder() {
        if (this.state.selectedFolderId !== null) {
            this.props.onSelect(this.state.selectedFolderId);
        }
    }

    render() {
        const bookmarkTree = this.state.bookmarkTree;
        const isSelected = this.state.selectedFolderId !== null ? true : false;

        return (
            <div className="folder-picker-container config-close">
                <div className="folder-picker-wrapper rounded-borders">
                    <p className="folder-pick-text">
                        Pick a bookmark folder for your speed dial:
                    </p>
                    {getFolderPickerComponent(
                        bookmarkTree,
                        this.onFolderSelect,
                        this.onFolderRequest)}
                    <div className="new-folder-container">
                        <button type="button" onClick={this.onNewFolder} disabled>New Folder</button>
                        <button
                            type="button"
                            onClick={this.onUseFolder}
                            disabled={!isSelected}>
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
};

export default FolderPickerContainer;