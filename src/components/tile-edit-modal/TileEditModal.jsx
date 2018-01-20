import React from 'react';
import PropTypes from 'prop-types';

import Modal from '../common/modal/Modal';
import PrimaryButton from '../common/button-primary/ButtonPrimary';
import DangerButton from '../common/button-danger/ButtonDanger';
import Button from '../common/button/Button';

import './TileEditModal.css';

function getCloseButtonValue() {
    return (
        <React.Fragment>
            <i className="far fa-times-circle" />
            <span> Close</span>
        </React.Fragment>
    );
}

function TileEditModal(props) {
    return (
        <Modal
            in={props.in}
            onExited={props.onExited}
        >
            <div className="modal-header">
                <p>Edit a bookmark  </p>
                <Button
                    onClick={props.onClose}
                    value={getCloseButtonValue()}
                />
            </div>
            <div className="modal-body">
                <div className="input-group">
                    <label htmlFor="title">Title</label>
                    <input type="text" name="title" />
                </div>
                <div className="input-group">
                    <label htmlFor="url">Url address</label>
                    <input type="text" name="url" />
                </div>
            </div>
            <div className="modal-footer">
                <DangerButton title="Delete bookmark" value="Delete bookmark" />
                <PrimaryButton
                    onClick={props.onClose}
                    title="Close changes"
                    value="Save"
                />
            </div>
        </Modal>
    );
}

TileEditModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    in: PropTypes.bool,
    onExited: PropTypes.func,
};

export default TileEditModal;
