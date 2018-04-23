import React from 'react';
import {connect} from 'react-redux';
import {ThemeProvider as StyledThemeProvider} from 'styled-components';

import {THEMES} from '../actions/theme';

let body = null;

document.addEventListener('DOMContentLoaded',() => {
	body = document.getElementsByTagName('body')[0];
});

const ThemeProvider = (props) => {
	if(body !== null) {
		body.attributeStyleMap.set('background-color',THEMES[props.style].background);
		body.attributeStyleMap.set('color',THEMES[props.style].text.primary);
	}

	return (
		<StyledThemeProvider theme={THEMES[props.style]}>
			{props.children}
		</StyledThemeProvider>
	);
};

export default connect(
	state => ({
		style: state.theme.style
	}),
	() => ({})
)(ThemeProvider);
