const router = require('../router');

router.addRoute({path:'/test',methods:'get'},async (req,res) => {
	await res.endJSON(200,{
		'message': 'ok'
	});
});