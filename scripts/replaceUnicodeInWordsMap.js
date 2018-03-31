const { readDir, getLstat, readFile, writeToFile } = require('../js-modules/utils/util');

const replaceUnicode = async () => {
    const dirs = readDir('videos');

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        const path = `${process.cwd()}/res/videos/${name}`;
        if (getLstat(`videos/${name}`).isFile()) {
            continue;
        }
        console.log(`#${i}/${dirs.length} ${name}`);
        const wordsMap = JSON.parse(await readFile(`videos/${name}/wordsMap.json`));
        wordsMap.fragments.forEach(obj => {
            const lines = obj.lines;
            const line = lines[0];
            obj.lines = [line.split('').join('')];
        });

        await writeToFile(`videos/${name}/wordsMap.json`, JSON.stringify(wordsMap));
    }
};

(async () => {
    await replaceUnicode();
})();