import * as nCrypto from "crypto";
import uuidV5 from "uuid/v5";
import uuidV4 from "uuid/v4";
export const HASH = "sha512";
export const ENCODING = "utf-8";
export const BASE = "base64";
export const NAMESPACE = [12, 84, 52, 34, 124, 63, 74, 95, 120, 210, 184, 2, 16, 14, 132, 23];
export function genSalt(size = 256, type = BASE) {
    let buffer = nCrypto.randomBytes(size);
    return buffer.toString(type);
}
export function genHash(to_hash, salt, options = {}) {
    let hash = nCrypto.createHmac(options.hash_type, salt);
    hash.update(to_hash);
    return hash.digest(options.digest_type);
}
export function uuidv5(name, namespace = NAMESPACE) {
    return uuidV5(name, namespace);
}
export function uuidv4(options, buffer, offset) {
    return uuidV4(options, buffer, offset);
}
//# sourceMappingURL=security.js.map