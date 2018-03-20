const isJsonContent = (optional_exist = false) => async (req,res) => {
	if(!optional_exist) {
		if(typeof req.headers['content-type'] !== 'string') {
			await res.endJSON(406,{
				'message':'header field "Content-Type" not found in request. requires "Content-type" header to be "application/json"'
			});

			return false;
		} else {
			if(req.headers['content-type'] !== 'application/json') {
				await res.endJSON(406,{
					'message':`expecting content-type of "application/json", received "${req.headers['content-type']}"`
				});

				return false;
			}
		}
	} else {
		if(typeof req.headers['content-type'] === 'string') {
			if(req.headers['content-type'] !== 'application/json') {
				await res.endJSON(406,{
					'message':`expecting content-type of "application/json", received "${req.headers['content-type']}"`
				});

				return false;
			}
		}
	}
};

module.exports = isJsonContent;