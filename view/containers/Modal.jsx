import React from 'react'
import {createPortal} from 'react-dom';
import Card from '../components/Card';
import styled from 'styled-components';

const container = document.createElement('div');

document.addEventListener('DOMContentLoaded',() => {
	document.body.appendChild(container);
});

/**
 * creates a modal in the DOM using React Portals in order to render the
 * element in a different location but keep in the render process of the
 * element requesting it
 */
class ModalBase extends React.Component {
	constructor(props) {
		super(props);
		this.container = container;
		this.state = {};
	}

	render() {
		return createPortal(
			<div className={this.props.className}>
				<Card depth={this.props.depth}>
					{this.props.children}
				</Card>
			</div>,
			this.container
		);
	}
}

const Modal = styled(ModalBase)`
	z-index: 500;
	position: absolute;
	transform: translate(-50%,-50%);
	top: 50%;
	left: 50%;
`;

export default Modal;