import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './SpeedDialItem.css';
import folderImage from '../../../../assets/folder.png';

class SpeedDialItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inTransition: false,
            transitionDuration: 0,
            currentPosX: props.data.view.dialPosX,
            currentPosY: props.data.view.dialPosY,
        };

        this.onClick = this.onClick.bind(this);
        this.onTransitionEnd = this.onTransitionEnd.bind(this);
    }

    componentWillReceiveProps(newProps) {
        const viewData = newProps.data.view;

        if (viewData.dialPosX !== this.state.currentPosX ||
            viewData.dialPosY !== this.state.currentPosY) {
            
            this.setState({
                currentPosX: viewData.dialPosX,
                currentPosY: viewData.dialPosY,
                transitionDuration: 0.25,
                inTransition: true,
            });
        }
    }

    onClick(event) {
        if (this.props.node.type === 'folder') {
            this.props.onOpenFolder(this.props.node.id);
        } else if (this.props.node.type === 'bookmark') {
            window.location.href = this.props.node.url;
        }
    }

    onTransitionEnd() {
        if (this.state.inTransition) {
            this.setState({
                inTransition: false,
                //transitionDuration: 0,
            });
        }
    }

    render() {
        const {
            title,
            type,
            url,
        } = this.props.node;

        const {
            view
        } = this.props.data;

        const dialStyle = {
            transform: `translate3D(${view.dialPosX}px,${view.dialPosY}px,0)`,
            transitionDuration: `${this.state.transitionDuration}s`,
        };

        return (
            <div
                onClick={this.onClick}
                className="dial-item-container"
                style={dialStyle}
                onTransitionEnd={this.onTransitionEnd}>

                <div
                    className="dial-tile rounded-borders"
                    title={url}>

                    {type === 'folder' &&
                        <img alt="" src={folderImage} />
                    }
                    {type === 'bookmark' &&
                        <a>{new URL(url).host}</a>
                    }
                </div>
                <div className="dial-title-container">
                    <div
                        className="dial-title-background"
                        title={title}>

                        <a>{title}</a>
                    </div>
                </div>
            </div>
        );
    }
}

SpeedDialItem.propTypes = {
    node: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onOpenFolder: PropTypes.func.isRequired,
};

export default SpeedDialItem;