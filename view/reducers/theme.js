import {
	SET_THEME,
	THEMES
} from '../actions/theme';

const initial_state = {
	style: 'dark'
};

const themeReducer = (state = initial_state,action) => {
	switch(action.type) {
		case SET_THEME:
			return {
				...state,
				style: action.style
			};
		default:
			return state;
	}
};

export default themeReducer;