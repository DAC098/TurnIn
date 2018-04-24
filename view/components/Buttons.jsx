import styled from 'styled-components';
import React from 'react';

import clone from 'lodash/clone';

import Icon from './Icon';
import {colors} from '../colors';

/**
 * provides default styling for buttons
 */
export const Button = styled.button`
	border: none;
	padding: 0 12px;
	margin: 4px;
	appearance: none;
	border-radius: 2px;
	min-width: 50px;
	min-height: ${props => props.mini ? '30px' : '50px'};
	background-color: ${props => props.primary ? props.theme.primary01 : props.theme.primaryA01};
	color: white;
	
	cursor: pointer;
	
	&:disabled {
		background-color: ${props => colors.gray400}
	}
`;

const ActionButtonBase = function(props) {
	let size = {};
	let mod_props = clone(props);

	if('size' in props) {
		size[props.size] = true;
		mod_props.size = undefined;
	}

	if('mini' in props)
		mod_props.mini = undefined;

	return <button {...mod_props}>
		<Icon {...size}>{props.children}</Icon>
	</button>
};

export const ActionButton = styled(ActionButtonBase)`
	position: relative;
	width: ${props => props.mini ? '40px' : '56px'};
	height: ${props => props.mini ? '40px' : '56px'};
	border-radius: 50%;
	border: none;
	appearance: none;
	background-color: ${props => props.theme.primaryA01};
	padding: 0;
`;

/**
 * provides styling for buttons that contain an icon inside them
 */
export const IconButton = styled.button`
	background-color: initial;
	border: none;
	padding: 0;
	appearance: none;
	cursor: pointer;
	margin-top: 0;
	margin-bottom: 0;
	text-shadow: none;
	font-size: initial;
	font-weight: normal;
	border-radius: 0;
	
	&:hover:not(:active):not(:disabled), 
	&:hover,
	&:focus:not(:active):not(:disabled),
	&:focus,
	&:active:not(:disabled) {
		background-color: initial;
		border-bottom-color: initial;
	}
	
	i {
		background-color: ${props => props.primary ? props.theme.primaryA02 : 'rgba(0,0,0,0)'};
		padding: 4px;
		transition: 200ms;
		border-radius: 50%;
		
		&:hover {
			background-color: ${props => props.primary ? props.theme.primaryA02 : props.theme.primaryA02};
		}
	}
`;