import React from'react';
import styled from 'styled-components';

import CollapsePanel from '../CollapsePanel';

import {colors} from '../../colors';

/**
 * is used to create a custom table row that will display additional
 * information when clicked on
 */
class StdTableDetailRowBase extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: false
		};
	}

	/**
	 * sets the state for visible based off of the previous state of visible
	 */
	handleClick() {
		this.setState(prev_state => {
			return {visible: !prev_state.visible}
		});
	}

	render() {
		return <div
			className={this.props.className}
			onClick={event => this.handleClick(event)}
		>
			<div>
				{this.props.children}
			</div>
			<CollapsePanel
				visible={this.state.visible}
				noAnimate={this.props.noAnimate}
			>
				{this.props.rowDetail ? this.props.rowDetail(this.props.record) : null}
			</CollapsePanel>
		</div>
	}
}

const StdTableDetailRow = styled(StdTableDetailRowBase)`
	background-color: ${props => props.odd_row ? colors.m.gray300 : 'rgba(0,0,0,0)'};
	
	&:hover {
		cursor: pointer;
	}
	
	@media print {
		> div:last-child {
			display: initial !important;
		}
	}
`;

export default StdTableDetailRow;