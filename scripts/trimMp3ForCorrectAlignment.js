const { readDir, removeFile, getLstat, readFile } = require('../js-modules/utils/util');
const { spawn } = require('child_process');

const devide = async () => {
    const dirs = readDir('videos');

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        const path = `${process.cwd()}/res/videos/${name}`;
        if (getLstat(`videos/${name}`).isFile()) {
            continue;
        }

        console.log(`#${i + 1}/${dirs.length} ${name}`);
        const newName = `${name}_alignment-trim.mp3`;
        if (readDir(`videos/${name}`).indexOf(newName) !== -1) {
            removeFile(`videos/${name}/${newName}`);
        }

        const words = JSON.parse(await readFile(`videos/${name}/words1.json`));
        // отсчет времени начинает со следующей секунды второй пачки слов EX: 0 == 00:07 + 00:01

        const transformTime = time => {
            const split = time.split(':');
            const newTime = Number(split[1]) + 1;
            return (newTime < 10) ? `${split[0]}:0${newTime}` : `${split[0]}:${newTime}`
        };
        const startTime = `00:${transformTime(words[0].time)}`;
        const endTime = `00:${transformTime(words[words.length - 2].time)}`;

        //ffmpeg -i audio.mp3 -acodec copy -ss 00:00:00 -t 00:01:00 trim_audio.mp3
        const cmd = `ffmpeg -i ${path}/${name}.mp3 -acodec copy -ss ${startTime} -to ${endTime} ${path}/${newName}`.split(' ');
        console.log(cmd.join(' '));
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
