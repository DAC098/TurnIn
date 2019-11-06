const variables = require('../../variables');
const log = require('../../log');

const checkUserType = (user_type,no_continue = true) => async (req,res) => {
	if(typeof req.user === 'undefined') {
		await res.endJSON(401,{
			'message': 'no user session found'
		});
		return false;
	}

	if(!(variables.user_type_map[req.user.type] <= variables.user_type_map[user_type] && no_continue)) {
		await res.endJSON(401,{
			'message': 'you do not have permission'
		});
		return false;
	}
};

module.exports = checkUserType;