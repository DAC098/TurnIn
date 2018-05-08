const setup = require('../../setup/index');
const log = require('../../log/index');
const security = require('../index');
const db = require('modules/psql');

const validUser = require('../../psql/helpers/validUser');

const atob = (string) => {
	if(Buffer.byteLength(string) !== string.length)
		throw new Error('bad string given');
	return Buffer.from(string,'base64').toString('utf8');
};

const checkAuthorization = async (req,res) => {
	let con = null;

	if(typeof req.headers['authorization'] === 'string') {
		let split = req.headers['authorization'].split(' ');

		switch(split[0]) {
			case "Basic":
				let parsed = atob(split[1]).split(':');
				let username = parsed[0];
				let password = parsed.slice(1).join(':');

				try {
					con = await db.connect();

					let result = await validUser(username,password,con);

					con.release();

					if(!result.success) {
						if(!result.username) {
							await res.endJSON(401,{
								'message': 'invalid username'
							});
							return false;
						}

						if(!result.password) {
							await res.endJSON(401,{
								'message': 'invalid password'
							});
							return false;
						}
					}

					req.user = result.user;
				} catch(err) {
					if(con)
						con.release();

					log.error(err.stack);
					await res.endError(err);
				}
				break;
			case "Digest":
			default:
				await res.endJSON(403,{
					'message': 'Authorization type not implemented: ' + split[0]
				});
		}
	} else {
		await res.endJSON(401,{
			'message': 'no authorization header present'
		});
		return false;
	}
};

module.exports = checkAuthorization;