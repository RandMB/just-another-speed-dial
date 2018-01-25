import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';

import './SectionAdvanced.css';
import Section from '../common/section/Section';
import Button from '../common/button/Button';

import utils from '../../utils/browser';
import ConfirmDialog from '../common/confirm-dialog/ConfirmDialog';

const CONFIRM_TEXT = 'Are you sure you want to reset data? This action cannot be undone.';

class SectionAdvanced extends Component {
    constructor(props) {
        super(props);

        this.state = {
            resetConfirm: false,
            resetConfirmShown: false,
        };

        this.onResetConfirm = this.onResetConfirm.bind(this);
    }

    onResetConfirm() {
        utils.storage.local.clear().then();

        this.setState({ resetConfirmShown: false });
    }

    render(props) {
        return (
            <Section >
                <Button
                    onClick={() => this.setState({ resetConfirm: true, resetConfirmShown: true })}
                    value="Clear local storage"
                    title="Clear extensions local storage"
                />

                {this.state.resetConfirm &&
                    <Portal node={document && document.getElementById('modals')}>
                        <ConfirmDialog
                            in={this.state.resetConfirmShown}
                            appear={false}
                            text={CONFIRM_TEXT}
                            onConfirm={this.onResetConfirm}
                            onCancel={() => this.setState({ resetConfirmShown: false })}
                            onExited={() => this.setState({ resetConfirm: false })}
                        />
                    </Portal>
                }
            </Section>
        );
    }
}

SectionAdvanced.propTypes = {
};

export default SectionAdvanced;
