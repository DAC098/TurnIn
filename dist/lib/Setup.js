import { EventEmitter } from 'events';
import { default as _ } from "lodash";
function traverseObjectRecursive(key_list, index, obj, found, notFound) {
    if (index === key_list.length - 1) {
        if (key_list[index] in obj) {
            return found(key_list, index, obj);
        }
        else {
            return notFound(key_list, index, obj);
        }
    }
    if (key_list[index] in obj) {
        return traverseObjectRecursive(key_list, index + 1, obj[key_list[index]], found, notFound);
    }
    else {
        return notFound(key_list, index, obj);
    }
}
function traverseObject(key_list, obj, found, notFound) {
    if (key_list.length <= 1) {
        if (key_list.length === 0) {
            throw new TypeError("key list has no length");
        }
        else {
            if (key_list[0] in obj) {
                return found(key_list, 0, obj);
            }
            else {
                return notFound(key_list, 0, obj);
            }
        }
    }
    else {
        return traverseObjectRecursive(key_list, 0, obj, found, notFound);
    }
}
class Setup extends EventEmitter {
    constructor(default_data) {
        super();
        this.data = _.cloneDeep(default_data);
    }
    getPath(key_str) {
        let is_string = typeof key_str === "string";
        if (is_string || Array.isArray(key_str)) {
            return is_string ? key_str.split(".") : key_str;
        }
        else {
            throw new TypeError("key_str must be a string or an array of strings");
        }
    }
    setKey(key_str, value) {
        let rtn = traverseObject(this.getPath(key_str), this.data, (keys, index, obj) => {
            obj[keys[index]] = value;
            return true;
        }, (keys, index, obj) => {
            return false;
        });
        return rtn;
    }
    setObj(key_str, value) {
        traverseObject(this.getPath(key_str), this.data, (keys, index, obj) => {
            obj[keys[index]] = value;
        }, (keys, index, obj) => {
            obj[keys[index]] = value;
        });
    }
    hasKey(key_str) {
        return traverseObject(this.getPath(key_str), this.data, (keys, index, obj) => {
            return true;
        }, (keys, index, obj) => {
            return false;
        });
    }
    getKey(key_str) {
        return traverseObject(this.getPath(key_str), this.data, (keys, index, obj) => {
            return _.cloneDeep(obj[keys[index]]);
        }, (keys, index, obj) => {
            return null;
        });
    }
    get() {
        return _.cloneDeep(this.data);
    }
}
export default Setup;
//# sourceMappingURL=Setup.js.map