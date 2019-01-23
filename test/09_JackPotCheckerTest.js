const RNGContract = artifacts.require("./RNG.sol");
const TestSuperJackPotContract = artifacts.require("./TestSuperJackPot.sol");
const JackPotCheckerContract = artifacts.require("./JackPotChecker.sol");
const TestMainLotteryContract = artifacts.require("./TestMainLottery.sol");

const BigNumber = require('bignumber.js');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

contract('JackPotChecker test', async (accounts) => {

    let RNG;
    let MainLottery;
    let SuperJackPot;
    let JackPotChecker;

    beforeEach(async function () {
        RNG = await RNGContract.deployed();
        MainLottery = await TestMainLotteryContract.deployed();
        SuperJackPot = await TestSuperJackPotContract.deployed();
        JackPotChecker = await JackPotCheckerContract.deployed();
        await RNG.addAddressToWhitelist(SuperJackPot.address);
        await RNG.addAddressToWhitelist(JackPotChecker.address);
    });


    it('setSuperJackPot function', async function() {
        let err;
        try {
            await JackPotChecker.setSuperJackPot(0)
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
        await JackPotChecker.setSuperJackPot(SuperJackPot.address)

        let jackpot = await JackPotChecker.superJackPot.call();
        assert.equal(jackpot, SuperJackPot.address, 'jackpot is not correct');
    });

    it('callback function', async function() {

        await JackPotChecker.setMinTimeUpdate(0);

        let id = '0x0';
        let priceETHinUSD = "0.01";
        let priceInUsd = 1;
        let proof = '0x01';

        let valueToSuperJackPot = web3.utils.toWei("1", "ether");
        let valueToRNG = web3.utils.toWei("1", "ether");
        let oraclizeAddress = accounts[9];

        await JackPotChecker.setMyOraclize(oraclizeAddress);
        await SuperJackPot.setChecker(JackPotChecker.address);
        await SuperJackPot.send(valueToSuperJackPot);
        await JackPotChecker.send(valueToSuperJackPot);
        await RNG.send(valueToRNG);

        let err;
        try {
            await JackPotChecker.__callback(id, priceETHinUSD, proof);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await sleep(2000);

        await JackPotChecker.__callback(id, priceETHinUSD, proof, {from: oraclizeAddress});

        ids = await RNG.getRequestsArray();

        let jackpot = new BigNumber(web3.utils.toWei("12", "ether"));
        await SuperJackPot.sendTransaction({from: accounts[9], value: jackpot.valueOf()});


        await sleep(2000);

        await JackPotChecker.__callback(id, priceETHinUSD, proof, {from: oraclizeAddress});

        ids = await RNG.getRequestsArray();

        assert.equal(ids.length, 0, "ids is not correct");


        await sleep(2000);

        await JackPotChecker.__callback(id, priceETHinUSD, proof, {from: oraclizeAddress});

        await JackPotChecker.setVerify(1);

        await sleep(2000);

        await JackPotChecker.__callback(id, priceETHinUSD, proof, {from: oraclizeAddress});

        let price = await JackPotChecker.ETHInUSD.call();

        assert.equal(price, priceInUsd, 'price is not correct');
    });

    it('startSuperJackPot function', async function() {
        await JackPotChecker.processSuperJackPot();
    });

    it('update function', async function(){
        let oraclizePrice = web3.utils.toWei("100", "ether");
        let value = web3.utils.toWei("1", "ether");
        await JackPotChecker.setOraclizePrice(oraclizePrice);
        let res = await JackPotChecker.update({value:value});
        let event = await findEvent(res.logs, 'NewOraclizeQuery');
        assert.equal(event.args.description, "Oraclize query was NOT sent, please add some ETH to cover for the query fee", 'error');
        await JackPotChecker.setOraclizePrice(0);

        res = await JackPotChecker.update({value:value});
        event = await findEvent(res.logs, 'NewOraclizeQuery');
        assert.equal(event.args.description, "Oraclize query was sent, standing by for the answer..", 'error');

    });

    it('setUrl function', async function() {

        let url = 'url';
        await JackPotChecker.setUrl(url);
        let _url = await JackPotChecker.url.call();

        assert.equal(url, _url, 'url is not correct');
    });

    it('setOraclizeCallbackGasLimit function', async function() {

        let limit = 100000;
        await JackPotChecker.setOraclizeCallbackGasLimit(limit);
        let _limit = await JackPotChecker.CUSTOM_GASLIMIT.call();

        assert.equal(limit, _limit, 'gas limit is not correct');
    });

    it('setOraclizeTimeout function', async function() {

        let timeout = 100;
        await JackPotChecker.setOraclizeTimeout(timeout);
        let _timeout = await JackPotChecker.timeout.call();

        assert.equal(timeout, _timeout, 'timeout is not correct');
    });

    it('withdraw function', async function() {
        let value = 100;
        let account = accounts[1];
        let balanceAccBefore = new BigNumber(await web3.eth.getBalance(account));
        let balanceBefore = new BigNumber(await web3.eth.getBalance(JackPotChecker.address));
        await JackPotChecker.withdraw(account, value);
        let balanceAccAfter = new BigNumber(await web3.eth.getBalance(account));
        let balanceAfter = new BigNumber(await web3.eth.getBalance(JackPotChecker.address));

        assert.equal(balanceBefore.minus(balanceAfter).toString(), value.toString(), 'balance is not correct');
        assert.equal(balanceAccAfter.minus(balanceAccBefore).toString(), value.toString(), 'balance is not correct');
    });

});

function findEvent(logs, eventName) {
    let result = null;
    for (let log of logs) {
        if (log.event === eventName) {
            result = log;
            break;
        }
    }
    return result;
};