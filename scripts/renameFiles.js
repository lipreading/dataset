const {
    readFile,
    writeToFile,
    removeFile,
    getLstat,
    mkDir,
    rmDir,
    readDir
} = require('../js-modules/utils/util');

const ignoreFiles = ['.DS_Store'];

const renameFiles = async () => {
    /*const dirs = readDir('videos');
    for (let i = 0; i < dirs.length; i++) {
        const oldDirName = dirs[i];
        const oldFileName = readDir(`videos/${oldDirName}`)[0];
        const data = await readFile(`videos/${oldDirName}/${oldFileName}`);
        if (oldFileName.length > 15) {
            const newFileName = oldFileName.split('-').slice(1).join('-');
            const newFolderName = newFileName.split('.')[0];
            await removeFile(`videos/${oldDirName}/${oldFileName}`);
            rmDir(`videos/${oldDirName}`);
            mkDir(`videos/${newFolderName}`);
            await writeToFile(`videos/${newFolderName}/${newFileName}`, data);
        }

    }*/
    const files = readDir('videos');
    for (let i = 0; i < files.length; i++) {
        const oldFileName = files[i];
        const status = getLstat(`videos/${oldFileName}`);

        if (ignoreFiles.indexOf(oldFileName) === -1 && status.isFile()) {
            const newFileName = oldFileName.split('-').slice(1).join('-');
            console.log(`#${i}/${files.length} ${newFileName}`);

            const folderName = newFileName.split('.')[0];
            const data = await readFile(`videos/${oldFileName}`);
            mkDir(`videos/${folderName}`);
            await writeToFile(`videos/${folderName}/${newFileName}`, data);
            removeFile(`videos/${oldFileName}`);
        }
    }
};

(async () => {
    await renameFiles();
})();