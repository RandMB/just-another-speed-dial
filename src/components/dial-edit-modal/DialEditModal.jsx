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
import DialTitle from '../dial-title/DialTitle';

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
            title: props.title,
            url: props.url,
            tileStyle: props.tileStyle,
        };

        this.onSave = this.onSave.bind(this);
        this.onColorChange = this.onColorChange.bind(this);
    }

    onSave() {
        // Only select changed properties
        const changedProps = _pickBy(this.state, (value, key) => value !== this.props[key]);

        this.props.onSave(changedProps);
    }

    async onColorChange(bgColor) {
        const textColor = await browserUtils.colors.getTextColor(bgColor);
        const tileStyle = {
            background: bgColor,
            color: textColor,
        };

        this.setState({ tileStyle });
    }

    render() {
        const headerText = this.props.type === 'bookmark' ? 'Edit a bookmark' : 'Edit a folder';

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
                            url={this.state.url}
                            type={this.props.type}
                            tileStyle={this.state.tileStyle}
                        />

                        <DialTitle
                            title={this.state.title}
                        />
                        <div className="modal-edit-preview-overlay" />
                    </div>

                    <Input
                        name="title"
                        title="Title"
                        type="text"
                        onChange={(value) => this.setState({ title: value })}
                        value={this.props.title}
                    />

                    {this.props.type !== 'folder' &&
                        <React.Fragment>
                            <Input
                                name="url"
                                title="Url address"
                                type="text"
                                onChange={(value) => this.setState({ url: value })}
                                value={this.props.url}
                            />

                            <Input
                                name="color"
                                title="Choose a background color"
                                type="color"
                                onChange={this.onColorChange}
                                value={this.props.tileStyle.background}
                            />
                        </React.Fragment>
                    }
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

    title: PropTypes.string.isRequired,
    url: PropTypes.string,
    type: PropTypes.string.isRequired,
    tileStyle: PropTypes.object.isRequired,
};

export default DialEditModal;
