const isJsonContent = async (req,res) => {
	if(typeof req.headers['content-type'] !== 'string') {
		res.writeHead(406,{'content-type':'application/json'});
		res.endJSON({
			'message':'header field "Content-Type" not found in request. requires "Content-type" header to be "application/json"'
		});

		return false;
	} else {
		if(req.headers['content-type'] !== 'application/json') {
			res.writeHead(406,{'content-type':'application/json'});
			res.endJSON({
				'message':`expecting content-type of "application/json", received "${req.headers['content-type']}"`
			});

			return false;
		}
	}
};

module.exports = isJsonContent;