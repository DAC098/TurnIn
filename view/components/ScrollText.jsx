import React, {Component} from 'react';
import styled, {keyframes} from 'styled-components';

const animation = keyframes`
	0% {
		margin-left: 0%;
	}
	
	45.4% {
		margin-left: -75%;
	}
	
	90.9% {
		margin-left: 0%;
	}
	
	100% {
		margin-left: 0%;
	}
`;

const ScrollDiv = styled.div`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	
	span.animate {
		margin-left: 0;
		animation: ${animation} 11s ease;
		animation-delay: .5s;
		animation-iteration-count: infinite;
	}
`;

/**
 * allows a string of text to scroll if it does not fit within the container
 */
class ScrollText extends Component {
	constructor(props) {
		super(props);

		this.state = {
			active: false,
			run: false
		};
		this.ele = {};
	}

	/**
	 * sets the state to start scrolling the text
	 */
	startRun() {
		let obj = {
			run: true
		};

		if(this.ele.div.offsetWidth < this.ele.span.offsetWidth)
			obj['active'] = true;

		this.setState(() => (obj));
	}

	/**
	 * sets the state to stop scrolling the text
	 */
	stopRun() {
		this.setState(() => ({run:false}));
	}

	render() {
		let {state,props} = this;
		return <ScrollDiv
			{...props}
			innerRef={ele => {
				this.ele.div = ele
			}}
			onMouseOver={() => this.startRun()}
			onMouseOut={() => this.stopRun()}
		>
			<span
				ref={ele => {
					this.ele.span = ele
				}}
				className={state.active && state.run ? 'animate' : null}
			>
				{props.children}
				</span>
		</ScrollDiv>
	}
}

export default ScrollText;