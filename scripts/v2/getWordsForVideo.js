const Browser = require('../../js-modules/browser/Browser');
const getSubtitlesFromBrowser = require('../../js-modules/getSubtitlesFromBrowser');
const { readDir, getLstat, writeToFile, removeFile } = require('../../js-modules/utils/util');

const browser = new Browser();

(async () => {
    const dirs = readDir('videos');

    for (let i = 0; i < dirs.length; i++) {
        const videoName = dirs[i];
        if (videoName === '.DS_Store') continue;
        console.log(`#${i + 1}/${dirs.length} ${videoName}`);

        try {
            removeFile(`videos/${videoName}/words.json`);
            await browser.createBuilder();
            const url = `https://www.youtube.com/watch?v=${videoName}`;
            await browser.openPage(url);
            await browser.waitUntil({
                id: 'menu'
            });
            await browser.wait(5000);

            const subtitles = await getSubtitlesFromBrowser(browser);
            await writeToFile(`videos/${videoName}/words.json`, JSON.stringify(subtitles));

        } catch(err) {
            console.log(`${err}; url=${videoName}`)
        } finally {
            await browser.removeBuilder();
        }
    }
})();
