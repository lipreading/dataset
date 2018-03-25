const { readDir } = require('../js-modules/utils/util');
const { spawn } = require('child_process');

const convert = async () => {
    const dirs = readDir('videos');

    for (let i = 0; i < dirs.length; i++) {
        const path = `${process.cwd()}/res/videos/${dirs[i]}/${dirs[i]}`;
        console.log(`#${i}/${dirs.length} ${dirs[i]}`);

        //mpg123 -w output.wav input.mp3
        const cmd = `mpg123 -w ${path}.wav ${path}.mp3`.split(' ');
        const mpg123 = spawn(cmd[0], cmd.slice(1));
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