const { readDir, rmDir, mkDir, getLstat, readFile, writeToFile, copyFile } = require('../js-modules/utils/util');
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
        const cmd = `rm -rf ${path}/framePack`.split(' ');
        const rm = spawn(cmd[0], cmd.slice(1));
        await new Promise(resolve => rm.on('close', resolve));
        // if (readDir(`videos/${name}`).indexOf('framePack') !== -1) {
        //     rmDir(`videos/${name}/framePack`);
        // }
        mkDir(`videos/${name}/framePack`);


        // отсчет времени начинает со следующей секунды второй пачки слов EX: 0 == 00:07 + 00:01
        const mouthFrames = await readMouthFrames(name);
        const wordsMap = JSON.parse(await readFile(`videos/${name}/wordsMap.json`)).fragments;
        const words = JSON.parse(await readFile(`videos/${name}/words.json`));

        const START_TIME = Number(words[1].time[4]) + 1; // in seconds
        const FRAMES_PER_S = 25;

        for (let j = 0; j < wordsMap.length; j++) {
            const wordData = wordsMap[j];
            const id = wordData.id;
            const word = wordData.lines[0];
            console.log(`#${j + 1}/${wordsMap.length} ${id}`);

            const start = Number(wordData.begin) + START_TIME;
            const end = Number(wordData.end) + START_TIME;

            const startFrameNumber = Math.floor(start * FRAMES_PER_S);
            const endFrameNumber = Math.floor(end * FRAMES_PER_S);
            const framesCount = endFrameNumber - startFrameNumber + 1;

            const foundedKey = finedInMouthFrames(mouthFrames, startFrameNumber, endFrameNumber);
            if (!foundedKey) {
                continue;
            }

            /* if (framesCount > FRAMES_PER_S) {

            } else if (framesCount < FRAMES_PER_S) {

            } else {

            } */

            const framePackFrame = `videos/${name}/framePack/${id}`;
            mkDir(framePackFrame);

            await writeToFile(`${framePackFrame}/__data.json`, JSON.stringify({
                word: word,
                time: {
                    start: start,
                    end: end
                },
                frames: {
                    start: startFrameNumber,
                    end: endFrameNumber
                }
            }));

            for (let q = startFrameNumber; q < endFrameNumber + 1; q++) {
                copyFile(`videos/${name}/mouth_frames/${q}.jpg`, `${framePackFrame}/${q}.jpg`);
            }
        }
    }
};

const finedInMouthFrames = (mouthFrames, startFrameNumber, endFrameNumber) => {
    const keys = Object.keys(mouthFrames);
    let result = false;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const start = key.split('_')[0];
        const end = key.split('_')[1];

        if (startFrameNumber >= start && endFrameNumber <= end) {
            result = key;
            break;
        }
    }
    return result;
}

const readMouthFrames = async (name) => {
    const lines = {};
    await processFile(`${process.cwd()}/res/videos/${name}/mouth_frames/__data/data.csv`, line => {
        if (line && line.trim() !== '') {
            const split = line.split(',');
            if (split.length > 25) {
                lines[`${split[0]}_${split[split.length - 1]}`] = split;
            }
        }
    });
    return lines;
}

const processFile = (inputFile, callback) => {
    return new Promise((resolve) => {
        const fs = require('fs');
        const readline = require('readline');
        const instream = fs.createReadStream(inputFile);
        const outstream = new (require('stream'))();
        const rl = readline.createInterface(instream, outstream);

        rl.on('line', callback);
        rl.on('close', function (line) {
            callback(line);
            resolve();
        });
    });
}

(async () => {
    await devide();
})();