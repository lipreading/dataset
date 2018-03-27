const { readDir, writeToFile } = require('../js-modules/utils/util');
const { spawn } = require('child_process');

const kaldi = async () => {
    // const dirs = readDir('videos');
    const dirs = ['__ip9j2dZfM'];

    for (let i = 0; i < dirs.length; i++) {
        const name = dirs[i];
        const shKaldi = `${process.cwd()}/sh/kaldi.sh`;
        if (name === '.DS_Store') {
            continue;
        }

        const filesPath = `${process.cwd()}/res/videos/${name}/decoder-kaldi`;
        const cmd = `sh ${shKaldi} ${filesPath}`.split(' ');
        const kaldi = spawn(cmd[0], cmd.slice(1));
        try {
            await getData(kaldi);
        } catch (e) {
            console.log(`Error: ${e}`);
        }
    }
};

const getData = async (child) => {
    return new Promise((resolve, reject) => {
        child.stderr.on('data', data => {
            console.log(data.toString());
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(`child process exited with code ${code}`);
            }
        });
    });
};

(async () => {
    await kaldi();
})();