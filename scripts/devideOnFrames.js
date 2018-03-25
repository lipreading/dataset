const { readDir, rmDir, mkDir, removeFile, getLstat } = require('../js-modules/utils/util');
const { spawn } = require('child_process');

const devide = async () => {
    const dirs = readDir('videos');

    for (let i = 0; i < dirs.length; i++) {
        const path = `${process.cwd()}/res/videos/${dirs[i]}`;
        if (getLstat(`videos/${dirs[i]}`).isFile()) {
            continue;
        }

        if (readDir(`videos/${dirs[i]}/`).indexOf('frames') === -1) {
            mkDir(`videos/${dirs[i]}/frames`);
        } else {
            continue;
            /* const oldFrames = readDir(`videos/${dirs[i]}/frames`);
            for (let j = 0; j < oldFrames.length; j++) {
                removeFile(`videos/${dirs[i]}/frames/${oldFrames[j]}`);
            } */
        }

        console.log(`#${i}/${dirs.length} ${dirs[i]}`);

        //ffmpeg -i res/videos/__ip9j2dZfM/__ip9j2dZfM.mp4 res/videos/__ip9j2dZfM/frames/thumb%04d.jpg -hide_banner
        const cmd = `ffmpeg -i ${path}/${dirs[i]}.mp4 ${path}/frames/thumb%04d.jpg -hide_banner`.split(' ');
        const ffmpeg = spawn(cmd[0], cmd.slice(1));
        try {
            await getData(ffmpeg);
        } catch (e) {
            console.log(`Error: ${e}`);
        }

    }
};

const getData = async (child) => {
    return new Promise((resolve, reject) => {
        child.stderr.on('data', data => {
            console.log(data.toString());
        });

        child.on('close', code => {
            if (code === 0) {
                resolve();
            } else {
                reject(`child process exited with code ${code}`);
            }
        });
    });
};

(async () => {
    await devide();
})();