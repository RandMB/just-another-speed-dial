import React, { Component } from 'react';
import PropTypes from 'prop-types';

import urls from '../../utils/urls';

import './DialBookmark.css';

function getText(local) {
    const hostname = local.domain || local.hostname || local.url || '';

    if (local.domain) {
        // &nbsp; is used to center align even when url parts are empty
        return (
            <div className="dial-bookmark-text">
                <div className="dial-bookmark-subdomain">
                    {local.subdomain ? <p>{local.subdomain}</p> : <p>&nbsp;</p>}
                </div>
                <div className="dial-bookmark-domain">
                    <p>{local.domain}</p>
                </div>
                <div className="dial-bookmark-suffix">
                    {local.suffix ? <p>{local.suffix}</p> : <p>&nbsp;</p>}
                </div>
            </div>
        );
    } else {
        return <p draggable="false">{hostname}</p>;
    }
}

class DialBookmark extends Component {
    constructor(props) {
        super(props);

        this.messageSent = false;
        this.checkDomain(props);

        this.checkDomain = this.checkDomain.bind(this);
    }

    componentWillReceiveProps(newProps) {
        this.checkDomain(newProps);
    }

    checkDomain(props) {
        const { data, local } = props.data;

        // Only relevant if the background type is not set ir it is solid color
        if (!data.backgroundType || data.backgroundType === 'color') {
            // Only update if not cached already
            if (props.url !== local.url && !this.messageSent) {
                this.messageSent = true;

                urls.parse(props.url).then((msg) => {
                    this.props.onUpdate({
                        data: {
                            local: {
                                ...msg,
                            },
                        },
                    });

                    this.messageSent = false;
                });
            }
        }
    }

    render() {
        const { data, local } = this.props.data;

        const tileStyle = {
            backgroundColor: data.background || '#ffffff',
            color: data.color || '#000000',
        };

        if (data.backgroundType === 'colorImage' || data.backgroundType === 'image') {
            tileStyle.backgroundImage = `url("${data.backgroundImage}")`;
        }

        if (data.backgroundType === 'image') {
            tileStyle.backgroundColor = '#ffffff';
            tileStyle.backgroundSize = 'cover';
        }

        return (
            <div style={tileStyle} className="dial-tile-bookmark">
                {(!data.backgroundType || data.backgroundType === 'color') &&
                    getText(local)
                }
            </div>
        );
    }
}

DialBookmark.propTypes = {
    // Prop is used indirectly in check domain
    // eslint-disable-next-line react/no-unused-prop-types
    url: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default DialBookmark;
