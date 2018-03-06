const router = require('./router');
const parseText = require('../parser/text');

router.post('/',async (req,res) => {
  res.writeHead(200,{'content-type':'text/plain'});
  let body = await parseText(req);
  console.log('body',body);
  res.end(body);
})

router.get('/', async (req,res) => {
  res.writeHead(200,{'content-type':'application/json'});
  res.end(JSON.stringify({'message':'ok','page':'root'}));
});
