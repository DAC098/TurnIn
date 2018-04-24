const process = require('process');
const n_path = require('path');

const setup = require('modules/setup');
const File = require('modules/fs/File');
const log = require('modules/log');

let manifest = {};
let manifest_path = n_path.join(__dirname,'../../assets/scripts/manifest.json');
let chokidar = null;

const is_dev = process.env.NODE_ENV === 'development';

if(is_dev) {
	chokidar = require('chokidar');
}

const setup_obj = {
	server: setup.getKey('server'),
	socket: setup.getKey('socket')
};

const head_string = `
<title>TurnIn</title>
<meta name="description" content="TurnIn Server">
<meta name="author" content="David A Cathers">
<meta name="keywords" content="TDS,David Cathers,David C,dac098,o98dac">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
<link rel="icon" type="image/ico" href="/assets/images/favicon.ico">
<link href="/assets/stylesheets/main_style.css" rel="stylesheet">
<script type="application/javascript">
	window.__SERVER_SETUP__ = ${JSON.stringify(setup_obj)};
	window.__ASSET_MANIFEST__ = ${JSON.stringify(manifest)};
</script>
`;

const app_string = `
<!DOCTYPE html> 
<html lang="en">
	<head>
	${head_string}
	<script type="application/javascript" src="/assets/scripts/runtime~app.js"></script>
	<script type="application/javascript" src="/assets/scripts/vendor.js"></script>
	${'scripts/common.js' in manifest ? '<script type="application/javascript" src="/assets/scripts/common.js"></script>' : ''}
	${is_dev && 'dev.js' in manifest ? '<script type="application/javascript" src="/assets/scripts/dev.js"></script>' : ''}
	<script type="application/javascript" src="/assets/scripts/app.js"></script>
	</head>
	<body>
		<div id="ren-tar"></div>
		<div id="modal-container"></div>
		<div id="snack-bar-container"></div>
	</body>
</html>
`;

const login_string = `
<!DOCTYPE html> 
<html lang="en">
	<head>
	${head_string}
	<script type="application/javascript" src="/assets/scripts/runtime~login.js"></script>
	<script type="application/javascript" src="/assets/scripts/vendor.js"></script>
	${'scripts/common.js' in manifest ? '<script type="application/javascript" src="/assets/scripts/common.js"></script>' : ''}
	${is_dev && 'dev.js' in manifest ? '<script type="application/javascript" src="/assets/scripts/dev.js"></script>' : ''}
	<script type="application/javascript" src="/assets/scripts/login.js"></script>
	</head>
	<body>
		<div id="ren-tar"></div>
		<div id="modal-container"></div>
		<div id="snack-bar-container"></div>
	</body>
</html>
`;

const loadManifest = async () => {
	try {
		log.info('loading script manifest');

		if(await File.exists(manifest_path)) {
			manifest = JSON.parse(await File.read(manifest_path));
			log.info('loaded script manifest');
		} else {
			log.warn('failed to find script manifest');
		}
	} catch(err) {
		log.error(`loading script manifest: ${err.stack}`);
	}
};

(async () => {
	await loadManifest();

	if(is_dev && chokidar !== null) {
		log.info('watching manifest for changes');

		const watcher = chokidar.watch(manifest_path,{
			ignoreInitial: true
		});

		let timer = null;

		watcher.on('change',p => {
			if(timer)
				clearTimeout(timer);

			timer = setTimeout(async () => {
				log.debug('manifest file changed');

				await loadManifest();

				clearTimeout(timer);
			},750);
		});
	}
})();

module.exports = [
	[
		{
			path: '/login',
			methods: 'get'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'text/html'});
			res.end(login_string);
		}
	],
	[
		{
			path: '/',
			type: 'mdlwr',
			methods: 'get',
			options: {
				end: false
			}
		},
		async (req,res) => {
			if(typeof req.headers['accept'] === 'string' && req.headers['accept'].includes('text/html')) {
				res.writeHead(200,{'content-type':'text/html'});
				await res.endAsync(app_string);

				return false;
			}
		}
	]
];