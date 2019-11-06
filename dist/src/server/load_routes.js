import * as nPath from 'path';
import Router from 'Router';
import Dir from 'src/lib/fs/Dir';
import File from 'src/lib/fs/File';
const isNotLoadFile = file => {
    return !(file.name === '__root.js' || file.name === '__load.yaml' || file.name === '__mount.yaml' || file.name === '__mount.js');
};
const loadRoute = (router_instance, file) => {
    let routes = require(file.base + file.item);
    for (let r of routes) {
        switch (r[0].type) {
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
const loadMount = async (router_instance, file) => {
    let list = await Dir.read(file.base + file.item, {
        base: file.base,
        with_stats: true,
        single_list: true
    });
    let n_router = new Router({ name: file.item });
    let mount_data = {
        path: '/' + file.name
    };
    let mount_middleware = [];
    if (File.existsSync(file.base + file.item + '/__mount.yaml'))
        mount_data = _.merge({}, mount_data, await File.loadYaml(file.base + file.item + '/__mount.yaml'));
    if (File.existsSync(file.base + file.item + '/__mount.js'))
        mount_middleware = require(file.base + file.item + '/__mount.js');
    await loadDirectory(n_router, list);
    router_instance.addMount(mount_data, [...mount_middleware, n_router]);
};
const loadRoot = (router_instance, list) => {
    for (let file of list) {
        if (file.type === 'file' && file.name === '__root.js') {
            loadRoute(router_instance, file);
        }
    }
};
const loadFiles = async (router_instance, list) => {
    for (let file of list) {
        if (file.type === 'file' && isNotLoadFile(file) && nPath.extname(file.name) === '.js') {
            loadRoute(router_instance, file);
        }
        else if (file.type === 'dir') {
            await loadMount(router_instance, file);
        }
    }
};
const findFileIndex = (list, search) => {
    for (let i = 0, l = list.length; i < l; ++i) {
        let file = list[i];
        if (file.name === search) {
            return i;
        }
    }
    return -1;
};
const loadOrderedFiles = async (router_instance, list, order) => {
    for (let file_name of order) {
        let index = findFileIndex(list, file_name);
        if (index >= 0) {
            let file = list[index];
            if (file.type === 'file' && isNotLoadFile(file) && nPath.extname(file.name)) {
                loadRoute(router_instance, file);
            }
            else if (file.type === 'dir') {
                await loadMount(router_instance, file);
            }
        }
    }
};
const loadDirectory = async (router_instance, list) => {
    let found_load_order = false;
    loadRoot(router_instance, list);
    for (let file of list) {
        if (file.type === 'file' && file.name === '__load.yaml') {
            found_load_order = true;
            let load = await File.loadYaml(file.base + file.item);
            await loadOrderedFiles(router_instance, list, load.order);
        }
    }
    if (!found_load_order) {
        await loadFiles(router_instance, list);
    }
};
const load = async (router_instance, path) => {
    let dir_list = await Dir.read(path, {
        base: path,
        with_stats: true,
        single_list: true
    });
    await loadDirectory(router_instance, dir_list);
};
export default load;
//# sourceMappingURL=load_routes.js.map