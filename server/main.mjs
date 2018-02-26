import http2 from 'http2';

import router from './router.mjs';
import setup from './setup.mjs';

const opts = {
  key: setup.getKey('tls.key')
  cert: setup.getKey('tls.cert')
};

const server = http2.createSecureServer(opts);

server.on('listen',() => {
    console.log('server listening for connections');
});

server.listen('0.0.0.0',443);

export default server;
