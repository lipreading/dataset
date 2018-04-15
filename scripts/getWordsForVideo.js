const Browser = require('../js-modules/browser/Browser');
const getSubtitlesFromBrowser = require('../js-modules/getSubtitlesFromBrowser');
const { readDir, getLstat, writeToFile, removeFile } = require('../js-modules/utils/util');

const browser = new Browser();

(async () => {
    const dirs = readDir('videos');
    // const dirs = ['_7850nIvQcg'];

    for (let i = 0; i < dirs.length; i++) {
        const videoName = dirs[i];
        console.log(`#${i + 1}/${dirs.length} ${videoName}`);

        try {
            const status = getLstat(`videos/${videoName}`);
            if (status.isDirectory()) {
                if (readDir(`videos/${videoName}`).indexOf('words.json') !== -1) {
                    removeFile(`videos/${videoName}/words.json`);
                    removeFile(`videos/${videoName}/words1.json`);
                    removeFile(`videos/${videoName}/words.txt`);
                };

                await browser.createBuilder();
                const url = `https://www.youtube.com/watch?v=${videoName}`;
                await browser.openPage(url);
                await browser.waitUntil({
                    id: 'menu'
                });
                await browser.wait(3000);

                const subtitles = await getSubtitlesFromBrowser(browser);
                await writeToFile(`videos/${videoName}/words.json`, JSON.stringify(subtitles));

                const subtitles1 = subtitles.reduce((res, el, i) => {
                    const text = el.text;
                    if (text !== '[музыка]' && subtitles[i + 1] && subtitles[i + 1].text !== '[музыка]') {
                        res.push(el);
                    }
                    return res;
                }, []);
                await writeToFile(`videos/${videoName}/words1.json`, JSON.stringify(subtitles1));

                let wordsTxt = subtitles.map(data => data.text).slice(1);
                wordsTxt = wordsTxt.reduce((res, el, i) => {
                    if (el !== '[музыка]' && wordsTxt[i + 1] && wordsTxt[i + 1] !== '[музыка]') {
                        res.push(el);
                    }
                    return res;
                }, []).reduce((res, el) => {
                    el.split(' ').forEach(word => {
                        res += `${word}\n`;
                    });
                    return res;
                }, '');
                await writeToFile(`videos/${videoName}/words.txt`, wordsTxt);
            }
        } catch (err) {
            console.log(`${err}; url=${videoName}`)
        } finally {
            await browser.removeBuilder();
        }
    }
})();
