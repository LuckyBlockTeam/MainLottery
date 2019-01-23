const RNGContract = artifacts.require("./RNG.sol");
const TestBaseLotteryContract = artifacts.require("./TestBaseLottery.sol");
const TestMainLotteryContract = artifacts.require("./TestMainLottery.sol");
const ManagementContract = artifacts.require("./Management.sol");

const BigNumber = require('bignumber.js');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

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

contract('BaseLottery tests', async (accounts) => {

    let RNG;
    let BaseLottery;
    let MainLottery;
    let oraclizeAddress = accounts[9];
    let Management;

    beforeEach(async function () {
        RNG = await RNGContract.deployed();
        BaseLottery = await TestBaseLotteryContract.deployed();
        MainLottery = await TestMainLotteryContract.deployed();
        Management = await ManagementContract.deployed();
        await RNG.addAddressToWhitelist(BaseLottery.address);
    });

    it('setRNG function', async function () {
        await BaseLottery.setContracts(accounts[3], MainLottery.address, Management.address);
        let rngInBaseLottery = await BaseLottery.rng.call();

        assert.equal(rngInBaseLottery, accounts[3]);

        await BaseLottery.setContracts(RNG.address, MainLottery.address, Management.address);
    });

    it('onlyRNG modifier', async function() {
        let round = 1;
        let randomNumber = 0;
        let err;
        let value = new BigNumber(web3.utils.toWei("1", "ether"));
        try {
            await BaseLottery.processRound(round, randomNumber, {value: value});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

    });

    it('onlyMainLottery modifier', async function() {
        let err;
        let _participant = accounts[1];
        let value = new BigNumber(web3.utils.toWei("1", "ether"));
        try {
            await BaseLottery.buyTickets(_participant, {value: value});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('setTicketPrice function', async function() {
       await BaseLottery.setContracts(RNG.address, accounts[0], Management.address);
        let err;
        try {
            await BaseLottery.setTicketPrice(0);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('buyTickets function', async function() {


        let fundsToRNG = new BigNumber(web3.utils.toWei("1", "ether"));

        await RNG.send(fundsToRNG);

        let err;
        try {
            await BaseLottery.buyTickets(accounts[0], {value: 0});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        let baseLotteryRoundBefore = await BaseLottery.currentRound.call();
        let period = 60;

        let ticketPrice = 10;
        let fundsToBaseLottery = 1000;
        await BaseLottery.setPeriod(period);
        await BaseLottery.setContracts(RNG.address, accounts[0], Management.address);
        await BaseLottery.setTicketPrice(ticketPrice);

        await BaseLottery.buyTickets(accounts[0], {value: fundsToBaseLottery});
        let baseLotteryRound = await BaseLottery.currentRound.call();
        assert.equal(baseLotteryRound.toString(), baseLotteryRoundBefore.toString(), 'round is not correct');

        await BaseLottery.setParticipantsCount(baseLotteryRoundBefore, new BigNumber(9));

        await BaseLottery.buyTickets(accounts[1], {value: fundsToBaseLottery});
        await BaseLottery.buyTickets(accounts[2], {value: fundsToBaseLottery});
        baseLotteryRound = await BaseLottery.currentRound.call();

        assert.equal(baseLotteryRound.toString(), baseLotteryRoundBefore.toString(), 'round is not correct');
    });

    it('setOrganiserAddress function', async function() {
        let addr = 0x0;
        let err;
        try {
            await BaseLottery.setOrganiser(addr);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await BaseLottery.setContracts(RNG.address, MainLottery.address, Management.address);
    });

    it('refund function', async function() {
        let baseLotteryBalanceBefore = web3.eth.getBalance(BaseLottery.address);

        await BaseLottery.refund(1, {from: accounts[1]});

        let baseLotteryBalance = web3.eth.getBalance(BaseLottery.address);

        assert.equal(baseLotteryBalanceBefore.toString(), baseLotteryBalance.toString(), 'balance is not correct');

        await BaseLottery.setOraclizeTimeout(0);

        await BaseLottery.refund(1, {from: accounts[1]});

        let participantFunds = await BaseLottery.getParticipantFunds(1, accounts[1]);
        assert.equal(participantFunds.toString(), '0', 'balance is not correct');

        await BaseLottery.setOraclizeTimeout(86400);
    });

    it('setKYCWhitelist function', async function() {
        let addr = 0x0;
        let err;
        try {
            await BaseLottery.setKYCWhitelist(addr);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('getGain function', async function() {
        let from = 1;
        let to = 0;
        let err;
        try {
            await BaseLottery.getGain(from, to);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        from = 0;
        to = 1;
        try {
            await BaseLottery.getGain(from, to);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('check update and callback', async function() {
        await RNG.addAddressToWhitelist(BaseLottery.address);
        await RNG.setMyOraclize(oraclizeAddress);
        await BaseLottery.setContracts(RNG.address, accounts[0], Management.address);

        let testId = '0x1';
        let valueToOraclize = new BigNumber(web3.utils.toWei("0.05", "ether"));

        await RNG.setTestId(testId);

        let timeout = 100;
        await BaseLottery.startLottery(timeout, {value: valueToOraclize});

        let ids = await RNG.getRequestsArray();
        let id = ids[ids.length - 1];

        let result = 'result';
        let verify = new BigNumber(1);
        let proof = '0x01';
        await RNG.setVerify(verify.valueOf());

        await BaseLottery.setOraclizeTimeout(10);

        let currentRound = await BaseLottery.currentRound.call();

        await BaseLottery.setParticipantsCount(currentRound, 5);

        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        await BaseLottery.setContracts(accounts[0], accounts[0], Management.address);

        await BaseLottery.processRound(currentRound, 0);

        await BaseLottery.setContracts(RNG.address, accounts[0], Management.address);

    });

    it('buyBonusTickets function test', async () => {
        let account = accounts[9];
        let tickets = 10;
        await BaseLottery.setPeriod(0);
        await BaseLottery.setRoundParticipants(1, 10);
        await BaseLottery.setStartRoundTime(1, 0);
        let res = await BaseLottery.buyBonusTickets(account, tickets);
        let event = await findEvent(res.logs, 'ParticipantAdded');
        assert.equal(event.args.ticketsCount, tickets, 'tickets count is not correct');
    });

    it('checkRoundState function test', async () => {


        await BaseLottery.setStartRoundTime(1, 0);
        let res = await BaseLottery.checkRoundState(1);

        assert.equal(res.logs[0].args.state.toString(), '4', 'state is not correct');
    });

    it('processRound function when refund test', async () => {
        await BaseLottery.setContracts(accounts[0], accounts[0], accounts[0]);

        let res = await BaseLottery.processRound(1, 0);

        assert.equal(res.logs.length, 0, 'proccess round is failed');
    });

    it('refund function test', async () => {
        let account = accounts[0];
        let funds = await BaseLottery.getParticipantFunds(0, account);
        await BaseLottery.setStartRoundTime(0, 0);
        await BaseLottery.setRoundState(0, 4);
        let balanceBefore = new BigNumber(await web3.eth.getBalance(BaseLottery.address));
        let res = await BaseLottery.refund(0);
        let event = await findEvent(res.logs, 'RefundIsSuccess');
        let balanceAfter = new BigNumber(await web3.eth.getBalance(BaseLottery.address));
        assert.equal(balanceBefore.minus(balanceAfter).toString(), funds.toString(), 'balance is not correct');
        assert.equal(event.args.funds.toString(), funds.toString(), 'funds is not correct');
        assert.equal(event.args.participant, account, 'address is not correct');


    });


    it('getTicketPrice function test', async () => {
        let price = await BaseLottery.ticketPrice.call();

        let res = await BaseLottery.getTicketPrice();

        assert.equal(res.toString(), price.toString(), 'price is not correct');
    });

    it('getRoundStartTime function test', async () => {
        let round = await BaseLottery.rounds.call(1);
        let res = await BaseLottery.getRoundStartTime(1);

        assert.equal(res.toString(), round.startRoundTime.toString(), 'Time is not correct');
    });

});