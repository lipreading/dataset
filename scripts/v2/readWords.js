const { readDir, getLstat, writeToFile, removeFile, readFile, readFileSync } = require('../../js-modules/utils/util');

(async () => {
    const words = JSON.parse(await readFile(`words.json`));
    const dirs = readDir('framePacks');

    const addWord = (word) => {
        if (words[word]) {
            words[word] += 1;
        } else {
            words[word] = 1;
        }
    };

    dirs.forEach((dirName, i) => {
        console.log(`#${i + 1}/${dirs.length} ${dirName}`);

        if (dirName === '.DS_Store') return;
        const wordsDirs = readDir(`framePacks/${dirName}`);

        wordsDirs.forEach(wordDirName => {
            if (wordDirName === '.DS_Store') return;
            const data = JSON.parse(readFileSync(`framePacks/${dirName}/${wordDirName}/__data.json`));
            addWord(data.word);
        });
    });

    await writeToFile(`words.json`, JSON.stringify(words));
})();
