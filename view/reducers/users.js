import {
	REQUEST_USER_LIST,
	RESPONSE_USER_LIST
} from '../actions/users';

const initial_state = {
	req_user_list: {
		fetching: false,
		error: false,
		message: ''
	},
	user_list: []
};

const usersReducer = (state = initial_state,action) => {
	switch(action.type) {
		case REQUEST_USER_LIST:
			return {
				...state,
				req_user_list: {
					fetching: true,
					error: false,
					message: ''
				}
			};
		case RESPONSE_USER_LIST:
			return {
				...state,
				req_user_list: {
					fetching: false,
					error: action.err,
					message: action.msg
				},
				user_list: action.err ? state.user_list : action.data.result
			};
		default:
			return state;
	}
};

export default usersReducer;