const { readDir, getLstat, readFile, writeToFile, rmDir, mkDir } = require('../../js-modules/utils/util');
const { spawn } = require('child_process');

const setAlignment = async () => {
    const dirs = readDir('videos');
    // const dirs = ['_7850nIvQcg'];

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        if (name === '.DS_Store') continue;
        console.log(`#${i + 1}/${dirs.length} ${name}`);

        const words = JSON.parse(await readFile(`videos/${name}/words.json`));
        const videoPath = `${process.cwd()}/res/videos/${name}`;
        const alignmentDataPath = `${videoPath}/alignment-data`;

        for (let j = 0; j < words.length - 1; j++) {
            const text = words[j].text.split(' ').join('\n');
            await writeToFile(`videos/${name}/alignment-data/${j}.txt`, text);
        }
    }
};

(async () => {
    await setAlignment();
})();
