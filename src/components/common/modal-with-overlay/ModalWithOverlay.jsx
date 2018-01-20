import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import './ModalWithOverlay.css';

function ModalWithOverlay(props) {
    return (
        <CSSTransition
            in={props.in}
            timeout={250}
            appear={true}
            classNames="modal-overlay"
        >
            <div className="modal-overlay">
                {props.children}
            </div>
        </CSSTransition>
    );
}

ModalWithOverlay.propTypes = {
    children: PropTypes.node,
    in: PropTypes.bool,
};

export default ModalWithOverlay;
