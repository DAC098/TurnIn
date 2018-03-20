const container = require('modules/docker/containers');

module.exports = [
	[
		{
			path: '/',
			methods: 'get'
		},
		async (req,res) => {
			try {
				let {success,returned} = await container.list(true,null,null,{
					label: [
						'com.turnin=true'
					]
				});

				if(success) {
					await res.endJSON({
						'list': returned
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