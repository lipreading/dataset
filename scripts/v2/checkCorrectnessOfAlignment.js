const { readDir, getLstat, readFile, writeToFile, rmDir, mkDir } = require('../../js-modules/utils/util');
const { spawn } = require('child_process');

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
    }
};

(async () => {
    await check();
})();
