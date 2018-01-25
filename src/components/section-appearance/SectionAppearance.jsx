import React from 'react';
import PropTypes from 'prop-types';

import './SectionAppearance.css';
import Section from '../common/section/Section';
import Input from '../common/input/Input';

function SectionAppearance(props) {
    return (
        <Section >
            <Input
                name="width"
                title="Width of dial (in px)"
                type="text"
                classes={{ 'input-small': true }}
                onChange={(value) => props.onChange({ dialWidth: +value })}
                value={props.config.dialWidth}
            />

            <Input
                name="height"
                title="Height of dial (in px)"
                type="text"
                classes={{ 'input-small': true }}
                onChange={(value) => props.onChange({ dialHeight: +value })}
                value={props.config.dialHeight}
            />
        </Section>
    );
}

SectionAppearance.propTypes = {
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default SectionAppearance;
