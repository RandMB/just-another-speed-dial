import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import './Modal.css';

function Modal(props) {
    return (
        <CSSTransition
            in={props.in}
            timeout={250}
            appear={true}
            classNames="modal-overlay"
        >
            <div className="modal-overlay">
                <CSSTransition
                    in={props.in}
                    timeout={250}
                    appear={true}
                    classNames="modal"
                    onExited={props.onExited}
                >
                    <div className="modal-container">
                        {props.children}
                    </div>
                </CSSTransition>
            </div>
        </CSSTransition>
    );
}

Modal.propTypes = {
    children: PropTypes.node,
    in: PropTypes.bool,
    onExited: PropTypes.func,
};

export default Modal;
