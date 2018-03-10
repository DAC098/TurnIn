const path = require('path');

const File = require('../fs/File');
const Dir = require('../fs/Dir');

const setup = require('./index');

const checkDirectories = async () => {
	let data_dir = setup.getKey('directories.data_root');
	let checking = ['assignments','images','submissions'];

	for(let dir of checking) {
		if(!await Dir.exists(path.join(data_dir,dir))) {
			await Dir.make(path.join(data_dir,dir));
		}
	}
};

exports.checkDirectories = checkDirectories;

const run = async () => {
	await checkDirectories();
};

exports.run = run;