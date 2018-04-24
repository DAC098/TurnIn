import React, {Component} from 'react';
import {Motion,spring} from 'react-motion';

/**
 * a collapsible panel that will manage some internal state so that it does
 * not have to be managed by the parent component asking for this
 */
export default class CollapsePanel extends Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: props.visible,
			animating: false,
			prep: false,
			height: 0
		};
		this.ele = {};
	}

	UNSAFE_componentWillReceiveProps(next_props) {
		if(next_props.visible !== this.props.visible)
			this.handleView(next_props.visible)
	}

	handleView(display) {
		if(!this.state.animating) {
			if(this.state.visible) {
				this.setState({
					height: this.ele.contents.clientHeight,
					prep: true
				},() => {
					this.setState({
						visible: display,
						animating: true,
						prep: false
					});
				})
			} else {
				this.setState({
					animating: true
				},() => {
					this.setState({
						visible: display,
						height: this.ele.contents.clientHeight
					});
				});
			}
		} else {
			this.setState({
				visible: display
			});
		}
	}

	/**
	 * calls props.onClick if given or will run the internal one if
	 * auto_collapse is given. onClick takes precedence
	 */
	handleClick() {
		if(this.props.onClick)
			this.props.onClick();
		else if(this.props.auto_collapse)
			this.handleView(!this.state.visible);
	}

	/**
	 * sets the appropriate style for the collapsible element and renders the
	 * children given to the component
	 * @param style {Object}
	 * @returns {React.Component}
	 */
	getContents(style) {
		let mod_style = this.state.visible ? null : {'display':'none'};

		return <section
			className={this.props.className}
			onClick={() => this.handleClick()}
		>
			<div
				style={this.state.animating ? {
						height: style.height,
						overflow: 'hidden'
					} :
					mod_style
				}
			>
				<section
					ref={ele => {this.ele.contents = ele;}}
				>
					{this.props.children}
				</section>
			</div>
		</section>
	}

	render() {
		return <Motion
			style={{
				height: this.state.prep ? this.state.height : spring(!this.state.visible ? 0 : this.state.height)
			}}
			onRest={() => {
				this.setState(() => {
					return {animating: false};
				});
			}}
		>
			{style => {
				return this.getContents(style);
			}}
		</Motion>;
	}
}

CollapsePanel.defaultProps = {
	auto_collapse: true,
	visible: false
};