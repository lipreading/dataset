const { readDir, rmDir, mkDir, getLstat, readFile, writeToFile, copyFile } = require('../js-modules/utils/util');
const { spawn } = require('child_process');
const Levenshtein = require('levenshtein');

const devide = async () => {
    const dirs = readDir('videos');

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        const framePackPath = `${process.cwd()}/res/framePacks/${name}`;
        if (getLstat(`videos/${name}`).isFile()) {
            continue;
        }

        console.log(`#${i + 1}/${dirs.length} ${name}`);
        if (readDir(`framePacks`).indexOf(name) !== -1) {
            const cmd = `rm -rf ${framePackPath}`.split(' ');
            const rm = spawn(cmd[0], cmd.slice(1));
            await new Promise(resolve => rm.on('close', resolve));
        }

        mkDir(`framePacks/${name}`);

        // отсчет времени начинает со следующей секунды второй пачки слов EX: 0 == 00:07 + 00:01
        const mouthFrames = await readMouthFrames(name);
        let alignment = (await readAlignment(name)).fragments;

        const FRAMES_PER_S = 25;

        for (let j = 0; j < alignment.length; j++) {
            const wordData = alignment[j];
            const id = wordData.id;
            const word = wordData.lines[0];

            const start = wordData.begin;
            const end = wordData.end;

            const startFrameNumber = Math.floor(start * FRAMES_PER_S);
            const endFrameNumber = Math.floor(end * FRAMES_PER_S);
            const framesCount = endFrameNumber - startFrameNumber + 1;

            const foundedKey = finedInMouthFrames(mouthFrames, startFrameNumber, endFrameNumber);
            if (!foundedKey) {
                continue;
            }

            const framePackFrame = `framePacks/${name}/${id}`;
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

const readAlignment = async (name) => {
    return JSON.parse(await readFile(`videos/${name}/wordsMapAeneas.json`));
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