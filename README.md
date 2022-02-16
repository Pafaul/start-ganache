# Start ganache

This module provides functionality for starting ganche and finding holders of tokens

There are two modules:
- requests.js -> Performs requests to bloxy.info for obtaining toen info
- start-ganache.js -> Starts ganache with provided parameters and info obtained from requests.js

# How to basic (🥚)

Currently best example how to use these modules in a bundle is presented here:

[Script to launch ganache](https://github.com/barrigaz/arbitrager-contracts/blob/gas-execution-cost/test/misc-tests/gas-calculation/start-ganache/start-ganache.js)

[File with tokens for balancer](https://github.com/barrigaz/arbitrager-contracts/blob/gas-execution-cost/test/misc-tests/gas-calculation/jsondata/balancerTokens.json)

[Example file with gathered token info for balancer](https://github.com/barrigaz/arbitrager-contracts/blob/gas-execution-cost/test/misc-tests/gas-calculation/tmp/tokensBalancer.json)

Options for creating ganache string:

```GanacheConfig``` structure:

```js
/**
 * @typedef {Object} GanacheConfig
 * @property {String} fork
 * @property {Number} gasLimit
 * @property {String[]} accounts
 * @property {String[]} tokens
 * @property {GetTokensOptions} tokenSearchOptions
 */
```

Properties (all are optional):

- ```fork``` -> fork to use (```istanbul```/```berlin```/...)
- ```gasLimit``` -> gas limit for ganache (default - 9000000)
- ```accounts``` -> accounts to unlock (for example in 0x it may be makers addresses)
- ```tokens``` -> tokens array that is passed to ```getTokenInfo``` function for finding info
- ```tokenSearchOptions``` -> options passed to ```getTokenInfo``` function

```GetTokensOptions``` structure:

```js
/**
 * @typedef {Object} GetTokensOptions
 * @property {Boolean} byAddress
 * @property {Boolean} cached
 * @property {Boolean} verbose
 * @property {String} writeToFile
 */
```

All options are optional (: D):

- ```byAddress``` -> result object with token info will use token addresses as keys, recommended for usage if you are not sure which tokens will be used
- ```cached``` -> function will try to retrive file at location ```writeToFile``` and skip gathering token info part
- ```verbose``` -> function will output token address that is currently inspected
- ```writeToFile``` -> file location to write resulting object


# requests.js

## Module's internal functions

These functions are present in module, but are not exported

Request holder info:

```js
/**
 * @param {Object} param0
 * @param {String} param0.tokenAddress
 * @param {String} param0.apiKey
 * @returns {Promise<HolderInfo[]>}
 */
async function requestHolderInfo({tokenAddress, apiKey});
```

Performs request to bloxy to find top 200 holders of token ```tokenAddress``` using provided ```apiKey``` (there is api key included in module) and returns ```HolderInfo```

```HolderInfo``` structure:
```js
/**
 * @typedef {Object} HolderInfo
 * @property {String} address
 * @property {String} address_type
 * @property {String} annotation
 * @property {String} balance
 */

```

Request token info:

```js
/**
 * @param {Object} param0 
 * @param {String} param0.tokenAddress
 * @param {String} param0.apiKey
 * @returns {Promise<TokenInfo>}
 */
async function requestTokenInfo({tokenAddress, apiKey})
```

Performs request to get information about token ```tokenAddress``` using provided ```apiKey``` and returns ```TokenInfo```

```TokenInfo``` structure:
```js
/**
 * @typedef {Object} GetTokensOptions
 * @property {Boolean} byAddress
 * @property {Boolean} cached
 * @property {Boolean} verbose
 * @property {String} writeToFile
 */
```

Find top holder wallet (which is not contract):

```js
/**
 * @param {HolderInfo[]} tokenHolders 
 * @returns {HolderInfo}
 */
function findTopWallet(tokenHolders);
```

Finds top holder wallet in provided array and returns it.


Create output object:

```js
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
})
```

This functions takes ```HolderInfo``` array and corresponding ```TokenInfo``` array, i.e. HolderInfo -> TokenInfo pairs represented as arrays. If ```byAddress``` parameter is ```true``` then resulting object will have token addresses as keys, if set to ```false``` token's symbols will be used as keys for resulting object (more on that later 🙃).

## Module exports

This module exports object:

```js
{
    apiKey,
    getTokenInfo
}
```

Where:
- apiKey - default apiKey for bloxy
- getTokenInfo - function to retreive token info

Get token info function:

```js
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
    options = {}
})
```

This function receives as input: 
- ```tokens``` -> array of token addresses represented as strings
- ```apiKey``` -> apiKey to use, if you don't have one - pass default apiKey (exported from module)
- ```options``` -> options for result representation (check ```GetTokensOptions``` type)

```GetTokensOptions``` structure:

```js
/**
 * @typedef {Object} GetTokensOptions
 * @property {Boolean} byAddress
 * @property {Boolean} cached
 * @property {Boolean} verbose
 * @property {String} writeToFile
 */
```

All options are optional (:D):
- ```byAddress``` -> result object with token info will use token addresses as keys, recommended for usage if you are not sure which tokens will be used
- ```cached``` -> function will try to retrive file at location ```writeToFile``` and skip gathering token info part
- ```verbose``` -> function will output token address that is currently inspected
- ```writeToFile``` -> file location to write resulting object


## start-ganache.js

### module's internal functions

Function to generate launch string for ganache:

```js
function generateForkString()
```

This function uses ```.env``` file as parameters:

- ```NETWORK``` -> can be ```ETH```/```POLYGON```, for usage with ```requests.js``` only ```ETH``` is valid (default value)
- ```INFURA_ID_PROJECT``` -> must be set if ```NETWORK == ETH``` (if not set - default value is used), for polygon - ```https://polygon-rpc.com/``` is used and does not require api keys
- ```PORT``` -> port to use, if not set - ```8545``` is used

Function to retreive accounts from generated tokens object:

```js
/**
 * @param {Record<String, Token>} obj 
 * @returns {String[]}
 */
function getAccountsFromObj(obj)
```

Object in this function -> object that was generated by ```getTokenInfo``` function.

```Token``` structure:

```js
/**
 * @typedef {Object} Token
 * @property {String} address
 * @property {String} holder
 * @property {String} name
 * @property {String} symbol
 * @property {Number} decimals
 */
```

Properties:
- ```address``` -> address of tokens
- ```holder``` -> holder address
- ```name``` -> name of token
- ```symbol``` -> symbol of token
- ```decimals``` -> token's decimals

### Module exports

This module exports functions:

```js
{
    createGanacheCliString,
    startGanache
}
```

Functions:
- createGanacheCliString -> function used to create ganache launcing string
- startGanache -> uses created string to launch ganache (recommended to start in separate terminal)

Function to create ganache string:

```js
/**
 * @param {GanacheConfig} launchParams 
 * @returns {Promise<String>}
 */
async function createGanacheCliString(launchParams)
```

Function takes as input object of ```GanacheConfig``` type.

```GanacheConfig``` structure:

```js
/**
 * @typedef {Object} GanacheConfig
 * @property {String} fork
 * @property {Number} gasLimit
 * @property {String[]} accounts
 * @property {String[]} tokens
 * @property {GetTokensOptions} tokenSearchOptions
 */
```

Properties (all are optional):
- ```fork``` -> fork to use (```istanbul```/```berlin```/...)
- ```gasLimit``` -> gas limit for ganache (default - 9000000)
- ```accounts``` -> accounts to unlock (for example in 0x it may be makers addresses)
- ```tokens``` -> tokens array that is passed to ```getTokenInfo``` function for finding info
- ```tokenSearchOptions``` -> options passed to ```getTokenInfo``` function


Function to start ganache:
```js
/**
 * @param {String} ganacheString 
 * @returns {child_process.ChildProcess}
 */
function startGanache(ganacheString) 
```

Function takes as input created ganache string and returns object representing running ganche (for example with it ganache process may be killed)
