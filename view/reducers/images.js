import {
	REQUEST_IMAGE_LIST, RESPONSE_IMAGE_LIST
} from '../actions/images';

const initial_state = {
	req_image_list: {
		fetching: false,
		error: false,
		message: '',
		stack: ''
	},
	image_list: []
};

const imagesReducer = (state = initial_state,action) => {
	switch(action.type) {
		case REQUEST_IMAGE_LIST:
			return {
				...state,
				req_image_list: {
					fetching: true,
					error: false,
					message: '',
					stack: ''
				}
			};
		case RESPONSE_IMAGE_LIST:
			return {
				...state,
				req_image_list: {
					fetching: false,
					error: action.err,
					message: action.msg,
					stack: action.stack
				},
				image_list: action.err ? state.image_list : action.data
			};
		default:
			return state;
	}
};

export default imagesReducer;