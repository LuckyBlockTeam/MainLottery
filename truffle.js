module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      gas: 1000000000000, //7990000,
      network_id: '*', // Match any network id
    },
    coverage: {
      host: 'localhost',
      network_id: '*', // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
    ganache: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
  },
  mocha: {
    enableTimeouts: false,
    // reporter: 'eth-gas-reporter',
    // reporterOptions : {
    //     currency: 'USD',
    //     gasPrice: 21
    // }
  },

    compilers: {
        solc: {
            version: '0.5.2',
        },
    },

    solc: {
        optimizer: {
            enabled: true,
            runs: 200,
        },
    },
};
