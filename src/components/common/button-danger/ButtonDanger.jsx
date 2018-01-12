import React from 'react';
import PropTypes from 'prop-types';

import Button from '../button/Button';

import './ButtonDanger.css';

function ButtonDanger(props) {
    const classes = {
        'button-danger': true,
        ...props.classes,
    };

    return (
        <Button
            classes={classes}
            onClick={props.onClick}
            title={props.title}
            value={props.value}
        />
    );
}

ButtonDanger.propTypes = {
    classes: PropTypes.object,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string,
    value: PropTypes.string.isRequired,
};

export default ButtonDanger;
