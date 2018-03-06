const router = require('./router');

router.all('/*',async (req,res) => {
  res.writeHead(200,{'content-type':'text/plain'});
  res.end('catch all');
});
