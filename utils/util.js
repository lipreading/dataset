module.exports = {
  parseArgs(argv) {
      return argv.reduce((res, key, i) => {
          if (key[0] === '-') {
              res[key.slice(1)] = argv[i + 1];
          }
          return res;
      }, {});
  }
};