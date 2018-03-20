const readFile = require('../utils/util').readFile;
const Browser = require('../browser/Browser');
const countWordsFromBrowser = require('./countWordsFromBrowser');

const browser = new Browser();
let CONFIG = {};
const START_TIME = new Date();

(async () => {
    CONFIG = JSON.parse(await readFile('init.json'));
    await countWordsFromBrowser({
        browser: browser,
        startTime: START_TIME,
        urls: CONFIG.urls
    });
})();
