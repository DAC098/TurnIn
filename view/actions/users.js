import req from '../lib/request';

export const REQUEST_USER_LIST = 'app/request/users/list';
export const RESPONSE_USER_LIST = 'app/response/users/list';

export const requestUserList = () => ({
	type: REQUEST_USER_LIST
});

export const responseUserList = (err,msg,data) => ({
	type: RESPONSE_USER_LIST,
	err: err,
	msg,
	stack: err ? (data || '') : '',
	data: err ? null : data
});

export const getUserList = () => async dispatch => {
	try {
		dispatch(requestUserList());

		let res = await req.get('/users/');

		let json = await res.json();

		if(res.status === 200) {
			dispatch(responseUserList(false,'',json));
		} else {
			dispatch(responseUserList(true,json.message,json.stack));
		}
	} catch(err) {
		dispatch(responseUserList(true,err.message))
	}
};

export const REQUEST_USER_DATA = 'app/request/users/data';
export const RESPONSE_USER_DATA = 'app/response/users/data';

export const requestUserData = (user_id) => ({
	type: REQUEST_USER_DATA,
	user_id
});

export const responseUserData = (err,msg,data) => ({
	type: RESPONSE_USER_DATA,
	err,
	msg,
	stack: err ? (data || '') : '',
	data: err ? null : data
});

export const getUserData = (user_id) => async dispatch => {
	try {
		dispatch(requestUserData(user_id));

		let res = await req.get(`/users/${user_id}`);

		let json = await res.json();

		if(res.status === 200) {
			dispatch(responseUserData(false,'',json));
		} else if (res.status >= 500) {
			dispatch(responseUserData(true,json.message,json.stack))
		} else {
			dispatch(responseUserData(true,json.message))
		}
	} catch(err) {
		dispatch(responseUserData(true,err.message));
	}
};