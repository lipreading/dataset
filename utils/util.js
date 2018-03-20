const fs = require('fs');

module.exports = {
    parseArgs(argv) {
        return argv.reduce((res, arg) => {
            if (arg[0] === '-') {
                const split = arg.slice(1).split('=');
                res[split[0]] = split[1];
            }
            return res;
        }, {});
    },

    writeToFile(path, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(`${process.cwd()}/res/${path}`, data, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    readFile(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(`${process.cwd()}/res/${path}`, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    },

    removeFile(path) {
        return new Promise((resolve, reject) => {
            fs.unlink(`${process.cwd()}/res/${path}`, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    getLstat(path) {
        return fs.lstatSync(`${process.cwd()}/res/${path}`);
    },

    mkDir(path) {
        fs.mkdirSync(`${process.cwd()}/res/${path}`)
    },

    rmDir(path) {
        fs.rmdirSync(`${process.cwd()}/res/${path}`)
    },

    readDir(path) {
        return fs.readdirSync(`${process.cwd()}/res/${path}`);
    },

    divTime(startTime, desc) {
        const s = (new Date() - startTime) / 1000;
        const m = s / 60;
        const h = s / 3600;
        return `${desc} - s: ${s}; m: ${m}; h: ${h}`;
    }
};