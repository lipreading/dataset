const { readDir, getLstat, readFile, writeToFile, rmDir, mkDir } = require('../../js-modules/utils/util');
const { spawn } = require('child_process');
const http = require('http');
const uuidv1 = require('uuid/v1');
const fetch = require('node-fetch');
const { createReadStream } = require('fs');
const xmlParse = require('xml-parser');


const uuid = uuidv1().replace(/-/g, '');
const check = async () => {
    const dirs = readDir('videos');
    // const dirs = ['_7850nIvQcg'];

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        if (name === '.DS_Store') continue;
        console.log(`#${i + 1}/${dirs.length} ${name}`);

        const words = JSON.parse(await readFile(`videos/${name}/words.json`));
        const videoPath = `${process.cwd()}/res/videos/${name}`;
        const alignmentDataPath = `${videoPath}/alignment-data`;

        // иду по словам words.json и сверяю их с результатом из аудио из speechkit-a
        // проверяю насколько сильно слова отличаются
        // возможно даже убирать большие не соответствия (именно что первые слова отличаются сильно)
        // либо просто заменяю слова полностью из speechkit-a

        const yandexWords = [];
        for (let j = 0; j < words.length; j++) {
            const result = xmlParse(await yandexSpeechKit(j, alignmentDataPath)).root;
            yandexWords.push({
                subtitlesText: words[j].text,
                time: words[j].time,
                yandexData: result
            });
            await writeToFile(`videos/${name}/yandexWords.json`, JSON.stringify(yandexWords));
            console.log(`#${j}/${words.length - 1}`);
        }
    }
};

async function yandexSpeechKit(name, alignmentDataPath) {
    const key = '36e3d30b-c782-483b-9ffe-13f8a98f17ff';
    const lang = 'ru-RU';

    return await fetch(`https://asr.yandex.net/asr_xml?uuid=${uuid}&key=${key}&lang=${lang}&topic=queries`, {
        method: 'POST',
        body: createReadStream(`${alignmentDataPath}/${name}.mp3`),
        headers: {
            'Content-Type': 'audio/x-mpeg-3',
            'Transfer-Encoding': 'chunked'
        }
    }).then(res => res.text());
}

(async () => {
    await check();
})();
