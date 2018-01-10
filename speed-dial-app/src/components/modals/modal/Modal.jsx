import React from 'react';
import PropTypes from 'prop-types';

import './Modal.css';

function Modal(props) {
    return (
        <div className="modal-container">
            {props.children}
        </div>
    );
}

Modal.propTypes = {
    children: PropTypes.node,
};

export default Modal;
