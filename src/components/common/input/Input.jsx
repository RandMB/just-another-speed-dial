import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
        const { name, title, value, type } = this.props;

        return (
            <div className="input-group">
                <label htmlFor={name}>{title}</label>
                <input
                    onInput={this.handleChange}
                    name={name}
                    defaultValue={value}
                    type={type}
                />
            </div>
        );
    }
}

Input.propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.string,
    type: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default Input;
