const RNGContract = artifacts.require("./RNG.sol");
const BigNumber = web3.utils.BN;


require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();
  
contract('RNG tests', async (accounts) => {

    let oneEther = web3.utils.toWei("1", "ether");

    beforeEach(async function() {
        RNG = await RNGContract.deployed();
    });

    it('fallback function', async function() {
        let balanceBefore = await web3.eth.getBalance(RNG.address);
        assert.equal(balanceBefore, 0, "Balance isn't 0!");

        await RNG.send(oneEther);
        let balanceAfter = await web3.eth.getBalance(RNG.address);
        assert.equal(balanceAfter, oneEther, "Balance isn't 1 ether!");

    });

    it('withdraw function', async function() {
        const withdrawFunds = oneEther;
        let balanceRNGBefore = await web3.eth.getBalance(RNG.address);
        let balanceAccBefore = await web3.eth.getBalance(accounts[1]);
        await RNG.withdraw(accounts[1], withdrawFunds);
        let balanceRNGAfter = await web3.eth.getBalance(RNG.address);
        let balanceAccAfter = await web3.eth.getBalance(accounts[1]);
        assert.equal(balanceRNGAfter.valueOf(), (balanceRNGBefore-withdrawFunds).valueOf(), "RNG balance isn't correct!");
        assert.equal(balanceAccBefore.valueOf(), (balanceAccAfter-withdrawFunds).valueOf(), "Account balance isn't correct!");
        
    });

    it('withdraw function from not owner', async function() {
        let err;
        try {
            await RNG.withdraw(accounts[1], withdrawFunds, {from: accounts[2]});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
        
    });

    it('setCallbackGas and getCallbackGas function from owner', async function() {
        await RNG.setCallbackGas(1000000000);
        let _gas = await RNG.getCallbackGas();
        assert.equal(1000000000, _gas);

    });

    it('setCallbackGas function from not owner', async function() {
        let err;
        try {
            await RNG.setCallbackGas(1000000000, {from: accounts[3]});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('getRequest function', async function() {
        let testId = "0x0";
        let req = await RNG.getRequest(testId);
        assert.equal(req[0].valueOf(), 0);
        assert.equal(req[1].valueOf(), 0);
    });


    it('addAddressToWhiltelist function', async function() {
        let failAddress = 0;
        let err;
        try {
            await RNG.addAddressToWhitelist(failAddress);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('addAddressesToWhiltelist function', async function() {
        let failAddress = 0;
        let err;
        try {
            await RNG.addAddressesToWhitelist([failAddress]);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('call update function from account not in whitelist', async function() {
        let err;
        try {
            await RNG.update(0, 0, 0);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('callback from not randao', async () => {
        let err;
        try {
            await RNG.__callback('0x0', 0);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });
});