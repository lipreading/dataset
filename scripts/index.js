const readFile = require('../js-modules/utils/util').readFile;
const Browser = require('../js-modules/browser/Browser');
const countWordsFromBrowser = require('../js-modules/countWordsFromBrowser');

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
