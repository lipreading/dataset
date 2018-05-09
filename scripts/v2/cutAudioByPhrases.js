const { readDir, getLstat, readFile, writeToFile, rmDir, mkDir } = require('../../js-modules/utils/util');
const { spawn } = require('child_process');

const cut = async () => {
    const dirs = readDir('videos');
    // const dirs = ['_7850nIvQcg'];

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        if (name === '.DS_Store') continue;
        console.log(`#${i + 1}/${dirs.length} ${name}`);

        const words = JSON.parse(await readFile(`videos/${name}/words.json`));
        const videoPath = `${process.cwd()}/res/videos/${name}`;
        const alignmentDataPath = `${videoPath}/alignment-data`;

        const cmd = `rm -rf ${alignmentDataPath}`.split(' ');
        const rm = spawn(cmd[0], cmd.slice(1));
        await new Promise(resolve => rm.on('close', resolve));
        mkDir(`videos/${name}/alignment-data`);

        const cutAudio = async (startTime, endTime, filename) => {
            //ffmpeg -i audio.mp3 -acodec copy -ss 00:00:00 -t 00:01:00 trim_audio.mp3
            if (startTime === endTime) {
                const split = endTime.split(':');
                let min = parseInt(split[1]);
                let sec = parseInt(split[2]);

                if (sec === 59) {
                    sec = 0;
                    min += 1;
                } else {
                    sec += 1;
                }

                endTime = `00:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
            }

            const cmd = `ffmpeg -i ${videoPath}/${name}.mp3 -acodec copy -ss ${startTime} -to ${endTime} ${alignmentDataPath}/${filename}.mp3`.split(' ');
            const ffmpeg = spawn(cmd[0], cmd.slice(1));
            try {
                await getData(ffmpeg);
            } catch (e) {
                console.log(`Error: ${e}`);
            }
        };

        const parseTimeToSeconds = (time) => {
            const split = time.split(':');
            const mins = parseInt(split[0]);
            const seconds = parseInt(split[1]);

            return mins * 60 + seconds;
        };

        for (let j = 0; j < words.length - 1; j++) {
            const el1 = words[j];
            const el2 = words[j + 1];

            /* const ffmpegTimeStart = `00:${el1.time}.5`;
            const ffmpegTimeEnd = `00:${el2.time}.5`; */
            const ffmpegTimeStart = `00:${el1.time}.5`;
            const ffmpegTimeEnd = `00:${el2.time}.5`;

            console.log(`#${j} ${ffmpegTimeStart} ${ffmpegTimeEnd}`);
            await cutAudio(ffmpegTimeStart, ffmpegTimeEnd, j);
        }
    }

    async function getData(child) {
        return new Promise((resolve, reject) => {
            // child.stderr.on('data', data => console.log(data.toString()));
            child.on('close', code => code === 0 ? resolve() : reject(`child process exited with code ${code}`));
        });
    };
};

(async () => {
    await cut();
})();
