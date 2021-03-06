import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import _pickBy from 'lodash/pickBy';
import _cloneDeep from 'lodash/cloneDeep';

import Modal from '../common/modal/Modal';
import ButtonPrimary from '../common/button-primary/ButtonPrimary';
import ButtonDanger from '../common/button-danger/ButtonDanger';
import Button from '../common/button/Button';
import Input from '../common/input/Input';
import DialTile from '../dial-tile/DialTile';

import './DialEditModal.css';
import ConfirmDialog from '../common/confirm-dialog/ConfirmDialog';
import DialBackgroundSelector from '../dial-background-selector/DialBackgroundSelector';

const CONFIRM_TEXT = 'Are you sure you want to delete this bookmark? This action cannot be undone';

function getCloseButtonValue() {
    return (
        <React.Fragment>
            <i className="far fa-times-circle" />
            <span> Close</span>
        </React.Fragment>
    );
}

class DialEditModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: props.node.title,
            url: props.node.url,
            type: props.node.type,
            node: props.node,
            data: props.data,

            confirmDelete: false,
            isModalShown: false,
        };

        this.initialState = Object.assign({}, this.state);

        this.onSave = this.onSave.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        this.onDataChange = this.onDataChange.bind(this);
        this.onLocalDataChange = this.onLocalDataChange.bind(this);
        this.showConfirmDialog = this.showConfirmDialog.bind(this);
        this.deleteBookmark = this.deleteBookmark.bind(this);
    }

    onSave() {
        // Only select changed properties, clone them, because some are objects
        //   and objects would get picked by reference
        const changedProps =
            _cloneDeep(_pickBy(this.state, (value, key) => value !== this.initialState[key]));

        // Only used for preview, don't emit it.
        //   It is safe to attempt to delete non existant properties
        delete changedProps.node;
        // If we update local data, however, it can cause flickering between old an new state
        //   if this data is also part of browser, like an url
        //   Because this data is just a cache, it has to be safe to let it regenerate
        if (changedProps.data) {
            delete changedProps.data.local;
        }

        this.props.onSave(changedProps);
    }

    onValueChange(key, value) {
        this.state.node[key] = value;

        this.setState({
            [key]: value,
        });
    }

    onDataChange(data) {
        const newValue = Object.assign({}, this.state.data, { data });

        this.setState({ data: newValue });
    }

    onLocalDataChange(data) {
        const newValue = Object.assign({}, this.state.data, { local: data.data.local });

        this.setState({ data: newValue });
    }

    showConfirmDialog() {
        this.setState({ isModalShown: true, confirmDelete: true });
    }

    deleteBookmark() {
        if (this.state.type === 'bookmark') {
            chrome.bookmarks.remove(this.props.node.id);
        } else {
            chrome.bookmarks.removeTree(this.props.node.id);
        }
    }

    render() {
        const headerText =
            this.state.type === 'bookmark' ? 'Edit a bookmark' : 'Edit a folder';

        return (
            <Modal
                in={this.props.in}
                onExited={this.props.onExited}
            >
                <div className="modal-edit-dial">
                    <div className="modal-header">
                        <p>{headerText}</p>
                        <Button
                            onClick={this.props.onClose}
                            value={getCloseButtonValue()}
                        />
                    </div>
                    <div className="modal-body">
                        <div className="modal-edit-preview">
                            <DialTile
                                onUpdate={this.onLocalDataChange}
                                data={this.state.data}
                                node={this.state.node}
                                type={this.state.type}
                            />
                            <div className="modal-edit-preview-overlay" />
                        </div>

                        <Input
                            name="title"
                            title="Title"
                            type="text"
                            onChange={(value) => this.onValueChange('title', value)}
                            value={this.state.title}
                        />

                        {this.state.type !== 'folder' &&
                            <Input
                                name="url"
                                title="Url address"
                                type="text"
                                onChange={(value) => this.onValueChange('url', value)}
                                value={this.state.url}
                            />
                        }

                        <DialBackgroundSelector
                            type={this.state.type}
                            data={this.state.data.data}
                            onBackgroundChange={this.onDataChange}
                        />
                    </div>
                    <div className="modal-footer">
                        <ButtonDanger
                            title="Delete bookmark"
                            value="Delete bookmark"
                            onClick={this.showConfirmDialog}
                        />
                        <ButtonPrimary
                            onClick={this.onSave}
                            title="Save changes"
                            value="Save"
                        />
                    </div>
                </div>


                {this.state.confirmDelete &&
                    <Portal node={document && document.getElementById('modals')}>
                        <ConfirmDialog
                            in={this.state.isModalShown}
                            text={CONFIRM_TEXT}
                            onConfirm={() => this.deleteBookmark()}
                            onCancel={() => this.setState({ isModalShown: false })}
                            onExited={() => this.setState({ confirmDelete: false })}
                        />
                    </Portal>
                }

            </Modal>
        );
    }
}

DialEditModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    in: PropTypes.bool.isRequired,
    onExited: PropTypes.func.isRequired,

    data: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
};

export default DialEditModal;
