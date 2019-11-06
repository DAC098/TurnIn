import Router from 'Router';
import {default as global} from "Router/global"

import {AppRouter} from "../modules/types/Routing";

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

const router: AppRouter = new Router({name: '/'});

export default router;