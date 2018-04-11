const Router = require('Router');

const router = new Router({name:'main'});

module.exports = router;

require('./routes/run');
require('./routes/test');
require('./routes/close');