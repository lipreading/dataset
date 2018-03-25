const Browser = require('../js-modules/browser/Browser');
const getSubtitlesFromBrowser = require('../js-modules/getSubtitlesFromBrowser');
const { readDir, getLstat, writeToFile } = require('../js-modules/utils/util');

const browser = new Browser();

(async () => {
    const dirs = readDir('videos');
    // const dirs = ['wqEgfScm2rs', 'xeOp8ZJZmsY'];

    for (let i = 0; i < dirs.length; i++) {
        const videoName = dirs[i];
        console.log(`#${i}/${dirs.length} ${videoName}`);
        try {
            const status = getLstat(`videos/${videoName}`);
            if (status.isDirectory()) {
                await browser.createBuilder();
                const url = `https://www.youtube.com/watch?v=${videoName}`;
                await browser.openPage(url);
                await browser.waitUntil({
                    id: 'menu'
                });
                await browser.wait(3000);

                const subtitles = await getSubtitlesFromBrowser(browser);
                await writeToFile(`videos/${videoName}/words.json`, JSON.stringify(subtitles));
            }
        } catch (err) {
            console.log(`${err}; url=${videoName}`)
        } finally {
            await browser.removeBuilder();
        }
    }
})();
