import React from 'react';
import styled from 'styled-components';
import {colors, hexColorToDecimal} from '../colors';

export const icon_sizes = {
	s24: '24px',
	s30: '30px',
	s36: '36px',
	s42: '42px',
	s48: '48px'
};

function getIconSize(props) {
	for(let key in icon_sizes) {
		if(key in props)
			return icon_sizes[key];
	}

	return icon_sizes['s24'];
}

const IconStyle = styled.i`
	font-size: ${props => getIconSize(props)};
	width: ${props => getIconSize(props)};
	height: ${props => getIconSize(props)};
	color: ${props => props.theme.style === 'dark' ? `${colors.white}` : `rgba(${hexColorToDecimal(colors.black)},0.54)`};
	text-shadow: none;
	font-weight: normal;
	line-height: ${props => getIconSize(props)};
	padding: 0;
	
	&:before {
		width: ${props => getIconSize(props)};
		height: ${props => getIconSize(props)};
	}
`;

/**
 * returns a styled i element for icons and provides convenience by allowing
 * the icon desired to be the child of the component. the child component will
 * have to be a string otherwise it may error
 * @param props
 * @returns {React.Component}
 */
const Icon = (props) => <IconStyle {...props} className='material-icons'>{props.children}</IconStyle>;

export default Icon;