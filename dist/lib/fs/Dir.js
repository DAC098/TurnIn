import { default as nFS } from 'fs';
import { default as nPath } from "path";
import merge from 'lodash/merge';
import reverse from 'lodash/reverse';
import * as common from './common';
import File from './File';
const nLStat = nFS.promises.lstat;
const nReadDir = nFS.promises.readdir;
const nMkDir = nFS.promises.mkdir;
const nRmDir = nFS.promises.rmdir;
const read_default = {
    ignore: [],
    depth: 0,
    with_stats: false,
    include_file: true,
    include_dir: true,
    single_list: false,
    base: ''
};
function getStatType(stats) {
    if (stats.isDirectory())
        return 'dir';
    else if (stats.isFile())
        return 'file';
    else if (stats.isSymbolicLink())
        return 'sym-link';
    else
        return 'unknown';
}
function getReadStats(path, opt, stats) {
    return {
        base: String(opt.base),
        item: path.replace(opt.base, ''),
        name: nPath.basename(path),
        stats: stats,
        type: getStatType(stats)
    };
}
async function rRead(path, opt) {
    let found = opt.single_list ? [] : {
        files: [],
        directories: []
    };
    let contents = await nReadDir(path);
    for (let item of contents) {
        let item_path = nPath.join(path, item);
        let stats = await nLStat(item_path);
        if (!common.runCheck(item_path, opt.ignore)) {
            if (stats.isDirectory()) {
                if (opt.depth !== 0) {
                    --opt.depth;
                    if (opt.include_dir) {
                        if (opt.single_list)
                            found.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                        else
                            found.directories.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                    }
                    let res = await rRead(item_path, opt);
                    if (opt.single_list) {
                        found = found.concat(res);
                    }
                    else {
                        if (opt.include_dir)
                            found.directories = found
                                .directories
                                .concat(res.directories);
                        if (opt.include_file)
                            found.files = found
                                .files
                                .concat(res.files);
                    }
                }
                else {
                    if (opt.include_dir) {
                        if (opt.single_list)
                            found.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                        else
                            found.directories.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                    }
                }
            }
            else if (stats.isFile()) {
                if (opt.include_file) {
                    if (opt.single_list)
                        found.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                    else
                        found.files.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                }
            }
        }
    }
    return found;
}
function rReadSync(path, opt) {
    let found = opt.single_list ? [] : {
        files: [],
        directories: []
    };
    let contents = nFS.readdirSync(path);
    for (let item of contents) {
        let item_path = nPath.join(path, item);
        let stats = nFS.lstatSync(item_path);
        if (!common.runCheck(item_path, opt.ignore)) {
            if (stats.isDirectory()) {
                if (opt.depth !== 0) {
                    --opt.depth;
                    if (opt.include_dir) {
                        if (opt.single_list)
                            found.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                        else
                            found.directories.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                    }
                    let res = rReadSync(item_path, opt);
                    if (opt.single_list) {
                        found = found.concat(res);
                    }
                    else {
                        if (opt.include_dir)
                            found.directories = found
                                .directories
                                .concat(res.directories);
                        if (opt.include_file)
                            found.files = found
                                .files
                                .concat(res.files);
                    }
                }
                else {
                    if (opt.include_dir) {
                        if (opt.single_list)
                            found.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                        else
                            found.directories.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                    }
                }
            }
            else if (stats.isFile()) {
                if (opt.include_file) {
                    if (opt.single_list)
                        found.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                    else
                        found.files.push(opt.with_stats ? getReadStats(item_path, opt, stats) : item_path);
                }
            }
        }
    }
    return found;
}
export default class Dir {
    constructor() { }
    static async exists(path) {
        try {
            let stats = await nLStat(path);
            return stats.isDirectory();
        }
        catch (err) {
            return false;
        }
    }
    static existsSyc(path) {
        try {
            let stats = nFS.lstatSync(path);
            return stats.isDirectory();
        }
        catch (err) {
            return false;
        }
    }
    static async read(path, opt = {}) {
        opt = merge({}, read_default, opt);
        return await rRead(path, opt);
    }
    static readSync(path, opt = {}) {
        opt = merge({}, read_default, opt);
        return rReadSync(path, opt);
    }
    static async make(path, mode) {
        if (Array.isArray(path)) {
            path = nPath.join(...path);
        }
        let parse = nPath.parse(path);
        let check = parse.root;
        let parts = nPath.join(parse.dir.replace(parse.root, ''), parse.base).split(nPath.sep);
        for (let part of parts) {
            check = nPath.join(check, part);
            if (!await Dir.exists(check)) {
                await nMkDir(check, mode);
            }
        }
    }
    static makeSync(path, mode) {
        let parse = nPath.parse(path);
        let check = parse.root;
        let parts = nPath.join(parse.dir.replace(parse.root, ''), parse.base).split(nPath.sep);
        for (let part of parts) {
            check = nPath.join(check, part);
            if (!Dir.existsSyc(check)) {
                nFS.mkdirSync(check, mode);
            }
        }
    }
    static async remove(path, rm_files = false) {
        let contents = await Dir.read(path, { depth: -1 });
        if (contents.files.length !== 0 && !rm_files)
            return false;
        else {
            for (let file of contents.files) {
                await File.remove(file);
            }
            for (let dir of reverse(contents.directories)) {
                await nRmDir(dir);
            }
            await nRmDir(path);
        }
    }
}
//# sourceMappingURL=Dir.js.map