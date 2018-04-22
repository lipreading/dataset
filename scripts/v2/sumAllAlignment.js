const { readDir, getLstat, readFile, writeToFile, rmDir, mkDir } = require('../../js-modules/utils/util');
const { spawn } = require('child_process');

const sum = async () => {
    const dirs = readDir('videos');
    // const dirs = ['_7850nIvQcg'];

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        if (name === '.DS_Store') continue;
        console.log(`#${i + 1}/${dirs.length} ${name}`);

        const words = JSON.parse(await readFile(`videos/${name}/words.json`));
        const videoPath = `${process.cwd()}/res/videos/${name}`;
        const alignmentDataPath = `${videoPath}/alignment-data`;

        const parseTimeToSeconds = (time) => {
            const split = time.split(':');
            const mins = parseInt(split[0]);
            const seconds = parseInt(split[1]);

            return mins * 60 + seconds;
        };

        const result = [];
        for (let j = 0; j < words.length - 1; j++) {
            const el1 = words[j];
            const el2 = words[j + 1];

            const timeStart = el1.time;
            const timeEnd = el2.time;

            const alignment = JSON.parse(await readFile(`videos/${name}/alignment-data/${j}.json`));
            alignment.fragments.forEach(data => {
                result.push({
                    word: data.lines[0],
                    startTime: parseTimeToSeconds(timeStart) + parseFloat(data.begin),
                    endTime: parseTimeToSeconds(timeStart) + parseFloat(data.end)
                });
            });
        }

        await writeToFile(`videos/${name}/alignment-data/__result.json`, JSON.stringify(result));
    }

    async function getData(child) {
        return new Promise((resolve, reject) => {
            // child.stderr.on('data', data => console.log(data.toString()));
            child.on('close', code => code === 0 ? resolve() : reject(`child process exited with code ${code}`));
        });
    };
};

(async () => {
    await sum();
})();
