const setup = require('../setup');
const log = require('../log');

const atob = (string) => {
	if(Buffer.byteLength(string) !== string.length)
		throw new Error('bad string given');
	return Buffer.from(string,'base64').toString('utf8');
};

const checkAuthorization = async (req,res) => {
	if(typeof req.headers['authorization'] === 'string') {
		let split = req.headers['authorization'].split(' ');

		switch(split[0]) {
			case "Basic":
				let parsed = atob(split[1]).split(':');
				let username = parsed[0];
				let password = parsed.slice(1).join(':');

				if(username !== 'server') {
					res.writeHead(401,{'content-type':'application/json'});
					await res.endJSONAsync({
						'message': 'only server is allowed user'
					});
					return false;
				}

				if(password !== setup.getKey('security.secret')) {
					res.writeHead(401,{'content-type':'application/json'});
					await res.endJSONAsync({
						'message': 'invalid password given in authorization header'
					});
					return false;
				}
				break;
			case "Digest":

				break;
		}
	} else {
		res.writeHead(401,{'content-type':'application/json'});
		await res.endJSONAsync({
			'message': 'no authorization header present'
		});
		return false;
	}
};

module.exports = checkAuthorization;