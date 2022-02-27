const { 
    createGanacheCliString,
    startGanache
} = require("./scripts/start-ganache");

const {
    getTokenInfo,
    bloxyApiKey
} = require('./scripts/requests');

module.exports = {
    createGanacheCliString,
    startGanache,
    getTokenInfo,
    bloxyApiKey
}

