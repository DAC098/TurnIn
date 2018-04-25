import React from 'react'
import {createPortal} from 'react-dom';
import Card from '../components/Card';
import styled from 'styled-components';

const container = document.createElement('div');

document.addEventListener('DOMContentLoaded',() => {
	document.body.appendChild(container);
});

const ModalStyle = styled.div`
	z-index: 500;
	position: absolute;
	transform: translate(-50%,-50%);
	top: 50%;
	left: 50%;
`;

/**
 * creates a modal in the DOM using React Portals in order to render the
 * element in a different location but keep in the render process of the
 * element requesting it
 */
class Modal extends React.Component {
	constructor(props) {
		super(props);
		this.container = container;
		this.state = {};
	}

	render() {
		return createPortal(
			<ModalStyle>
				<Card depth={this.props.depth}>
					{this.props.children}
				</Card>
			</ModalStyle>,
			this.container
		);
	}
}

Modal.defaultProps = {
	onClose: () => {},
	timer: false
};

export default Modal;