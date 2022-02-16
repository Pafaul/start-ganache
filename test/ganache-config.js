const tokens = require('./tokens.json');

module.exports = {
    accounts: [],
    fork: "istanbul",
    tokenSearchOptions: {
        byAddress: true,
        cached: true,
        verbose: true,
        writeToFile: './output-ganache.json'
    },
    tokens
}

