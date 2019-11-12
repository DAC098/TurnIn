import * as nPath from 'path';

import Router, { RouteOptions, MountOptions } from 'Router';
import {default as _} from "lodash"

import Dir, { ReadResultArrayTmplt, ReadStats } from '../lib/fs/Dir';
import File from '../lib/fs/File';
import {default as log} from "./logger"
import { AppRouter, AppRouterCallback } from './router';
import { fileURLToPath } from 'url';

interface LoadInterface {
	order: Array<string>
}

type ReadDirList = ReadResultArrayTmplt<ReadStats>
/*
const isNotLoadFile = file => {
	return !(file.name === '__root.js' || file.name === '__load.yaml' || file.name === '__mount.yaml' || file.name === '__mount.js');
};

const loadFiles = async (list: ReadDirList) => {
	for(let file of list) {
		if(file.type === 'file' && isNotLoadFile(file) && nPath.extname(file.name) === '.js') {
			loadRoute(file);
		} else if(file.type === 'dir') {
			await loadMount(file)
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

const loadOrderedFiles = async (list: ReadDirList, order: string[]) => {
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

const loadDirectory = async (list: ReadDirList) => {
	let found_load_order = false;

	for(let file of list) {
		if(file.type === 'file' && file.name === '__load.yaml') {
			found_load_order = true;

			let load = await File.loadYaml<LoadInterface>(file.base + file.item);

			await loadOrderedFiles(list, load.order);
		}
	}

	if(!found_load_order) {
		await loadFiles(list);
	}
};

function loadRoutes() {
	const route_directory = nPath.join(nPath.dirname(fileURLToPath(import.meta.url)),"routes");

	

}

const load = async (router_instance: AppRouter, path: string): Promise<void> => {
	let dir_list = await Dir.read(path, {
		base: path,
		with_stats: true,
		single_list: true
	});

	await loadDirectory(router_instance, (dir_list as ReadResultArrayTmplt<ReadStats>));
};

export default load;
*/