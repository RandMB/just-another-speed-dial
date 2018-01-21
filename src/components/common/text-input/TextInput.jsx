import React, { Component } from 'react';
import PropTypes from 'prop-types';

import _debounce from 'lodash/debounce';

import './TextInput.css';

class TextInput extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.reportValue = this.reportValue.bind(this);

        this.debouncedReport = _debounce(this.reportValue, 400);
    }

    handleChange(event) {
        this.debouncedReport(event.target.value);
    }

    reportValue(value) {
        this.props.onChange(value);
    }

    render() {
        const { name, title, value } = this.props;

        return (
            <div className="input-group">
                <label htmlFor={name}>{title}</label>
                <input
                    onInput={this.handleChange}
                    name={name}
                    defaultValue={value}
                    type="text"
                />
            </div>
        );
    }
}

TextInput.propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

export default TextInput;
