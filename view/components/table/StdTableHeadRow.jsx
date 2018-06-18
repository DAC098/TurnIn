import React from 'react';
import styled from 'styled-components';

const StdTableHeadRowStyle = styled.section`
	display: flex;
	position: sticky;
	top: ${props => props.top || 0};
	width: 100%;
	background-color: ${props => props.theme};
	border-bottom: 1px solid black;
	z-index: 1;
`;

function StdTableHeadRow(props) {
	return <StdTableHeadRowStyle top={props.top}>
		{props.children}
	</StdTableHeadRowStyle>
}

export default StdTableHeadRow;