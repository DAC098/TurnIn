const parseText = (stream) => new Promise((resolve, reject) => {
    if (stream.readable) {
        let body = '';
        stream.on('data', chunk => {
            body += chunk;
        });
        stream.on('end', () => {
            try {
                if (body.length)
                    resolve(body);
                else
                    resolve('');
            }
            catch (err) {
                reject(err);
            }
        });
        stream.on('error', err => {
            reject(err);
        });
        if (stream.isPaused())
            stream.resume();
    }
    else {
        resolve(null);
    }
});
export default parseText;
//# sourceMappingURL=text.js.map