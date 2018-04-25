import req from '../lib/request';

export const REQUEST_CLOSE_SERVER = 'app/request/system/close_server';
export const RESPONSE_CLOSE_SERVER = 'app/response/system/close_server';

export const requestCloseServer = () => ({
	type: REQUEST_CLOSE_SERVER
});

export const responseCloseServer = (err,data) => ({
	type: RESPONSE_CLOSE_SERVER,
	err: !!err,
	data
});

export const closeServer = (force,test) => async dispatch => {
	try {
		let query = [];

		if(typeof force === 'boolean' && force)
			query.push('force_close=1');

		if(typeof test === 'boolean' && test)
			query.push('no_close=1');

		dispatch(requestCloseServer());

		let res = await req.post(`/close${query.length !== 0 ? '?' + query.join('&') : ''}`);

		let json = await res.json();

		console.log('response from server',res,json);

		if(res.status === 202) {
			dispatch(responseCloseServer(null,json.message));
		} else {
			dispatch(responseCloseServer(true,json.message));
		}
	} catch(err) {
		dispatch(responseCloseServer(true,err.message));
	}
};