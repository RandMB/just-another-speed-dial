import React from 'react';
import PropTypes from 'prop-types';

import './OptionsNavigation.css';
import NavigationLink from '../navigation-link/NavigationLink';

function navigate(hash) {
    if (window.location.hash !== hash) {
        window.location.hash = hash;
    }
}

function OptionsNavigation(props) {
    return (
        <div className="navigation-links">
            <NavigationLink
                text="General"
                icon={<i className="fas fa-wrench fa-lg" />}
                selected={props.selected === '' || props.selected === '#general'}
                onClick={() => navigate('#general')}
            />

            <NavigationLink
                text="Appearance"
                icon={<i className="fas fa-paint-brush fa-lg" />}
                selected={props.selected === '#appearance'}
                onClick={() => navigate('#appearance')}
            />

            <NavigationLink
                text="Advanced"
                icon={<i className="fas fa-cogs fa-lg" />}
                selected={props.selected === '#advanced'}
                onClick={() => navigate('#advanced')}
            />
        </div>
    );
}

OptionsNavigation.propTypes = {
    selected: PropTypes.string,
};

export default OptionsNavigation;
