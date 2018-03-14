const setup = require('../setup');
const log = require('../log');
const security = require('../security');

const validUser = require('../psql/helpers/validUser');

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

				try {
					let result = await validUser(username,password);

					if(!result.success) {
						if(!result.username) {
							res.writeHead(401,{'content-type':'application/json'});
							await res.endJSON({
								'message': 'invalid username'
							});
							return false;
						}

						if(!result.password) {
							res.writeHead(401,{'content-type':'application/json'});
							await res.endJSON({
								'message': 'invalid password'
							});
							return false;
						}
					}

					req.user = result.user;
				} catch(err) {
					log.error(err.stack);
					await res.endError(err);
				}
				break;
			case "Digest":
			default:
				res.writeHead(403,{'content-type':'application/json'});
				await res.endJSON({
					'message': 'Authorization type not implemented: ' + split[0]
				});
		}
	} else {
		res.writeHead(401,{'content-type':'application/json'});
		await res.endJSON({
			'message': 'no authorization header present'
		});
		return false;
	}
};

module.exports = checkAuthorization;