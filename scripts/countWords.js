const utils = require('../utils/util');
const writeToFile = require('../utils/util').writeToFile;
const getSubtitles = require('./getSubtitles');

const videosWords = {};

const countWords = async (data) => {
    const {urls, browser, startTime} = data;

    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        await browser.createBuilder();
        url = `https://www.youtube.com/watch?v=${url}`;
        await browser.openPage(url);
        await browser.wait(3000);

        const subtitles = await getSubtitles(browser);
        await parseWords(subtitles);

        await browser.removeBuilder();
    }

    const result = Object.keys(videosWords).reduce((res, word) => {
        // if (word.length > 4 && word.length < 12 && videosWords[word] > 100) {
        res[word] = videosWords[word];
        // }
        return res;
    }, {});
    await writeToFile('words.json', JSON.stringify(result));
    console.log(utils.divTime(startTime, 'Посчитал слова в видосах'));
};

/* Парсер слов */
const parseWords = async (subtitles) => {
    subtitles.forEach(sub => {
        const text = sub.text.split(' ');
        text.forEach(word => {
            if (videosWords[word]) {
                videosWords[word] += 1;
            } else {
                videosWords[word] = 1;
            }
        });
    });
};

module.exports = countWords;