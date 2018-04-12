const path = require('path');
const process = require('process');

const chokidar = require('chokidar');

const log = require('modules/log');

const server = require('./main');

let timer = null;
let watch_dir = path.resolve(__dirname,'../');
let change_list = [];

const shouldRestart = list => {
	for(let file of list) {
		if(file in require.cache) {
			return true;
		}
	}

	return false;
};

// log.debug('watching directory',{dir:watch_dir});

const watcher = chokidar.watch(watch_dir,{
	ignoreInitial: true,
	ignored: [
		'**/node_modules/**',
		'**/.git/**',
		'**/.idea/**'
	]
});

watcher.on('ready',() => {
	log.info('dev watcher ready');
});

watcher.on('error', err => {
	log.error(err.stack);
});

watcher.on('change', p => {
	change_list.push(p);

	if(timer)
		clearTimeout(timer);

	timer = setTimeout(async () => {
		clearTimeout(timer);

		if(shouldRestart(change_list)) {
			log.info('file update, closing server');
			await server.shutdown();
			process.exit(0);
		}

		change_list = [];
	},750);
});


