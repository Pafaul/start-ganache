const networksWithHolderSearch = {
    'ETH': true,
    'POLYGON': false,
    'ARBITRUM': false,
    'HARMONY': false,
    'ETH_TESTNET': false,
    'POLYGON_TESTNET': false,
    'ARBITRUM_TESTNET': false,
    'HARMONY_TESTNET': false
}

const networksToEndpoints = {
    'ETH': 'https://mainnet.infura.io/v3/',
    'POLYGON': 'https://polygon-rpc.com/',
    'ARBITRUM': 'https://arbitrum-mainnet.infura.io/v3/', // https://arbiscan.io/token/generic-tokenholders2?m=normal&a=0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9&s=162072493300554&sid=3668eb606369637a41f1a3edd1773894&p=1
    'HARMONY': 'https://a.api.s0.t.hmny.io/',
    'ETH_TESTNET': 'https://ropsten.infura.io/v3/',
    'POLYGON_TESTNET': 'https://polygon-mumbai.infura.io/v3/',
    'ARBITRUM_TESTNET': 'https://arbitrum-rinkeby.infura.io/v3/',
    'HARMONY_TESTNET': 'https://api.s0.b.hmny.io'
}

module.exports = {
    networksWithHolderSearch,
    networksToEndpoints
}