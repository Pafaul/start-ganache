const request = require('request');

const fs = require('fs');

const bloxyApiKey = 'ACCEd0efRboLa';

function sleep(s) {
    return new Promise((resolve) => {
      setTimeout(resolve, s*1e3);
    });
}

function appendParams(url, obj) {
    for (_objProp in obj) {
        url += `${_objProp}=${obj[_objProp]}&`;

    }
    return url.slice(0, -1);
}

function formatRequest(token, key, format, limit=50) {
    return {
        token,
        key,
        format,
        limit
    }
}

function performRequest(_url) {
    return new Promise(function(resolve, reject) {
        request(_url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject(false);
            }
        });
    })
}

/**
 * @typedef {Object} HolderInfo
 * @property {String} address
 * @property {String} address_type
 * @property {String} annotation
 * @property {String} balance
 */

/**
 * @param {Object} param0
 * @param {String} param0.tokenAddress
 * @param {String} param0.apiKey
 * @returns {Promise<HolderInfo[]>}
 */
async function requestHolderInfo({tokenAddress, apiKey}) {
    const tokenHolderAddress = 'https://api.bloxy.info/token/token_holders_list?';
    const targetUrl = appendParams(
        tokenHolderAddress,
        formatRequest(
            tokenAddress,
            apiKey,
            'structure',
            200
        )
    );
    return JSON.parse(await performRequest(targetUrl));
}

/**
 * @typedef {Object} TokenInfo
 * @property {String} address
 * @property {String} name
 * @property {String} symbol
 * @property {String} type
 * @property {Number} decimals
 */

/**
 * @param {Object} param0 
 * @param {String} param0.tokenAddress
 * @param {String} param0.apiKey
 * @returns {Promise<TokenInfo>}
 */
async function requestTokenInfo({tokenAddress, apiKey}) {
    const tokenInfoAddress = 'https://api.bloxy.info/token/token_info?';
    const targetUrl = appendParams(
        tokenInfoAddress,
        {
            token: tokenAddress,
            key: apiKey
        }
    )
    return JSON.parse(await performRequest(targetUrl))[0];
}

/**
 * @param {HolderInfo[]} tokenHolders 
 * @returns {HolderInfo}
 */
function findTopWallet(tokenHolders) {
    for (let info of tokenHolders) {
        if (info.address_type == 'Wallet')
            return info;
    }
    throw new Error('Holder not found');
}

/**
 * @typedef {Object} Token
 * @property {String} address
 * @property {String} holder
 * @property {String} name
 * @property {String} symbol
 * @property {Number} decimals
 */

/**
 * @param {Object} param0 
 * @param {HolderInfo[]} param0.holderInfo
 * @param {TokenInfo[]} param0.tokenInfo
 * @param {Boolean} param0.byAddress
 * @returns {Record<String, Token>}
 */
function constructTokenInfo({
    holderInfo,
    tokenInfo,
    byAddress = false
}) {
    const returnObj = {};
    for (let tokenId = 0; tokenId < holderInfo.length; tokenId++) {
        const _hInfo = holderInfo[tokenId];
        const _tInfo = tokenInfo[tokenId];
        if (byAddress) {
            returnObj[_tInfo.address] = {
                address: _tInfo.address,
                decimals: _tInfo.decimals,
                holder: _hInfo.address,
                name: _tInfo.name,
                symbol: _tInfo.symbol
            }
        } else {
            returnObj[_tInfo.symbol] = {
                address: _tInfo.address,
                decimals: _tInfo.decimals,
                holder: _hInfo.address,
                name: _tInfo.name,
                symbol: _tInfo.symbol
            }
        }
    }

    return returnObj;
}

/**
 * @typedef {Object} GetTokensOptions
 * @property {Boolean} byAddress
 * @property {Boolean} cached
 * @property {Boolean} verbose
 * @property {Boolean} debug
 * @property {Number} retries
 * @property {String} writeToFile
 * @property {Record<String, Token>} knownTokens
 */

/**
 * @param {Object} param0 
 * @param {String} param0.tokens
 * @param {String} param0.apiKey
 * @param {GetTokensOptions} param0.options
 * @returns {Record<String, Token>}
 */
async function getTokenInfo({
    tokens,
    apiKey,
    options = {
        retries: 1,
        knownTokens: {}
    },
}) {
    console.log(`Gathering tokens info...`);
    const holdersInfo = [];
    const tokensInfo = [];
    if (
        options.cached &&
        Boolean(options.writeToFile) &&
        fs.existsSync(options.writeToFile)
    ) {
        return JSON.parse(fs.readFileSync(options.writeToFile));
    }

    let obj;

    if (!options.knownTokens) options.knownTokens = {};

    for (let token of tokens) {
        if (token.toLowerCase() in options.knownTokens) {
            continue;
        }

        if (options.verbose) {
            console.log(`Gathering info for token ${token}`);
        }
        let holderInfo;
        let topHolder;
        let success = false;
        for (let tryId = 0; tryId < options.retries; tryId++) {
            try {
                if (options.debug) {
                    console.log(`Trying to fetch holder info for ${token}`);
                }
                holderInfo = await requestHolderInfo({
                    tokenAddress: token,
                    apiKey
                });
                topHolder = findTopWallet(holderInfo);
                success = true;
                break;
            } catch(err) {
                if (options.debug) {
                    console.log(`Fetching holder info try ${tryId} failed`);
                }
                await sleep(1);
            }
        }
        if (!success) {
            throw new Error(`Cannot fetch holders for token ${token}`);
        }

        success = false;
        let tokenInfo;
        for (let tryId = 0; tryId < options.retries; tryId++) {
            try {
                if (options.debug) {
                    console.log(`Trying to fetch token info for ${token}`);
                }
                tokenInfo = await requestTokenInfo({
                    tokenAddress: token,
                    apiKey
                });
                success = true;
                break;
            } catch(err) {
                if (options.debug) {
                    console.log(`Fetching token info try ${tryId}} failed`);
                }
                await sleep(1);
            }
        }

        if (!success) {
            throw new Error(`Cannot fetch token info for token ${token}`);
        }
        holdersInfo.push(topHolder);
        tokensInfo.push(tokenInfo);
        await sleep(1);
    }

    obj = {
        ...constructTokenInfo({
            holderInfo: holdersInfo,
            tokenInfo: tokensInfo,
            byAddress: options.byAddress
        }),
        ...options.knownTokens
    }

    if (Boolean(options.writeToFile)) {
        fs.writeFileSync(options.writeToFile, JSON.stringify(obj, null, '\t'));
    }

    return obj;
}

async function main({
    tokensFile,
    fileToWrite
}) {
    
    const tokens = require(tokensFile);

    const obj = await getTokenInfo({
        tokens,
        apiKey,
        options: {
            byAddress: true,
            retries: 3,
            debug: true,
            verbose: true
        }
    });

    if (fileToWrite) {
        fs.writeFileSync(fileToWrite, JSON.stringify(obj, null, '\t'));
    }
}

if (require.main === module) {
    const tokensFile = process.argv[2];
    const fileToWrite = process.argv[3];

    main({
        tokensFile,
        fileToWrite
    }).then(
        () => console.log(`Gathered token info`)
    ).catch(
        (err) => {
            console.log(`Error occured: ${err}`);
        }
    );

} else {
    module.exports = {
        getTokenInfo,
        bloxyApiKey
    }
}
