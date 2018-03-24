const { readDir } = require('../js-modules/utils/util');
const { spawn } = require('child_process');

const convert = async () => {
    const dirs = readDir('videos');

    //mpg123 -w output.wav input.mp3
    for (let i = 0; i < dirs.length; i++) {
        const path = `${process.cwd()}/res/videos/${dirs[i]}/${dirs[i]}`;
        console.log(`№${i + 1} ${path}`);
        const mpg123 = spawn('mpg123', ['-w', `${path}.wav`, `${path}.mp3`]);
        try {
            await getData(mpg123);
        } catch (e) {
            console.log(`Error: ${e}`);
        }
    }
};

const getData = async (child) => {
    return new Promise((resolve, reject) => {
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(`child process exited with code ${code}`);
            }
        });
    });
};

(async () => {
    await convert();
})();