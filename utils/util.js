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

    writeToFile(fileName, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(`${process.cwd()}/res/${fileName}`, data, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    readFile(fileName) {
        return new Promise((resolve, reject) => {
            fs.readFile(`${process.cwd()}/res/${fileName}`, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    },

    divTime(startTime, desc) {
        const s = (new Date() - startTime) / 1000;
        const m = s / 60;
        const h = s / 3600;
        return `${desc} - s: ${s}; m: ${m}; h: ${h}`;
    }
};