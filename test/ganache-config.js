const tokens = require('./tokens.json');

module.exports = {
    accounts: [],
    fork: "berlin",
    gasLimit: 9000000,
    tokenSearchOptions: {
        byAddress: true,
        cached: false,
        verbose: true,
        debug: true,
        writeToFile: './output-ganache.json'
    },
    tokens
}

