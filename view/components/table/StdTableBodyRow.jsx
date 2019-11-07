import React from 'react';
import styled from 'styled-components';

import {
	loopThruCols,
	getValue,
	checkIndexIfViewOverridden
} from './common';
import StdTableBodyCell from './StdTableBodyCell';
import {colors} from '../../colors';


/**
 * creates a basic table that is filled with the information provided by
 * the record given. the data can be custom rendered or will just insert
 * the value given by the name of the column
 */
class StdTableBodyRowBase extends React.Component {
	/**
	 * creates standard table cells for a row
	 * @returns {Array}
	 */
	getRows() {
		let rtn = [];

		loopThruCols(this.props.columns,(key,val) => {
			let cell_val = val.render ?
				val.render(this.props.record) :
				getValue(val.name,this.props.record);

			let w = this.props.widths.get(key);

			if(checkIndexIfViewOverridden(this.props.viewOverride,key))
				return null;

			rtn.push(<StdTableBodyCell
				key={key}
				width={w.width + '%'}
			>
				{cell_val}
			</StdTableBodyCell>);
		});

		return rtn;
	}

	render() {
		return <div className={this.props.className}>
			{this.getRows()}
		</div>
	}
}

export const StdTableBodyRow = styled(StdTableBodyRowBase)`
	display: flex;
	position: relative;
	
	background-color: ${props => props.odd_row ? colors.m.gray300 : 'rgba(0,0,0,0)'};
`;

export default StdTableBodyRow;