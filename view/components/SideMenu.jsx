import styled from 'styled-components';

import {colors,hexColorToDecimal} from '../colors';

import React  from 'react';
import {Motion,spring}  from 'react-motion';

import {IconButton} from './Buttons';

class SideMenuBase extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: props.visible,
			animating: false
		};
	}

	static getDerivedStateFromProps(next_props,prev_state) {
		let rtn = {};

		if(next_props.visible !== prev_state.visible) {
			if(!prev_state.animating) {
				rtn['visible'] = next_props.visible;
				rtn['animating'] = true;
			} else {
				rtn['visible'] = next_props.visible;
			}
		}

		return rtn;
	}

	getContents(style) {
		let mod_style = this.state.visible ? null : {'display': 'none'};

		return <section
			style={this.state.animating ? null : mod_style}
			className={this.props.className}
		>
			<div style={this.state.animating ? {transform: `translateX(${style.left}%)`,[this.props.position]: 0} : {[this.props.position]: 0}}>
				<IconButton style={{position: 'absolute',top: 0,right: 0}} onClick={() => {
					this.props.onClose();
				}}>
					close
				</IconButton>
				{this.props.children}
			</div>
			<div
				style={this.state.animating ? {transform: `translateX(${style.left}%)`,[this.props.position]: 0} : {[this.props.position]: 0}}
				onClick={() => this.props.onClose()}
			/>
		</section>
	}

	render() {
		return <Motion
			style={{
				left: spring(this.state.visible ? 0 : this.props.position === 'left' ? -100 : 100)
			}}
			onRest={() => {
				this.setState((prev_state,props) => {
					return {animating: false}
				})
			}}
		>
			{style => {
				return this.getContents(style)
			}}
		</Motion>
	}
}

SideMenuBase.defaultProps = {
	onClose: () => {
		console.log('SideMenu: no onClose prop given');
	}
};

const SideMenu = styled(SideMenuBase)`
	position: fixed;
	top: 0;
	z-index: 50;
	
	& > div:first-child {
		background-color: ${colors.white};
		height: 100vh;
		width: 240px;
		position: absolute;
		top: 0;
		z-index: 1;
	}
	
	& > div:last-child {
		position: absolute;
		top: 0;
		background-color: rgba(${props => hexColorToDecimal(props.theme.cards)},0.5);
		width: 100vw;
		height: 100vh;
	}
	
	${props => `${props.position}: 0`};
`;

export default SideMenu;