const db = require('modules/psql');
const containers = require('modules/docker/containers');

const router = require('../router');

router.addRoute({
	path: '/run',
	methods: 'post'
},
	async (req,res) => {
		await res.endJSON({
			'message':'ok'
		});
	});