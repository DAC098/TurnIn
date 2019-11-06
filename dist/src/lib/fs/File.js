const nLStat = nUtil.promisify(nFS.lstat);
const nReadFile = nUtil.promisify(nFS.readFile);
const nWriteFile = nUtil.promisify(nFS.writeFile);
const nUnlinkFile = nUtil.promisify(nFS.unlink);
export default class File {
    constructor() { }
    static async stats(path) {
        return await nLStat(path);
    }
    static statsSync(path) {
        return nFS.lstatSync(path);
    }
    static async exists(path) {
        try {
            let stats = await File.stats(path);
            return stats.isFile();
        }
        catch (err) {
            return false;
        }
    }
    static existsSync(path) {
        try {
            let stats = File.statsSync(path);
            return stats.isFile();
        }
        catch (err) {
            return false;
        }
    }
    static async read(path, options) {
        if (await File.exists(path))
            return nReadFile(path, options);
        else
            return '';
    }
    static readSync(path, options) {
        if (File.existsSync(path))
            return nFS.readFileSync(path, options);
        else
            return '';
    }
    static async write(path, data, options) {
        let write = typeof data.then === 'function' ? await data : data;
        await nWriteFile(path, write, options);
    }
    static writeSync(path, data, options) {
        nFS.writeFileSync(path, data, options);
    }
    static async remove(path) {
        if (await File.exists(path))
            await nUnlinkFile(path);
        return true;
    }
    static removeSync(path) {
        if (File.existsSync(path))
            nFS.unlinkSync(path);
        return true;
    }
    static async loadYaml(path) {
        let data = await File.read(path);
        return jsYaml.safeLoad(data);
    }
    static loadYamlSync(path) {
        let data = File.readSync(path);
        return jsYaml.safeLoad(data);
    }
    static copy(current_path, new_path) {
        return new Promise((resolve, reject) => {
            let read_stream = nFS.createReadStream(current_path);
            let write_stream = nFS.createWriteStream(new_path);
            pump(read_stream, write_stream, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
//# sourceMappingURL=File.js.map