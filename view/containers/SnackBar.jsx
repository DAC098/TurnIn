import React from 'react';
import {createPortal} from 'react-dom';
import styled from 'styled-components';

class SnackBarBase extends React.Component {
	constructor(props) {
		super(props);

		this.container = document.getElementById('snack-bar-container');
		this.state = {};
	}

	render() {
		return createPortal(
			<div className={this.props.className}>
				{this.props.children}
			</div>,
			this.container
		);
	}
}

export const SnackBar = styled(SnackBarBase)`
	z-index: 250;
	position: absolute;
	bottom: 0;
	left: 50%;
	background-color: white;
	
	padding: 8px;
	height: 24px;
	min-width: 120px;
	
	transform: translateX(-50%);
`;

export default SnackBar;