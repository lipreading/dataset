const { readDir, rmDir, mkDir, getLstat, readFile } = require('../js-modules/utils/util');
const { spawn } = require('child_process');

const devide = async () => {
    const dirs = readDir('videos');

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        const path = `${process.cwd()}/res/videos/${name}`;
        const framePackPath = `${path}/framePack`;
        if (getLstat(`videos/${name}`).isFile()) {
            continue;
        }

        console.log(`#${i}/${dirs.length} ${name}`);
        if (readDir(`videos/${name}`).indexOf('framePack') !== -1) {
            rmDir(`videos/${name}/framePack`);
        }
        mkDir(`videos/${name}/framePack`);

        // отсчет времени начинает со следующей секунды второй пачки слов EX: 0 == 00:07 + 00:01
    }
};

(async () => {
    await devide();
})();