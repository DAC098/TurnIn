import req from '../lib/request';

export const REQUEST_USER_LIST = 'app/request/users/list';
export const RESPONSE_USER_LIST = 'app/response/users/list';

export const requestUserList = () => ({
	type: REQUEST_USER_LIST
});

export const responseUserList = (err,msg,data) => ({
	type: RESPONSE_USER_LIST,
	err: !!err,
	msg,
	data
});

export const getUserList = () => async dispatch => {
	try {
		dispatch(requestUserList());

		let res = await req.get('/users/');

		let json = await res.json();

		if(res.status === 200) {
			dispatch(responseUserList(false,'',json));
		} else {
			dispatch(responseUserList(true,json.message));
		}
	} catch(err) {
		dispatch(responseUserList(true,err.message))
	}
};