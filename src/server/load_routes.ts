import * as nPath from 'path';

import Router, * as RouterNS from 'Router';
import {default as _} from "lodash"

import Dir, {ReadResultArrayTmplt, ReadStats} from '../lib/fs/Dir';
import File from '../lib/fs/File';
import {default as log} from "./logger"

import {AppRouter,AppMiddleware,AppMountMiddleware} from '../modules/types/Routing';

interface LoadInterface {
	order: Array<string>
}

type ReadDirList = ReadResultArrayTmplt<ReadStats>

const isNotLoadFile = file => {
	return !(file.name === '__root.js' || file.name === '__load.yaml' || file.name === '__mount.yaml' || file.name === '__mount.js');
};

const loadRoute = (router_instance: AppRouter, file: ReadStats) => {
	let routes = <[RouterNS.RouteOptions & {type:string},...AppMiddleware[]][]>require(file.base + file.item);

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
};

const loadMount = async (router_instance: AppRouter, file: ReadStats) => {
	let list = (await Dir.read(file.base + file.item,{
		base: file.base,
		with_stats: true,
		single_list: true
	}) as ReadResultArrayTmplt<ReadStats>);

	let n_router: AppRouter = new Router({name:file.item});
	let mount_data = {
		path: '/' + file.name
	};
	let mount_middleware: AppMountMiddleware = [];

	if(File.existsSync(file.base + file.item + '/__mount.yaml'))
		mount_data = _.merge({},mount_data,await File.loadYaml<RouterNS.MountOptions>(file.base + file.item + '/__mount.yaml'));

	if(File.existsSync(file.base + file.item + '/__mount.js'))
		mount_middleware = require(file.base + file.item + '/__mount.js');

	await loadDirectory(n_router,list);

	router_instance.addMount(mount_data,[...mount_middleware,n_router]);
};

const loadRoot = (router_instance: AppRouter, list: ReadDirList) => {
	for(let file of list) {
		if(file.type === 'file' && file.name === '__root.js') {
			loadRoute(router_instance, file);
		}
	}
};

const loadFiles = async (router_instance: AppRouter, list: ReadDirList) => {
	for(let file of list) {
		if(file.type === 'file' && isNotLoadFile(file) && nPath.extname(file.name) === '.js') {
			loadRoute(router_instance, file);
		} else if(file.type === 'dir') {
			await loadMount(router_instance, file)
		}
	}
};

const findFileIndex = (list: ReadDirList, search: string): number => {
	for(let i = 0,l = list.length; i < l; ++i) {
		let file = list[i];

		if(file.name === search) {
			return i;
		}
	}

	return -1;
};

const loadOrderedFiles = async (router_instance: AppRouter, list: ReadDirList, order: string[]) => {
	for(let file_name of order) {
		let index = findFileIndex(list, file_name);

		if(index >= 0) {
			let file = list[index];

			if(file.type === 'file' && isNotLoadFile(file) && nPath.extname(file.name)) {
				loadRoute(router_instance, file);
			} else if(file.type === 'dir') {
				await loadMount(router_instance, file);
			}
		}
	}
};

const loadDirectory = async (router_instance: AppRouter, list: ReadDirList) => {
	let found_load_order = false;

	loadRoot(router_instance, list);

	for(let file of list) {
		if(file.type === 'file' && file.name === '__load.yaml') {
			found_load_order = true;

			let load = await File.loadYaml<LoadInterface>(file.base + file.item);

			await loadOrderedFiles(router_instance, list, load.order);
		}
	}

	if(!found_load_order) {
		await loadFiles(router_instance, list);
	}
};

const load = async (router_instance: AppRouter, path: string): Promise<void> => {
	let dir_list = await Dir.read(path, {
		base: path,
		with_stats: true,
		single_list: true
	});

	await loadDirectory(router_instance, (dir_list as ReadResultArrayTmplt<ReadStats>));
};

export default load;