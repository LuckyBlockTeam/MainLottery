const Web3_1_0_0 = require("web3") // import web3 v1.0 constructor

// use globally injected web3 to find the currentProvider and wrap with web3 v1.0
const getWeb3 = () => {
    const myWeb3 = new Web3_1_0_0(web3.currentProvider)
    return myWeb3
}

module.exports = { getWeb3}