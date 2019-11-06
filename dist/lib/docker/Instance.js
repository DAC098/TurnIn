import { request } from "http";
class Instance {
    constructor(options) { }
    createRequest(options) {
        return request(options);
    }
    request(options) {
        return new Promise((resolve, reject) => {
            let req = this.createRequest(options);
            req.on("response", res => {
                resolve(res);
            });
            req.on("error", err => reject(err));
            req.end();
        });
    }
}
export default Instance;
//# sourceMappingURL=Instance.js.map