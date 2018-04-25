import req from '../lib/request';

export const REQUEST_SECTION_LIST = 'app/request/sections/list';
export const RESPONSE_SECTION_LIST = 'app/response/sections/list';

export const requestSectionList = () => ({
	type: REQUEST_SECTION_LIST
});

export const responseSectionList = (err,msg,data) => ({
	type: RESPONSE_SECTION_LIST,
	err: !!err,
	msg,
	data
});

export const getSectionList = () => async dispatch => {
	try {
		dispatch(requestSectionList());

		let res = await req.get('/sections/');

		let json = await res.json();

		if(res.status === 200) {
			dispatch(responseSectionList(false,'',json.result));
		} else {
			dispatch(responseSectionList(true,json.message));
		}
	} catch(err) {
		dispatch(responseSectionList(true,err.message));
	}
};