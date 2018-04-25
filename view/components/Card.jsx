import React from 'react';
import styled from 'styled-components';

import {colors} from '../colors';

function getPrimaryOffset(num,top = true) {
	return (top ? [1.5,3,10,14,19] : [1.5,3,6,10,15])[num - 1];
}

function getBlur(num,top = true) {
	return (top ? [1,3,10,14,19] : [1,3,3,5,6])[num - 1]
}

function getColor(num,top = true) {
	return (top ? [.12,.16,.19,.25,.30] : [.24,.23,.23,.22,.22])[num - 1]
}

export function topShadow(depth) {
	return `0 ${getPrimaryOffset(depth)}px ${getBlur(depth)}px rgba(0,0,0,${getColor(depth)})`;
}

export function bottomShadow(depth) {
	return `0 ${getPrimaryOffset(depth,false)}px ${getBlur(depth,false)}px rgba(0,0,0,${getColor(depth,false)})`;
}

export function getCardShadow(depth = 1) {
	if(depth >= 1 && depth <= 5)
		return `box-shadow: ${bottomShadow(depth)}, ${topShadow(depth)};`;
	else
		return `box-shadow: none;`;
}

/**
 * creates a floating card to give depth to the element
 */
export const Card = styled.div`
	${props => getCardShadow(props.depth)}
	position: relative;
	background-color: ${props => props.theme.cards};
	box-sizing: border-box;
	padding: 8px;
	margin: 8px;
	
	width: fit-content;
	transition: box-shadow ${props => (props.transition || 0) + 'ms'} ${props => props.timing || 'ease'} ${props => (props.delay || 0) + 'ms'};
	
	&:hover {
		${props => getCardShadow(props.hover_depth || props.depth)}
	}
`;

export default Card;