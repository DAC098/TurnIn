import req from '../lib/request';

export const REQUEST_IMAGE_LIST = 'app/request/images/list';
export const RESPONSE_IMAGE_LIST = 'app/response/images/list';

export const requestImageList = () => ({
	type: REQUEST_IMAGE_LIST
});

export const responseImageList = (err,msg,data) => ({
	type: RESPONSE_IMAGE_LIST,
	err: !!err,
	msg,
	data
});

export const getImageList = () => async dispatch => {
	try {
		dispatch(requestImageList());

		let res = await req.get('/images/');

		let json = await res.json();

		if(res.status === 200) {
			dispatch(responseImageList(false,'',json));
		} else {
			dispatch(responseImageList(true,json.message));
		}
	} catch(err) {
		dispatch(responseImageList(true,err.message));
	}
};