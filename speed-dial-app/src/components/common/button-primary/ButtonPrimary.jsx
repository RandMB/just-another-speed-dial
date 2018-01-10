import React from 'react';
import PropTypes from 'prop-types';

import Button from '../button/Button';

import './ButtonPrimary.css';

function ButtonPrimary(props) {
    const classes = {
        'button-primary': true,
        ...props.classes,
    };

    return (
        <Button
            classes={classes}
            onClick={props.onClick}
            title={props.title}
            value={props.value}>
        </Button>
    );
}

ButtonPrimary.propTypes = {
    classes: PropTypes.object,
    onClick: PropTypes.func,
    title: PropTypes.string,
    value: PropTypes.string,
};

export default ButtonPrimary;
