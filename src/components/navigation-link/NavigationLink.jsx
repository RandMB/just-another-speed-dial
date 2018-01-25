import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import './NavigationLink.css';
import Label from '../common/label/Label';

function OptionsNavigation(props) {
    const classes = ClassNames({
        'navigation-link-container': true,
        selected: props.selected,
    });

    return (
        <div
            className={classes}
            onClick={props.onClick}
        >
            <Label classes={{ 'navigation-link': true }}>
                {props.icon}
                <span>{props.text}</span>
            </Label>
        </div>
    );
}

OptionsNavigation.propTypes = {
    text: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    icon: PropTypes.node,
    onClick: PropTypes.func,
};

export default OptionsNavigation;
