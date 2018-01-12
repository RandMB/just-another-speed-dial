import React from 'react';
import PropTypes from 'prop-types';

import Modal from '../modal/Modal';
import PrimaryButton from '../../common/button-primary/ButtonPrimary';
import DangerButton from '../../common/button-danger/ButtonDanger';

import './TileEditModal.css';

function TileEditModal(props) {
    return (
        <Modal>
            <div className="modal-header">
                <p>Edit a bookmark  </p>
            </div>
            <div className="modal-body">
                <p>Hello world</p>
            </div>
            <div className="modal-footer">
                <DangerButton title="Delete bookmark" value="Delete bookmark" />
                <PrimaryButton
                    onClick={props.onClose}
                    title="Close this dialog"
                    value="Close"
                />
            </div>
        </Modal>
    );
}

TileEditModal.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default TileEditModal;
