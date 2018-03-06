const path = require('path');

const Router = require('Router');
const global = require('Router/global');
const _ = require('lodash');

const Dir = require('../modules/fs/Dir');
const File = require('../modules/fs/File');

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

let dir_list = Dir.readSync(path.join(__dirname,'./routes'), {
	base: path.join(__dirname,'./routes'),
	with_stats: true,
	single_list: true
});

const isNotLoadFile = file => {
	return !(file.name === '__root.js' || file.name === '__load.yaml' || file.name === '__mount.yaml' || file.name === '__mount.js');
}

const loadRoute = (router_instance, file) => {
	let routes = require(file.base + file.item);

	for(let r of routes) {
		switch(r[0].type) {
			case 'mdlwr':
				r[0]['no_final'] = true;
				router_instance.addRoute(...r);
				break;
			case 'endpt':
			default:
				router_instance.addRoute(...r);
		}
	}
}

const loadMount = (router_instance, file) => {
	let list = Dir.readSync(file.base + file.item,{
		base: file.base,
		with_stats: true,
		single_list: true
	});

	let n_router = new Router({name:file.item});
	let mount_data = {
		path: '/' + file.name
	};
	let mount_middleware = [];

	if(File.existsSync(file.base + file.item + '/__mount.yaml'))
		mount_data = _.merge({},mount_data,File.loadYamlSync(file.base + file.item + '/__mount.yaml'));

	if(File.existsSync(file.base + file.item + '/__mount.js'))
		mount_middleware = require(file.base + file.item + '/__mount.js');

	loadDirectory(n_router,list);

	router_instance.addMount(mount_data,[...mount_middleware,n_router]);
}

const loadRoot = (router_instance, list) => {
	for(let file of list) {
		if(file.type === 'file' && file.name === '__root.js') {
			loadRoute(router_instance, file);
		}
	}
}

const loadFiles = (router_instance, list) => {
	for(let file of list) {
		if(file.type === 'file' && isNotLoadFile(file) && path.extname(file.name) === '.js') {
			loadRoute(router_instance, file);
		} else if(file.type === 'dir') {
			loadMount(router_instance, file)
		}
	}
}

const findFileIndex = (list, search) => {
	for(let i = 0,l = list.length; i < l; ++i) {
		let file = list[i];
		if(file.name === search) {
			return i;
		}
	}

	return -1;
}

const loadOrderedFiles = (router_instance, list, order) => {
	for(let file_name of order) {
		let index = findFileIndex(list, file_name);

		if(index >= 0) {
			let file = list[index];

			if(file.type === 'file' && isNotLoadFile(file) && path.extname(file.name)) {
				loadRoute(router_instance, file);
			} else if(file.type === 'dir') {
				loadMount(router_instance, file);
			}
		}
	}
}

const loadDirectory = (router_instance,list) => {
	let found_load_order = false;

	loadRoot(router_instance, list);

	for(let file of list) {
		if(file.type === 'file' && file.name === '__load.yaml') {
			found_load_order = true;

			let load = File.loadYamlSync(file.base + file.item);

			loadOrderedFiles(router_instance, list, load.order);
		}
	}

	if(!found_load_order) {
		loadFiles(router_instance, list);
	}
}

loadDirectory(router, dir_list);

module.exports = router;
