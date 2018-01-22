import React from 'react';
import PropTypes from 'prop-types';

import './ConfirmDialog.css';
import Modal from '../modal/Modal';
import ButtonDanger from '../button-danger/ButtonDanger';
import Button from '../button/Button';

function ConfirmDialog(props) {
    return (
        <Modal
            in={props.in}
            onExited={props.onExited}
        >
            <div className="modal-confirm">
                <div className="modal-header">
                    <span>Are you sure?</span>
                </div>
                <div className="modal-body">
                    {props.text}
                </div>
                <div className="modal-footer">
                    <ButtonDanger
                        title="Delete bookmark"
                        value="Delete bookmark"
                        onClick={props.onConfirm}
                    />
                    <Button
                        title="Cancel"
                        value="Cancel"
                        onClick={props.onCancel}
                    />
                </div>
            </div>
        </Modal>
    );
}

ConfirmDialog.propTypes = {
    text: PropTypes.string.isRequired,
    in: PropTypes.bool.isRequired,
    onExited: PropTypes.func,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ConfirmDialog;
