const asyncPump = (...args) => {
    return new Promise((resolve, reject) => {
        pump(...args, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
export default asyncPump;
//# sourceMappingURL=asyncPump.js.map