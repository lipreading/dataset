const {Builder, By, Key, until} = require('selenium-webdriver');

class Browser {
    constructor() {

    }

    static checkArgs(args) {
        const checkArgs = ['urls'];
        Object.keys(args).forEach(key => {
            const index = checkArgs.indexOf(key);
            if (index === -1 || typeof args[key] === 'undefined') throw new Error('wrong args');
        });
        return args;
    }

    async createBuilder() {
        this._driver = await new Builder().forBrowser('firefox').build();
    }

    async removeBuilder() {
        await this._driver.quit();
    }

    async openPage(url) {
        try {
            await this._driver.get(url);
        } finally {
            await this.removeBuilder();
        }
    }
}

module.exports = Browser;