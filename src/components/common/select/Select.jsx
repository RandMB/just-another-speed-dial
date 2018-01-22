import React from 'react';
import PropTypes from 'prop-types';

import './Select.css';

function Select(props) {
    return (
        <div className="input-group">
            <label htmlFor={props.name}>{props.label}</label>
            <select
                name={props.name}
                value={props.selected}
                onChange={(event) => props.onChange(event.target.value)}
            >
                {props.options.map((option) => {
                    return <option key={option[0]} value={option[0]}>{option[1]}</option>;
                })}
            </select>
        </div >
    );
}

Select.propTypes = {
    selected: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default Select;
