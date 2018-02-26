import http2 from 'http2';

import router from './router';

const opts = {
  key: ""
  cert: ""
};

const server = http2.createSecureServer(opts, (req,res) => {

});

export default server;
