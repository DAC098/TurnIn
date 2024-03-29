import {
	REQUEST_USER_DATA,
	REQUEST_USER_LIST, RESPONSE_USER_DATA,
	RESPONSE_USER_LIST
} from '../actions/users';

const initial_state = {
	req_user_list: {
		fetching: false,
		error: false,
		message: '',
		stack: ''
	},
	user_list: [],
	req_user_data: {
		fetching: false,
		error: false,
		message: '',
		stack: ''
	},
	user_data: null
};

const usersReducer = (state = initial_state,action) => {
	switch(action.type) {
		case REQUEST_USER_LIST:
			return {
				...state,
				req_user_list: {
					fetching: true,
					error: false,
					message: '',
					stack: ''
				}
			};
		case RESPONSE_USER_LIST:
			return {
				...state,
				req_user_list: {
					fetching: false,
					error: action.err,
					message: action.msg,
					stack: action.stack
				},
				user_list: action.err ? state.user_list : action.data
			};
		case REQUEST_USER_DATA:
			return {
				...state,
				req_user_data: {
					fetching: true,
					error: false,
					message: '',
					stack: ''
				}
			};
		case RESPONSE_USER_DATA:
			return {
				...state,
				req_user_data: {
					fetching: false,
					error: action.err,
					message: action.msg,
					stack: action.stack
				},
				user_data: action.err ? state.user_data : action.data
			};
		default:
			return state;
	}
};

export default usersReducer;