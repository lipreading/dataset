const { readDir } = require('../js-modules/utils/util');
const { spawn } = require('child_process');

const convert = async () => {
    const dirs = readDir('videos');

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        if (name === '.DS_Store') {
            continue;
        }
        const path = `${process.cwd()}/res/videos/${name}/${name}`;

        console.log(`#${i + 1}/${dirs.length} ${name}`);
        if (readDir(`videos/${name}`).indexOf(`${name}.mp3`) !== -1) {
            continue;
        }

        //ffmpeg -i "$file" -y -af "volume=$volume" -loglevel quiet "$outdir"/"$name".mp3
        const cmd = `ffmpeg -i ${path}.mp4 -y -af volume=2 -loglevel quiet ${path}.mp3`.split(' ');
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