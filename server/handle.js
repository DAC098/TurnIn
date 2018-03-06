const path = require('path');

const router = require('./routes/router');
const global_router = require('Router/global');

const File = require('../modules/fs/File');

const load_order = File.loadYamlSync(path.join(__dirname,'./routes/load.yaml'));

for(let file of load_order.order) {
  require(path.join(__dirname,'routes',file));
}

console.log('routes:',global_router.routerStructure(router))

const handle = async (req,res) => {
  console.log(`${req.method} ${req.url} HTTP/${req.httpVersion}`);

  try {
    let result = await router.run(req,res);

    if(!result.found_path) {
      res.writeHead(404,{'content-type':'text/plain'});
      res.end('not found');
    }

    if(result.found_path && !result.valid_method) {
      res.writeHead(405,{'content-type':'text/plain'});
      res.end(`no handle for method[${req.method}] on url[${req.url}]`);
    }

  } catch(err) {
    console.error(err.stack);
    res.writeHead(500,{'content-type':'text/plain'});
    res.end(err.stack);
  }
}

module.exports = handle;
