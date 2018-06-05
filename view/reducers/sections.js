import {
	REQUEST_SECTION_LIST,
	RESPONSE_SECTION_LIST
} from '../actions/sections';

const initial_state = {
	req_section_list: {
		fetching: false,
		error: false,
		message: '',
		stack: '',
	},
	section_list: []
};

const sectionsReducer = (state = initial_state,action) => {
	switch(action.type) {
		case REQUEST_SECTION_LIST:
			return {
				...state,
				req_section_list: {
					fetching: true,
					error: false,
					message: '',
					stack: ''
				}
			};
		case RESPONSE_SECTION_LIST:
			return {
				...state,
				req_section_list: {
					fetching: false,
					error: action.err,
					message: action.msg,
					stack: action.stack
				},
				section_list: action.err ? state.section_list : action.data
			};
		default:
			return state;
	}
};

export default sectionsReducer;