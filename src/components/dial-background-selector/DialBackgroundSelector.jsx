/* eslint react/no-unused-state: 0 */
// complains what color state field is unused

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import './DialBackgroundSelector.css';
import Input from '../common/input/Input';
import Select from '../common/select/Select';
import browserUtils from '../../utils/browser';

const selectOptions = Object.assign(
    Object.create(null),
    {
        color: 'Solid color fill',
        image: 'Background image',
        colorImage: 'Solid color with an image',
    },
);

const optionsArray = Object.entries(selectOptions);


class DialBackgroundSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            backgroundType: props.data.backgroundType || optionsArray[0][0],
            backgroundImage: props.data.backgroundImage,
            background: props.data.background,
            color: props.data.color,
        };

        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
    }

    handleSelectChange(value) {
        const newValue = { backgroundType: value };
        this.setState(newValue);

        this.props.onBackgroundChange(Object.assign(
            {},
            this.state,
            newValue,
        ));
    }

    async handleColorChange(bgColor) {
        const textColor = await browserUtils.colors.getTextColor(bgColor);

        const newValue = {
            background: bgColor,
            color: textColor,
        };

        this.setState(newValue);

        this.props.onBackgroundChange(Object.assign(
            {},
            this.state,
            newValue,
        ));
    }

    handleImageChange(url) {
        const newValue = { backgroundImage: url };
        this.setState(newValue);

        this.props.onBackgroundChange(Object.assign(
            {},
            this.state,
            newValue,
        ));
    }

    render() {
        const { backgroundType, background, backgroundImage } = this.state;
        const { type } = this.props;

        return (
            <Fragment>

                {type === 'bookmark' &&
                    <Select
                        selected={backgroundType}
                        onChange={this.handleSelectChange}
                        options={optionsArray}
                        name="bgTypeSelect"
                        label="Select type of background: "
                    />
                }


                {(backgroundType === 'color' || backgroundType === 'colorImage') &&
                    <Input
                        name="color"
                        classes={{ 'input-color': true }}
                        title="Choose a background color:"
                        type="color"
                        onChange={this.handleColorChange}
                        value={background}
                    />
                }

                {type === 'bookmark' &&
                    (backgroundType === 'image' || backgroundType === 'colorImage') &&
                    <Input
                        name="imageUrl"
                        title="Image url:"
                        type="text"
                        onChange={this.handleImageChange}
                        value={backgroundImage}
                    />
                }

            </Fragment>
        );
    }
}

DialBackgroundSelector.propTypes = {
    data: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    onBackgroundChange: PropTypes.func.isRequired,
};

export default DialBackgroundSelector;
