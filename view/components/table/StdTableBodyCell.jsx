import React from 'react';
import styled from 'styled-components';

function StdTableBodyCellBase(props) {
	return <div className={props.className} style={{width: props.width || 'auto'}}>{props.children}</div>;
}

export const StdTableBodyCell = styled(StdTableBodyCellBase)`
	position: relative;
	padding: 0;
	
	@media screen {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
`;

export default StdTableBodyCell;