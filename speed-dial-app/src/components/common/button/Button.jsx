import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import './Button.css';

function Button(props) {
    const classes = props.classes ? ClassNames({...props.classes}) : {};

    return (
        <button
            type="button"
            className={classes}
            onClick={props.onClick}
            title={props.title}>
            {props.value}
        </button>
    );
}

Button.propTypes = {
    classes: PropTypes.object,
    onClick: PropTypes.func,
    title: PropTypes.string,
    value: PropTypes.string,
};

export default Button;
