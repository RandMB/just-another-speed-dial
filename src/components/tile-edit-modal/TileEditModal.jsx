/* eslint react/no-unused-state: 0 */
// The rule above is disabled because eslint fails to detect state usage

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _pickBy from 'lodash/pickBy';

import Modal from '../common/modal/Modal';
import PrimaryButton from '../common/button-primary/ButtonPrimary';
import DangerButton from '../common/button-danger/ButtonDanger';
import Button from '../common/button/Button';
import TextInput from '../common/text-input/TextInput';

import './TileEditModal.css';


function getCloseButtonValue() {
    return (
        <React.Fragment>
            <i className="far fa-times-circle" />
            <span> Close</span>
        </React.Fragment>
    );
}

class TileEditModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: props.title,
            url: props.url,
        };

        this.onSave = this.onSave.bind(this);
    }

    onSave() {
        // Only select changed properties
        const changedProps = _pickBy(this.state, (value, key) => value !== this.props[key]);

        this.props.onSave(changedProps);
    }

    render() {
        return (
            <Modal
                in={this.props.in}
                onExited={this.props.onExited}
            >
                <div className="modal-header">
                    <p>Edit a bookmark  </p>
                    <Button
                        onClick={this.props.onClose}
                        value={getCloseButtonValue()}
                    />
                </div>
                <div className="modal-body">
                    <TextInput
                        name="title"
                        title="Title"
                        onChange={(value) => this.setState({ title: value })}
                        value={this.props.title}
                    />

                    <TextInput
                        name="url"
                        title="Url address"
                        onChange={(value) => this.setState({ url: value })}
                        value={this.props.url}
                    />
                </div>
                <div className="modal-footer">
                    <DangerButton title="Delete bookmark" value="Delete bookmark" />
                    <PrimaryButton
                        onClick={this.onSave}
                        title="Save changes"
                        value="Save"
                    />
                </div>
            </Modal>
        );
    }
}

TileEditModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    in: PropTypes.bool.isRequired,
    onExited: PropTypes.func.isRequired,

    title: PropTypes.string.isRequired,
    url: PropTypes.string,
};

export default TileEditModal;
