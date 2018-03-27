const _ = require('lodash');

const container = require('modules/docker/containers');
const parser = require('modules/parser');
const isJsonContent = require('modules/middleware/isJsonContent');

module.exports = [
	[
		{
			path: '/create',
			methods: 'post'
		},
		isJsonContent(),
		async (req,res) => {
			try {
				let body = await parser.json(req);
				let config = _.merge({},body,{
					'labels': {
						'com.turnin': 'true',
						'com.turnin.user': req.user.id.toString()
					}
				});
				let {success,returned} = await container.create(null,config);

				if(success) {
					await res.endJSON({
						returned
					});
				} else {
					await res.endJSON({
						returned
					});
				}
			} catch(err) {
				await res.endError(err);
			}
		}
	]
];