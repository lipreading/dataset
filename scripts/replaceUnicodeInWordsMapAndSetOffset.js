const { readDir, getLstat, readFile, writeToFile } = require('../js-modules/utils/util');

const replaceUnicode = async () => {
    // const dirs = readDir('videos');
    const argv = process.argv;
    let dirs = [];
    for (let j = 0; j < argv.length; j++) {
        if (argv[j] === '--name') {
            dirs.push(argv[j + 1]);
        }
    }

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        const path = `${process.cwd()}/res/videos/${name}`;
        if (getLstat(`videos/${name}`).isFile()) {
            continue;
        }
        console.log(`#${i + 1}/${dirs.length} ${name}`);
        const words = JSON.parse(await readFile(`videos/${name}/words1.json`));
        const offset = parseInt(words[0].time.slice(3)) + 1;
        const wordsMap = JSON.parse(await readFile(`videos/${name}/wordsMapAeneas.json`));
        wordsMap.fragments.forEach(obj => {
            obj.begin = parseFloat(obj.begin) + offset;
            obj.end = parseFloat(obj.end) + offset;
            const lines = obj.lines;
            const line = lines[0];
            obj.lines = [line.split('').join('')];
        });

        await writeToFile(`videos/${name}/wordsMapAeneas.json`, JSON.stringify(wordsMap));
    }
};

(async () => {
    await replaceUnicode();
})();