const { readDir } = require('../utils/util');
const { spawn } = require('child_process');

const convert = async () => {
    const dirs = readDir('videos');

    //ffmpeg -i "$file" -y -af "volume=$volume" -loglevel quiet "$outdir"/"$name".mp3
    for (let i = 0; i < dirs.length; i++) {
        const path = `${process.cwd()}/res/videos/${dirs[i]}/${dirs[i]}`;
        console.log(`№${i + 1} ${path}`);
        const ffmpeg = spawn('ffmpeg', ['-i', `${path}.mp4`, '-y', '-af', 'volume=2', '-loglevel', 'quiet', `${path}.mp3`]);
        try {
            await getData(ffmpeg);
        } catch (e) {
            console.log(`Error: ${e}`);
        }
    }
};

const getData = async (child) => {
    return new Promise((resolve, reject) => {
        child.stderr.on('data', (data) => {
            reject(data)
        });

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