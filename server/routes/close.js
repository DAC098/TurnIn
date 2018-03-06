const process = require('process');

const router = require('./router');

router.post('/close',async (req,res) => {
  res.writeHead(200,{'content-type':'text/plain'});
  res.end('closing server',() => {
    process.exit(0);
  });
});
