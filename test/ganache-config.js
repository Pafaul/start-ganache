const tokens = require('./tokens.json');

module.exports = {
    accounts: [],
    fork: "istanbul",
    gasLimit: 9000000,
    tokenSearchOptions: {
        byAddress: true,
        cached: true,
        verbose: true,
        debug: true,
        writeToFile: './output-ganache.json'
    },
    tokens
}

