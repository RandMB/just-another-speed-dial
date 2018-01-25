import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import './Label.css';

function Label(props) {
    const { htmlFor, children, classes } = props;

    const labelClass = ClassNames({
        ...classes,
    });

    const attr = {};

    if (htmlFor) {
        attr['htmlFor'] = htmlFor;
    }

    return (
        <label
            className={labelClass}
            {...attr}
        >
            {children}
        </label>
    );
}

Label.defaultProps = {
    classes: {},
};

Label.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    htmlFor: PropTypes.string,
    classes: PropTypes.object,
};

export default Label;
