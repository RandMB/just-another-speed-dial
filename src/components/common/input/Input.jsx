import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import _debounce from 'lodash/debounce';

import './Input.css';

class Input extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.reportValue = this.reportValue.bind(this);

        this.debouncedReport = _debounce(this.reportValue, 300);
    }

    handleChange(event) {
        this.debouncedReport(event.target.value);
    }

    reportValue(value) {
        this.props.onChange(value);
    }

    render() {
        const { name, title, value, type, classes } = this.props;

        const inputClass = ClassNames({
            'input-group': true,
            ...classes,
        });

        return (
            <div className="input-group">
                <label htmlFor={name}>{title}</label>
                <input
                    className={inputClass}
                    onInput={this.handleChange}
                    name={name}
                    defaultValue={value}
                    type={type}
                />
            </div>
        );
    }
}

Input.defaultProps = {
    classes: {},
    value: '',
};

Input.propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    classes: PropTypes.object,
    value: PropTypes.string,
    type: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default Input;
