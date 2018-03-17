const readFile = require('../utils/util').readFile;
const Browser = require('../browser/Browser');
const countWords = require('./countWords');

const browser = new Browser();
let CONFIG = {};
const START_TIME = new Date();

(async () => {
    CONFIG = JSON.parse(await readFile('init.json'));
    await countWords({
        browser: browser,
        startTime: START_TIME,
        urls: CONFIG.urls
    });
})();
