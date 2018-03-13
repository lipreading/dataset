const parseArgs = require('../utils/util').parseArgs;
const Browser = require('../browser/Browser');

const browser = new Browser();
const args = Browser.checkArgs(parseArgs(process.argv));
const urls = args.urls.split(',');

urls.forEach(async url => {
    await browser.createBuilder();
    url = `https://www.youtube.com/watch?v=${url}`; //R1obPlfmPdo
    await browser.openPage(url);
    await browser.removeBuilder();
});
