const { readDir, writeToFile, removeFile } = require('../js-modules/utils/util');
const { spawn } = require('child_process');

const convert = async () => {
    const dirs = readDir('videos');

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        if (name === '.DS_Store') {
            continue;
        }
        const path = `${process.cwd()}/res/videos/${name}/`;
        const file = `${path}${name}`;
        console.log(`#${i}/${dirs.length} ${name}`);

        //mpg123 -w output.wav input.mp3
        //const cmd = `mpg123 -w ${file}.wav ${file}.mp3`.split(' ');
        const cmd = `ffmpeg -i ${file}.mp3 -ar 8000 ${file}.wav`.split(' ');
        const ffmpeg = spawn(cmd[0], cmd.slice(1));
        try {
            removeFile(`videos/${name}/${name}.wav`)
            await getData(ffmpeg);
            /* removeFile(`videos/${name}/decoder-test.scp`);
            removeFile(`videos/${name}/decoder-test.utt2spk`); */
            //await writeToFile(`videos/${name}/decoder-kaldi.scp`, `decoder ${file}.wav`);
            //await writeToFile(`videos/${name}/decoder-kaldi.utt2spk`, `decoder decoder`);
        } catch (e) {
            console.log(`Error: ${e}`);
        }
    }
};

const getData = async (child) => {
    return new Promise((resolve, reject) => {
/*         child.stderr.on('data', data => {
            console.log(data.toString());
        }); */

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