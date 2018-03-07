const pump = require('pump');

const asyncPump = (...args) =>{
	return new Promise((resolve,reject) => {
		pump(...args,err => {
			if(err)
				reject(err);
			else
				resolve();
		});
	});
};

module.exports = asyncPump;