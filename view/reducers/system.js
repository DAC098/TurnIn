import {
	REQUEST_CLOSE_SERVER,
	RESPONSE_CLOSE_SERVER
} from '../actions/system';

const initial_state = {
	req_close: {
		fetching: false,
		error: false,
		message: '',
		stack: '',
	}
};

const systemReducer = (state = initial_state,action) => {
	switch(action.type) {
		case REQUEST_CLOSE_SERVER:
			return {
				...state,
				req_close: {
					fetching: true,
					error: false,
					message: '',
					stack: ''
				}
			};
		case RESPONSE_CLOSE_SERVER:
			return {
				...state,
				req_close: {
					fetching: false,
					error: action.err,
					message: action.msg,
					stack: action.stack
				}
			};
		default:
			return state;
	}
};

export default systemReducer;