import React from 'react';
import ReactDOM from 'react-dom';
import OptionsApp from './OptionsApp';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<OptionsApp />, div);
});
