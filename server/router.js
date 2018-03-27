const Router = require('Router');
const global = require('Router/global');

// global.on('endpoint', (...args) => {
//   console.log('endpoint:',...args);
// });
//
// global.on('middleware', (...args) => {
//   console.log('middleware:',...args);
// });
//
// global.on('mount', (...args) => {
//   console.log('mount:',...args);
// });
//
// global.on('addRoute',(...args) => {
//   console.log('addRoute:',...args);
// });
//
// global.on('addMount',(...args) => {
//   console.log('addMount:',...args);
// });

const router = new Router({name: '/'});

module.exports = router;