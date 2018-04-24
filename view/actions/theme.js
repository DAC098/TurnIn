import {colors,hexColorToDecimal} from '../colors';

export const SET_THEME = 'app/theme/set_theme';

export const THEMES = {
	'dark': {
		style: 'dark',
		status_bar: '#000000',
		app_bar: '#212121',
		background: '#303030',
		cards: '#424242',
		primary_one: colors.red500,
		primary_two: colors.red700,
		primary_thr: colors.red900,
		secondary: colors.blueA400,
		text: {
			primary: `rgb(${hexColorToDecimal('#ffffff')})`,
			secondary: `rgba(${hexColorToDecimal('#ffffff')},0.7)`,
			hint: `rgba(${hexColorToDecimal('#ffffff')},0.5)`
		}
	},
	'light': {
		style: 'light',
		status_bar: '#e0e0e0',
		app_bar: '#f5f5f5',
		background: '#fafafa',
		cards: '#ffffff',
		primary_one: colors.red500,
		primary_two: colors.red700,
		primary_thr: colors.red900,
		secondary: colors.blueA400,
		text: {
			primary: `rgba(${hexColorToDecimal('#000000')},0.87)`,
			secondary: `rgba(${hexColorToDecimal('#000000')},0.54)`,
			hint: `rgba(${hexColorToDecimal('#000000')},0.38)`
		}
	}
};

export const setTheme = type => ({type: SET_THEME,style: type in THEMES ? type : 'dark'});