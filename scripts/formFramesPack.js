const { readDir, rmDir, mkDir, getLstat, readFile, writeToFile, copyFile } = require('../js-modules/utils/util');
const { spawn } = require('child_process');
const Levenshtein = require('levenshtein');

const devide = async () => {
    const dirs = readDir('videos');

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        // if (name === 'AxLkzGH_jDs') continue;

        const path = `${process.cwd()}/res/videos/${name}`;
        const framePackPath = `${path}/framePack`;
        if (getLstat(`videos/${name}`).isFile()) {
            continue;
        }

        console.log(`#${i}/${dirs.length} ${name}`);

        if (readDir(`videos/${name}`).indexOf('framePack') !== -1) {
            const cmd = `rm -rf ${path}/framePack`.split(' ');
            const rm = spawn(cmd[0], cmd.slice(1));
            await new Promise(resolve => rm.on('close', resolve));
        }
        mkDir(`videos/${name}/framePack`);

        // отсчет времени начинает со следующей секунды второй пачки слов EX: 0 == 00:07 + 00:01
        const mouthFrames = await readMouthFrames(name);
        // const wordsMap = JSON.parse(await readFile(`videos/${name}/wordsMap.json`)).fragments;
        const words = JSON.parse(await readFile(`videos/${name}/words.json`));
        const youtubeWords = await readYoutubeWords(name);
        let kaldiAlignment = await readKaldiAlignment(name);

        const START_TIME = Number(words[1].time.slice(3)) + 1; // in seconds
        const START_WORD = words[1].text.split(' ')[0];
        const FRAMES_PER_S = 25;

        let k = 0;
        for (;k < kaldiAlignment.length; k++) {
            if (START_WORD === kaldiAlignment[k].word) break;
        }

        kaldiAlignment = kaldiAlignment.slice(k);

        // //TODO запустить формирование кадров
        // //TODO выровнять все слова с youtube и kaldi, если слово не совпадает, значит ставим null (из-за того что слова не правильно определяются получается гавно)
        // let resq = [];
        // for (let j = 0, g = 0; j < youtubeWords.length; j++) {
        //     console.log(youtubeWords[j], kaldiAlignment[g].word);
        //     const l = new Levenshtein(youtubeWords[j], kaldiAlignment[g].word);
        //     if (l.distance <= 2 ) {
        //         resq.push(youtubeWords[j]);
        //         g++;
        //     }
        // }

        // console.log(resq);
        // break;

        const kk = kaldiAlignment[0].start / START_TIME;
        for (let j = 0; j < kaldiAlignment.length; j++) {
            const wordData = kaldiAlignment[j];
            const id = `f${j}`;
            const word = wordData.word;
            console.log(`#${j + 1}/${kaldiAlignment.length} ${id}`);

            const start = wordData.start / kk;
            const end = wordData.end / kk;

            const startFrameNumber = Math.floor(start * FRAMES_PER_S);
            const endFrameNumber = Math.floor(end * FRAMES_PER_S);

            // console.log(start, end, wordData.word, kk, startFrameNumber, endFrameNumber);

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

const readKaldiAlignment = async (name) => {
    const lines = [];
    await processFile(`${process.cwd()}/res/videos/${name}/kaldiWordsMap.out`, line => {
        line = line && line.trim();
        if (line && line !== '') {
            const split = line.split(' ');
            lines.push({
                word: split[4],
                start: Number(split[2]),
                end: Number(split[2]) + Number(split[3])
            });
        }
    });
    return lines;
}

const readYoutubeWords = async (name) => {
    const lines = [];
    await processFile(`${process.cwd()}/res/videos/${name}/words.txt`, line => {
        lines.push(line);
    });
    return lines;
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