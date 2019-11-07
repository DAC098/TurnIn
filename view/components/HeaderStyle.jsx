import React from 'react';
import styled from 'styled-components';

const HeaderStyle = styled.header`
	height: 4em;
	background-color: ${props => props.theme.app_bar};
	position: sticky;
	top: 0;
`;

export default HeaderStyle;