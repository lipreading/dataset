const { readDir, getLstat, readFile, writeToFile, rmDir, mkDir, copyFile } = require('../../js-modules/utils/util');
const { spawn } = require('child_process');

const form = async () => {
    const dirs = readDir('videos');
    // const dirs = ['_7850nIvQcg'];

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        if (name === '.DS_Store') continue;
        console.log(`#${i + 1}/${dirs.length} ${name}`);

        const words = JSON.parse(await readFile(`videos/${name}/words.json`));
        const videoPath = `${process.cwd()}/res/videos/${name}`;
        const alignmentDataPath = `${videoPath}/alignment-data`;
        const framePackPath = `${process.cwd()}/res/framePacks/${name}`;

        if (readDir(`framePacks`).indexOf(name) !== -1) {
            const cmd = `rm -rf ${framePackPath}`.split(' ');
            const rm = spawn(cmd[0], cmd.slice(1));
            await new Promise(resolve => rm.on('close', resolve));
        }
        mkDir(`framePacks/${name}`);

        const FRAMES_PER_S = 25;

        const alignment = JSON.parse(await readFile(`videos/${name}/alignment-data/__result.json`));
        const mouthFrames = await readMouthFrames(name);

        for (let j = 0; j < alignment.length; j++) {
            const start = alignment[j].startTime;
            let end = alignment[j].endTime;
            if (start === end) end += 1;
            const word = alignment[j].word;

            const startFrameNumber = Math.floor(start * FRAMES_PER_S);
            const endFrameNumber = Math.ceil(end * FRAMES_PER_S);
            const framesCount = endFrameNumber - startFrameNumber + 1;

            const foundedKey = finedInMouthFrames(mouthFrames, startFrameNumber, endFrameNumber);
            if (!foundedKey) {
                continue;
            }

            const framePackFrame = `framePacks/${name}/${j}`;
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

            for (let q = startFrameNumber; q <= endFrameNumber; q++) {
                copyFile(`videos/${name}/mouth_frames/${q}.jpg`, `${framePackFrame}/${q}.jpg`);
            }
        }
    }

    async function getData(child) {
        return new Promise((resolve, reject) => {
            // child.stderr.on('data', data => console.log(data.toString()));
            child.on('close', code => code === 0 ? resolve() : reject(`child process exited with code ${code}`));
        });
    };
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
    await form();
})();
