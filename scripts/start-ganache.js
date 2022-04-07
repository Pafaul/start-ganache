const { getTokenInfo, bloxyApiKey } = require("./requests");

const child_process = require('child_process');
const { networksToEndpoints } = require("./config");

require('dotenv').config();
const {
    INFURA_ID_PROJECT = "912668c188114c6fb74af1746ada48c5",
    NETWORK = 'ETH',
    PORT = 8545
} = process.env;

/**
 * @typedef {Object} GanacheConfig
 * @property {String} fork
 * @property {Number} gasLimit
 * @property {String[]} accounts
 * @property {String[]} tokens
 * @property {import('./requests').GetTokensOptions} tokenSearchOptions
 */

function checkInfuraId() {
    if (INFURA_ID_PROJECT == '') {
        throw new Error('ID of infura project is not specified');
    }
}

function getEndpoint() {
    if (NETWORK in networksToEndpoints) {
        const endpointName = networksToEndpoints[NETWORK];
        if (endpointName.indexOf('infura') >= 0) {
            checkInfuraId();
            return networksToEndpoints[NETWORK] + INFURA_ID_PROJECT;
        }

        return networksToEndpoints[NETWORK];
    }

    throw new Error(`Unknown network ${NETWORK}`);
}

/**
 * @param {Record<String, import("./requests").Token>} obj 
 * @returns {String[]}
 */
function getAccountsFromObj(obj) {
    const accounts = [];
    for (let token in obj) {
        const tokenInfo = obj[token];
        accounts.push(tokenInfo.holder);
    }
    return accounts;
}

/**
 * @param {GanacheConfig} launchParams 
 * @returns {Promise<String>}
 */
async function createGanacheCliString(launchParams) {
    
    if (!Boolean(launchParams.accounts)) {
        launchParams.accounts = [];
    }
    
    let ganacheString = `ganache --gasLimit ${launchParams.gasLimit? String(launchParams.gasLimit) : '9000000'} -e 100000 ${launchParams.fork ? `-k ` + launchParams.fork : ''} ${PORT == '' ? '' : '-p ' + PORT} --fork `;

    let endpointString = getEndpoint();

    let obj = {}
    if (launchParams.tokens.length > 0) {
        obj = await getTokenInfo({
            tokens: launchParams.tokens,
            apiKey: bloxyApiKey,
            options: launchParams.tokenSearchOptions
        });
    }

    if (Object.keys(obj).length > 0)
        launchParams.accounts = launchParams.accounts.concat(getAccountsFromObj(obj));

    let unlockedAccounts = launchParams.accounts.length > 0 ? `${' --unlock "'  + launchParams.accounts.join('" --unlock "') + '"'}` : '';

    ganacheString += endpointString + unlockedAccounts;

    return ganacheString;
}

/**
 * @typedef {Object} GanacheSpawnOptions
 * @property {Boolean} stdout
 * @property {Boolean} stderr
 */

/**
 * @param {String} ganacheString 
 * @param {GanacheSpawnOptions} ganacheStartOptions
 * @returns {child_process.ChildProcess}
 */
function startGanache(ganacheString, ganacheStartOptions) {
    let ganacheProcess = child_process.exec(ganacheString, {killSignal: 'SIGINT', detached: true});
    if (ganacheStartOptions) {
        if (ganacheStartOptions.stdout) {
            ganacheProcess.stdout.on('data', (data) => console.log(data));
        }
        if (ganacheStartOptions.stderr) {
            ganacheProcess.stderr.on('data', (data) => console.log(data));
        }
    }

    return ganacheProcess;
}

async function runGanache() {
    const configFile = process.argv[2];
    const launchParams = require(configFile);
    console.log(`Starting ganache...`)
    let string = await createGanacheCliString(launchParams);
    console.log(string);
    startGanache(string, {
        stderr: true,
        stdout: true
    });
}

if (require.main === module) {
    runGanache().then(
        () => console.log(`Ganache started`)
    ).catch(
        (err) => { 
            console.log(err)
        }
    )
} else {
    module.exports = {
        createGanacheCliString,
        startGanache,
        getEndpoint
    }
}