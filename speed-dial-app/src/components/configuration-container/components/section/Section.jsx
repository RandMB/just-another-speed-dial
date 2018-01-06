import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SectionHeader from '../section-header/SectionHeader';

import './Section.css';

class Section extends Component {
    transitionEnded(event) {
        // Do not trigger this for main section, it is never removed or added
        if (!this.props.isMain) {
            // If the element was marked for removal
            if (this.props.isRemoved) {
                this.props.onRemoved();
            } else {
                // The element has finished opened
                this.props.onOpened();
            }
        }
    }

    componentDidMount() {
        // Reacts calls this lifecycle method too soon,
        //   so we need to use raf and a callback to add our transition class
        // Used for appearance animation, main section does't need animation, ignore
        if (!this.props.isMain) {
            window.requestAnimationFrame(() => {
                this.props.onMounted();
            });
        }
    }

    render() {
        const {
            isMain,
            sectionName,
            onBack,
            onClose,
            isOpen,
            children,
            zIndex,
        } = this.props;

        let sectionClass = 'section';
        sectionClass += !isMain ? ' section-subsection' : '';
        sectionClass += isOpen ? ' section-open' : '';

        let sectionStyle = {
            zIndex: zIndex
        };

        return (
            <div className={sectionClass}
                style={sectionStyle}
                onTransitionEnd={(event) => this.transitionEnded(event)}>

                <SectionHeader
                    sectionName={sectionName}
                    onBack={onBack}
                    onClose={onClose}
                    isMain={isMain}>
                </SectionHeader>

                <div className="section-content">
                    {children}
                </div>

            </div>
        );
    }
}

Section.propTypes = {
    sectionName: PropTypes.string,
    onBack: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    onRemoved: PropTypes.func,
    onMounted: PropTypes.func,
    onOpened: PropTypes.func,
    isMain: PropTypes.bool,
    children: PropTypes.node,
    isOpen: PropTypes.bool,
    isRemoved: PropTypes.bool,
    zIndex: PropTypes.number,
};


export default Section;