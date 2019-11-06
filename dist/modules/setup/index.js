import * as nPath from 'path';
import Setup from '../../lib/Setup';
import File from '../../lib/fs/File';
import Dir from '../../lib/fs/Dir';
const traverseKeys = (obj) => {
    let rtn = new Map();
    for (let k in obj) {
        if (typeof obj[k] === 'object') {
            let t = traverseKeys(obj[k]);
            for (let [tk, tv] of t) {
                rtn.set(`${k}.${tk}`, tv);
            }
        }
        else {
            rtn.set(k, obj[k]);
        }
    }
    return rtn;
};
const cliValidNames = (obj) => {
    let keys = new Set();
    let found = traverseKeys(obj);
    for (let [k, v] of found) {
        keys.add(`--c-${k}`);
    }
    return keys;
};
const default_setup = {
    server: {
        hostname: 'localhost',
        port: 443,
        backlog: 500,
        secure: true
    },
    tls: {
        key: "",
        cert: ""
    },
    psql: {
        hostname: '127.0.0.1',
        port: 5432,
        username: 'turnin',
        password: 'turnin_password'
    },
    security: {
        secret: 'secret'
    },
    docker: {
        host_mount: '/var/lib/turnin/data'
    },
    directories: {
        data_root: '/var/lib/turnin/data'
    }
};
const valid_cli_names = cliValidNames(default_setup);
const setup = new Setup(default_setup);
export default setup;
export const loadEtc = async (given_setup) => {
    if (await File.exists('/etc/turnin/config.yaml')) {
        let data = await File.loadYaml('/etc/turnin/config.yaml');
        let keys = traverseKeys(data);
        for (let [k, v] of keys) {
            given_setup.setKey(k, v);
        }
    }
};
export const processCliArgs = async (given_setup) => {
    let set_keys = new Set();
    for (let i = 1, l = process.argv.length; i < l; ++i) {
        let arg = process.argv[i];
        if (arg.startsWith("--") || arg.startsWith("-")) {
            if (valid_cli_names.has(arg) && !set_keys.has(arg)) {
                let key_path = arg.replace('--c-', '');
                if (process.argv[++i] != null) {
                    given_setup.setKey(key_path, process.argv[i + 1]);
                    set_keys.add(arg);
                    ++i;
                }
            }
            else if (arg === '-c' || arg === '--config') {
                if (process.argv[++i] != null) {
                    let file_path = process.argv[i];
                    let file_data = {};
                    ++i;
                    if (!await File.exists(file_path)) {
                        throw new Error(`config file not found. ${file_path}`);
                    }
                    switch (nPath.extname(file_path)) {
                        case ".yaml":
                        case ".yml":
                            file_data = await File.loadYaml(file_path);
                            break;
                        case ".json":
                            file_data = JSON.parse(await File.read(file_path));
                            break;
                    }
                    let keys = traverseKeys(file_data);
                    for (let [k, v] of keys) {
                        given_setup.setKey(k, v);
                    }
                }
            }
            else {
                throw new Error(`unknown config option. given "${arg}"`);
            }
        }
    }
};
export const checkDirectories = async (given_setup) => {
    let data_dir = given_setup.getKey('directories.data_root');
    let checking = ['assignments', 'images', 'submissions'];
    if (data_dir == null) {
        throw new TypeError("setup directories.data_root is null");
    }
    for (let dir of checking) {
        if (!await Dir.exists(nPath.join(data_dir, dir))) {
            await Dir.make(nPath.join(data_dir, dir));
        }
    }
};
//# sourceMappingURL=index.js.map