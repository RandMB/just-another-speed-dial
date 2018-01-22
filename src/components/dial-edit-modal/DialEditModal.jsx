/* eslint react/no-unused-state: 0 */
// The rule above is disabled because eslint fails to detect state usage
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _pickBy from 'lodash/pickBy';

import Modal from '../common/modal/Modal';
import PrimaryButton from '../common/button-primary/ButtonPrimary';
import DangerButton from '../common/button-danger/ButtonDanger';
import Button from '../common/button/Button';
import Input from '../common/input/Input';
import DialTile from '../dial-tile/DialTile';

import browserUtils from '../../utils/browser';

import './DialEditModal.css';


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
            title: props.node.get('title'),
            url: props.node.get('url'),
            type: props.node.get('type'),
            node: props.node,
            data: props.data,
        };

        this.initialState = Object.assign({}, this.state);

        this.onSave = this.onSave.bind(this);
        this.onColorChange = this.onColorChange.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
    }

    onSave() {
        // Only select changed properties
        const changedProps = _pickBy(this.state, (value, key) => value !== this.initialState[key]);
        
        // Only used for preview, don't emit it.
        //   It is safe to attempt to delete non existant properties
        delete changedProps.node;

        this.props.onSave(changedProps);
    }

    onValueChange(key, value) {
        const newNode = this.state.node.set(key, value);

        this.setState({
            [key]: value,
            node: newNode,
        });
    }

    async onColorChange(bgColor) {
        const textColor = await browserUtils.colors.getTextColor(bgColor);
        const data = {
            background: bgColor,
            color: textColor,
        };

        this.setState({ data });
    }

    render() {
        const headerText =
            this.state.type === 'bookmark' ? 'Edit a bookmark' : 'Edit a folder';

        return (
            <Modal
                in={this.props.in}
                onExited={this.props.onExited}
            >
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

                    <Input
                        name="color"
                        title="Choose a background color"
                        type="color"
                        onChange={this.onColorChange}
                        value={this.state.data.background}
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

DialEditModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    in: PropTypes.bool.isRequired,
    onExited: PropTypes.func.isRequired,

    data: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
};

export default DialEditModal;
