import React from 'react';
import styled from 'styled-components';

import {colors} from '../colors';

const MenuOption = styled.div`
	min-height: 40px;
	padding-left: 8px;
	
	display: flex;
	align-items: center;
	
	cursor: pointer;
	
	border-bottom: 1px solid ${colors.gray400};
`;

export default MenuOption;