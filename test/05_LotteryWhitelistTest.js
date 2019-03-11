const RNGContract = artifacts.require("./RNG.sol");

contract('Lottery whitelist tests', async (accounts) => {

    beforeEach(async function () {
        RNG = await RNGContract.deployed();
    });

    it('check addAddressToWhitelist function', async function() {
        let res = await RNG.addAddressToWhitelist(accounts[5]).valueOf();
        assert(res);
    });

    it('check removeAddressFromWhitelist function', async function() {
        let res = await RNG.removeAddressFromWhitelist(accounts[5]).valueOf();
        assert(res);
        
        res = await RNG.removeAddressFromWhitelist(accounts[5]).valueOf();
    });

    it('check addAddressesToWhitelist function', async function() {
        let res = await RNG.addAddressesToWhitelist([accounts[5], accounts[6]]).valueOf();
        assert(res);
    });
    
    it('check removeAddressesFromWhitelist function', async function() {
        let res = await RNG.removeAddressesFromWhitelist([accounts[5], accounts[6]]).valueOf();
        assert(res);
        res = await RNG.removeAddressesFromWhitelist([accounts[5], accounts[6]]).valueOf();
    });

    it('check function from not in whitelist address', async function() {
        let round = 1;
        let nonce = 0;        
        let err;
        try {
            await RNG.update(round, nonce, {from: accounts[5], value: 1});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

});