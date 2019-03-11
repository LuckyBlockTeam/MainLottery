const RNGContract = artifacts.require("./RNG.sol");
const TestBaseLotteryContract = artifacts.require("./TestBaseLottery.sol");
const TestMainLotteryContract = artifacts.require("./TestMainLottery.sol");
const TestDailyLotteryContract = artifacts.require("./TestDailyLottery.sol");
const TestWeeklyLotteryContract = artifacts.require("./TestWeeklyLottery.sol");
const TestMonthlyLotteryContract = artifacts.require("./TestMonthlyLottery.sol");
const TestYearlyLotteryContract = artifacts.require("./TestYearlyLottery.sol");
const TestSuperJackPotContract = artifacts.require("./TestSuperJackPot.sol");
const JackPotCheckerContract = artifacts.require("./JackPotChecker.sol");
const KYCWhitelistContract = artifacts.require("./KYCWhitelist.sol");
const ManagementContract = artifacts.require("./Management.sol");

const BigNumber = require('bignumber.js');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Functional tests', async (accounts) => {

    let RNG;
    let BaseLottery;
    let MainLottery;
    let DailyLottery;
    let WeeklyLottery;
    let MonthlyLottery;
    let YearlyLottery;
    let SuperJackPot;
    let JackPotChecker;
    let KYCWhitelist;
    let Management;

    let oraclizeAddress = accounts[9];
    let lotteryOrganiser = accounts[8];

    let BasePeriod = 121;
    let MainPeriod = 61;
    let DailyPeriod = 121;
    let WeeklyPeriod = 181;
    let MonthlyPeriod = 240;
    let YearlyPeriod = 300;
    let JackPotPeriod = 61;

    beforeEach(async function () {
        RNG = await RNGContract.deployed();
        BaseLottery = await TestBaseLotteryContract.deployed();
        MainLottery = await TestMainLotteryContract.deployed();
        DailyLottery = await TestDailyLotteryContract.deployed();
        WeeklyLottery = await TestWeeklyLotteryContract.deployed();
        MonthlyLottery = await TestMonthlyLotteryContract.deployed();
        YearlyLottery = await TestYearlyLotteryContract.deployed();
        SuperJackPot = await TestSuperJackPotContract.deployed();
        JackPotChecker = await JackPotCheckerContract.deployed();
        KYCWhitelist = await KYCWhitelistContract.deployed();
        Management = await ManagementContract.deployed();
    });

    it('set initial state', async function() {
        await RNG.addAddressToWhitelist(BaseLottery.address);
        await RNG.addAddressesToWhitelist([MainLottery.address]);
        await RNG.addAddressToWhitelist(DailyLottery.address);
        await RNG.addAddressToWhitelist(WeeklyLottery.address);
        await RNG.addAddressToWhitelist(MonthlyLottery.address);
        await RNG.addAddressToWhitelist(YearlyLottery.address);
        await RNG.addAddressToWhitelist(SuperJackPot.address);

        await RNG.setMyOraclize(oraclizeAddress);

        await JackPotChecker.setSuperJackPot(SuperJackPot.address);

        await MainLottery.setContracts(RNG.address, MainLottery.address, Management.address);
        await DailyLottery.setContracts(RNG.address, MainLottery.address, Management.address);
        await WeeklyLottery.setContracts(RNG.address, MainLottery.address, Management.address);
        await MonthlyLottery.setContracts(RNG.address, MainLottery.address, Management.address);
        await YearlyLottery.setContracts(RNG.address, MainLottery.address, Management.address);
        await SuperJackPot.setContracts(RNG.address, MainLottery.address, Management.address);

        await MainLottery.setOrganiser(lotteryOrganiser);
        await MainLottery.setChecker(JackPotChecker.address);

        await JackPotChecker.setPrice(10000);

    });

    it('check initial state', async function() {
        let BasePeriodFromContract = await BaseLottery.getPeriod();
        let MainPeriodFromContract = await MainLottery.getPeriod();
        let DailyPeriodFromContract = await DailyLottery.getPeriod();
        let WeeklyPeriodFromContract = await WeeklyLottery.getPeriod();
        let MonthlyPeriodFromContract = await MonthlyLottery.getPeriod();
        let YearlyPeriodFromContract = await YearlyLottery.getPeriod();
        let JackPotPeriodFromContract = await SuperJackPot.getPeriod();

        assert.equal(BasePeriod, BasePeriodFromContract, "Base period is not correct");
        assert.equal(MainPeriod, MainPeriodFromContract, "Main period is not correct");
        assert.equal(DailyPeriod, DailyPeriodFromContract, "Daily period is not correct");
        assert.equal(WeeklyPeriod, WeeklyPeriodFromContract, "Weekly period is not correct");
        assert.equal(MonthlyPeriod, MonthlyPeriodFromContract, "Monthly period is not correct");
        assert.equal(YearlyPeriod, YearlyPeriodFromContract, "Yearly period is not correct");
        assert.equal(JackPotPeriod, JackPotPeriodFromContract, "JackPot period is not correct");

        let BaseLotteryInWhitelist = await RNG.whitelist.call(BaseLottery.address);
        let MainLotteryInWhitelist = await RNG.whitelist.call(MainLottery.address);
        let DailyLotteryInWhitelist = await RNG.whitelist.call(DailyLottery.address);
        let WeeklyLotteryInWhitelist = await RNG.whitelist.call(WeeklyLottery.address);
        let MonthlyLotteryInWhitelist = await RNG.whitelist.call(MonthlyLottery.address);
        let YearlyLotteryInWhitelist = await RNG.whitelist.call(YearlyLottery.address);
        let JackPotLotteryInWhitelist = await RNG.whitelist.call(SuperJackPot.address);

        assert.equal(BaseLotteryInWhitelist, true, "BaseLottery in not added to whitelist");
        assert.equal(MainLotteryInWhitelist, true, "MainLottery in not added to whitelist");
        assert.equal(DailyLotteryInWhitelist, true, "DailyLottery in not added to whitelist");
        assert.equal(WeeklyLotteryInWhitelist, true, "WeeklyLottery in not added to whitelist");
        assert.equal(MonthlyLotteryInWhitelist, true, "MonthlyLottery in not added to whitelist");
        assert.equal(YearlyLotteryInWhitelist, true, "YearlyLottery in not added to whitelist");
        assert.equal(JackPotLotteryInWhitelist, true, "JackPotLottery in not added to whitelist");

        let RNGInBaseLottery = await BaseLottery.rng.call();
        let RNGInMainLottery = await MainLottery.rng.call();
        let RNGInDailyLottery = await DailyLottery.rng.call();
        let RNGInWeeklyLottery = await WeeklyLottery.rng.call();
        let RNGInMonthlyLottery = await MonthlyLottery.rng.call();
        let RNGInYearlyLottery = await YearlyLottery.rng.call();
        let RNGInJackPotLottery = await SuperJackPot.rng.call();


        assert.equal(RNGInBaseLottery, RNG.address, "RNG address in Base lottery is not correct");
        assert.equal(RNGInMainLottery, RNG.address, "RNG address in Main lottery is not correct");
        assert.equal(RNGInDailyLottery, RNG.address, "RNG address in DailyLottery is not correct");
        assert.equal(RNGInWeeklyLottery, RNG.address, "RNG address in WeeklyLottery is not correct");
        assert.equal(RNGInMonthlyLottery, RNG.address, "RNG address in MonthlyLottery is not correct");
        assert.equal(RNGInYearlyLottery, RNG.address, "RNG address in YearlyLottery is not correct");
        assert.equal(RNGInJackPotLottery, RNG.address, "RNG address in JackPotLottery lottery is not correct");

        let organiserAddressInMainLottery = await MainLottery.organiser.call();
        assert.equal(organiserAddressInMainLottery, lotteryOrganiser, 'organiser address is not correct');

        let checkerAddressInMainLottery = await MainLottery.checker.call();
        assert.equal(checkerAddressInMainLottery, JackPotChecker.address, 'JackPotChecker address is not correct');

    });

    it('check update and callback', async function() {
        await BaseLottery.setContracts(RNG.address, accounts[0], Management.address);
        
        let MainLotteryInBaseLottery = await BaseLottery.mainLottery.call();

        assert.equal(MainLotteryInBaseLottery, accounts[0], "Main lottery is not correct");
        
        let testId = '0x01';
        let round = 1;
        let valueToOraclize = new BigNumber(web3.utils.toWei("0.05", "ether"));
        let OraclizeDemand = new BigNumber(web3.utils.toWei("0.02", "ether"));

        let RNGBalanceBefore = await web3.eth.getBalance(RNG.address);
        assert.equal(RNGBalanceBefore, 0, "Balance isn't 0!");

        await RNG.setTestId(testId);

        let timeout = 0;
        await BaseLottery.startLottery(timeout, {value: valueToOraclize});

        let ids = await RNG.getRequestsArray();
        let id = ids[ids.length-1];
        let request = await RNG.getRequest(id);

        assert.equal(request[0], BaseLottery.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");

        let RNGbalanceAfter = await web3.eth.getBalance(RNG.address);
        assert.equal(RNGbalanceAfter, (RNGBalanceBefore+valueToOraclize-OraclizeDemand), "Balance isn't correct!");

        let result = 'result';
        let verify =  new BigNumber(1);
        let proof = '0x02';
        await RNG.setVerify(verify);

        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        let err;
        try {
            await RNG.__callback(id, result, proof);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        verify =  new BigNumber(0);
        await RNG.setVerify(verify);
    });


    it('setMinBalance and getRNGMinBalance function from owner >= 1 ether', async function() {
        await MainLottery.setMinBalance(web3.utils.toWei("1.1", "ether"));
        let _balance = await MainLottery.serviceMinBalance.call();
        assert.equal(web3.utils.toWei("1.1", "ether"), _balance);

    });

    it('setMinBalance function from owner < 1 ether', async function() {
        let err;
        try {
            await MainLottery.setMinBalance(web3.utils.toWei("0.1", "ether"));
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('setMinBalance function from not owner', async function() {
        let err;
        try {
            await MainLottery.setMinBalance(web3.utils.toWei("2", "ether"), {from: accounts[3]});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('check startLotteries function', async function(){
        let round = 1;
        let value = new BigNumber(web3.utils.toWei("1", "ether"));
        await Management.startLotteries({value: value});
        let ids = await RNG.getRequestsArray();

        let id = ids[ids.length-5];
        let request = await RNG.getRequest(id);
        assert.equal(request[0], MainLottery.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");

        id = ids[ids.length-4];
        request = await RNG.getRequest(id);
        assert.equal(request[0], DailyLottery.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");

        id = ids[ids.length-3];
        request = await RNG.getRequest(id);
        assert.equal(request[0], WeeklyLottery.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");

        id = ids[ids.length-2];
        request = await RNG.getRequest(id);
        assert.equal(request[0], MonthlyLottery.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");

        id = ids[ids.length-1];
        request = await RNG.getRequest(id);
        assert.equal(request[0], YearlyLottery.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");
    });

    it('check buyTickets function', async function() {
        let startMainLotteryBalance = await web3.eth.getBalance(MainLottery.address);
        let startDailyLotteryBalance = await web3.eth.getBalance(DailyLottery.address);
        let startWeeklyLotteryBalance = await web3.eth.getBalance(WeeklyLottery.address);
        let startMonthlyLotteryBalance = await web3.eth.getBalance(MonthlyLottery.address);
        let startYearlyLotteryBalance = await web3.eth.getBalance(YearlyLottery.address);
        let startSuperJackPotBalance = await web3.eth.getBalance(SuperJackPot.address);
        let fundsToMainLottery = new BigNumber(web3.utils.toWei("1", "ether"));
        let extra = new BigNumber(web3.utils.toWei("0.003", "ether"));

        let dailyPercent = 10;
        let weeklyPercent = 5;
        let monthlyPercent = 5;
        let yearlyPercent = 5;
        let jackPotPercent = 15;
        let organiserPercent = 20;
        let sumPercent =
            dailyPercent +
            weeklyPercent +
            monthlyPercent +
            yearlyPercent +
            jackPotPercent +
            organiserPercent
        ;

        let balanceRNG = await web3.eth.getBalance(RNG.address);
        let balanceChecker = await web3.eth.getBalance(JackPotChecker.address);
        let RNGMinBalance = await MainLottery.serviceMinBalance.call();
        let checkerMinBalance = await MainLottery.serviceMinBalance.call();

        let fundsToRNG = RNGMinBalance-(balanceRNG)-(new BigNumber(web3.utils.toWei("0.004", "ether")));
        let fundsToChecker = checkerMinBalance-balanceChecker-(new BigNumber(web3.utils.toWei("0.004", "ether")));

        await RNG.send(fundsToRNG);
        await JackPotChecker.send(fundsToChecker);

        let fundsToMainLotteryWithExtra = new BigNumber(web3.utils.toWei("0.011", "ether"));
        await MainLottery.sendTransaction({from: accounts[1], value: fundsToMainLotteryWithExtra});

        await RNG.withdraw(accounts[1], (new BigNumber(web3.utils.toWei("0.1", "ether"))));

        balanceRNG = await web3.eth.getBalance(RNG.address);
        fundsToRNG = RNGMinBalance-(balanceRNG)-(new BigNumber(web3.utils.toWei("0.002", "ether")));
        await RNG.send(fundsToRNG);

        fundsToMainLotteryWithExtra = new BigNumber(web3.utils.toWei("0.02", "ether"));
        await MainLottery.sendTransaction({from: accounts[1], value: fundsToMainLotteryWithExtra});

        fundsToRNG = RNGMinBalance-(balanceRNG);
        fundsToChecker = checkerMinBalance-(balanceChecker);

        if (fundsToRNG > 0) await RNG.send(fundsToRNG);
        if (fundsToChecker > 0) await JackPotChecker.send(fundsToChecker);
        let startOrganiserBalance = await web3.eth.getBalance(lotteryOrganiser);

        fundsToMainLotteryWithExtra = new BigNumber(web3.utils.toWei("1.003", "ether"));
        await MainLottery.sendTransaction({from: accounts[1], value: fundsToMainLotteryWithExtra});

        let fundsToOrganiser = fundsToMainLottery*(organiserPercent)/(100);
        let organiserBalance = await web3.eth.getBalance(lotteryOrganiser);
        assert.equal(fundsToOrganiser, organiserBalance-(startOrganiserBalance)-(extra));

        fundsToMainLottery = new BigNumber(web3.utils.toWei("1.03", "ether"));


        let MainLotteryBalance = await (web3.eth.getBalance(MainLottery.address))-(startMainLotteryBalance);
        let DailyLotteryBalance = await (web3.eth.getBalance(DailyLottery.address))-(startDailyLotteryBalance);
        let WeeklyLotteryBalance = await (web3.eth.getBalance(WeeklyLottery.address))-(startWeeklyLotteryBalance);
        let MonthlyLotteryBalance = await (web3.eth.getBalance(MonthlyLottery.address))-(startMonthlyLotteryBalance);
        let YearlyLotteryBalance = await (web3.eth.getBalance(YearlyLottery.address))-(startYearlyLotteryBalance);
        let SuperJackPotBalance = (await web3.eth.getBalance(SuperJackPot.address))-startSuperJackPotBalance;

        assert.equal(MainLotteryBalance, fundsToMainLottery*(100-sumPercent)/(100));
        assert.equal(DailyLotteryBalance*(100)/(dailyPercent), MainLotteryBalance*(100)/(100-sumPercent));
        assert.equal(WeeklyLotteryBalance*(100)/(weeklyPercent), MainLotteryBalance*(100)/(100-sumPercent));
        assert.equal(MonthlyLotteryBalance*(100)/(monthlyPercent), MainLotteryBalance*(100)/(100-sumPercent));
        assert.equal(YearlyLotteryBalance*(100)/(yearlyPercent), MainLotteryBalance*(100)/(100-sumPercent));
        assert.equal(SuperJackPotBalance*100/jackPotPercent, MainLotteryBalance*(100)/(100-sumPercent));

        let round = 1;
        let ticketsOnMainLottery = await MainLottery.getTicketsCount(round);
        let ticketsOnDailyLottery = await DailyLottery.getTicketsCount(round);
        let ticketsOnWeeklyLottery = await WeeklyLottery.getTicketsCount(round);
        let ticketsOnMonthlyLottery = await MonthlyLottery.getTicketsCount(round);
        let ticketsOnYearlyLottery = await YearlyLottery.getTicketsCount(round);
        let ticketsOnSuperJackPot = await SuperJackPot.getTicketsCount(round);

        assert.equal(ticketsOnMainLottery.toString(), ticketsOnDailyLottery.toString());
        assert.equal(ticketsOnMainLottery.toString(), ticketsOnWeeklyLottery.toString());
        assert.equal(ticketsOnMainLottery.toString(), ticketsOnMonthlyLottery.toString());
        assert.equal(ticketsOnMainLottery.toString(), ticketsOnYearlyLottery.toString());
        assert.equal(ticketsOnMainLottery.toString(), ticketsOnSuperJackPot.toString());
    });

    it('check process lottery', async function() {
        let fundsToMainLottery = new BigNumber(web3.utils.toWei("1", "ether"));
        let value = new BigNumber(web3.utils.toWei("1", "ether"));
        let round = new BigNumber(1);

        await MainLottery.sendTransaction({from: accounts[0], value: fundsToMainLottery/(2)});
        await MainLottery.sendTransaction({from: accounts[0], value: fundsToMainLottery/(2)});
        await MainLottery.sendTransaction({from: accounts[2], value: fundsToMainLottery});
        await MainLottery.sendTransaction({from: accounts[3], value: fundsToMainLottery});
        await MainLottery.sendTransaction({from: accounts[4], value: fundsToMainLottery});
        await MainLottery.sendTransaction({from: accounts[5], value: fundsToMainLottery});
        await MainLottery.sendTransaction({from: accounts[6], value: fundsToMainLottery});
        await MainLottery.sendTransaction({from: accounts[7], value: fundsToMainLottery});
        await MainLottery.sendTransaction({from: accounts[8], value: fundsToMainLottery});
        await MainLottery.sendTransaction({from: accounts[9], value: fundsToMainLottery});

        await MainLottery.restartLottery({value: value});

        let result = 'TestResult1';
        let proof = '0x01';
        let verify = new BigNumber(0);
        let ids = await RNG.getRequestsArray();
        let id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        let funds1 = new BigNumber(await MainLottery.getWinningFunds(round, accounts[0]));
        let funds2 = new BigNumber(await MainLottery.getWinningFunds(round, accounts[1]));
        let funds3 = new BigNumber(await MainLottery.getWinningFunds(round, accounts[2]));
        let funds4 = new BigNumber(await MainLottery.getWinningFunds(round, accounts[3]));
        let funds5 = new BigNumber(await MainLottery.getWinningFunds(round, accounts[4]));
        let funds6 = new BigNumber(await MainLottery.getWinningFunds(round, accounts[5]));
        let funds7 = new BigNumber(await MainLottery.getWinningFunds(round, accounts[6]));
        let funds8 = new BigNumber(await MainLottery.getWinningFunds(round, accounts[7]));
        let funds9 = new BigNumber(await MainLottery.getWinningFunds(round, accounts[8]));
        let funds10 = new BigNumber(await MainLottery.getWinningFunds(round, accounts[9]));
        let funds = new BigNumber(await MainLottery.getRoundFunds(round));
        let totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());

        await DailyLottery.restartLottery({value: value});

        result = 'TestResult2';
        ids = await RNG.getRequestsArray();
        id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        funds1 = new BigNumber(await DailyLottery.getWinningFunds(1, accounts[0]));
        funds2 = new BigNumber(await DailyLottery.getWinningFunds(1, accounts[1]));
        funds3 = new BigNumber(await DailyLottery.getWinningFunds(1, accounts[2]));
        funds4 = new BigNumber(await DailyLottery.getWinningFunds(1, accounts[3]));
        funds5 = new BigNumber(await DailyLottery.getWinningFunds(1, accounts[4]));
        funds6 = new BigNumber(await DailyLottery.getWinningFunds(1, accounts[5]));
        funds7 = new BigNumber(await DailyLottery.getWinningFunds(1, accounts[6]));
        funds8 = new BigNumber(await DailyLottery.getWinningFunds(1, accounts[7]));
        funds9 = new BigNumber(await DailyLottery.getWinningFunds(1, accounts[8]));
        funds10 = new BigNumber(await DailyLottery.getWinningFunds(1, accounts[9]));
        funds = await DailyLottery.getRoundFunds(1);
        totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());

        await WeeklyLottery.restartLottery({value: value});

        result = 'TestResult3';
        ids = await RNG.getRequestsArray();
        id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        funds1 = new BigNumber(await WeeklyLottery.getWinningFunds(1, accounts[0]));
        funds2 = new BigNumber(await WeeklyLottery.getWinningFunds(1, accounts[1]));
        funds3 = new BigNumber(await WeeklyLottery.getWinningFunds(1, accounts[2]));
        funds4 = new BigNumber(await WeeklyLottery.getWinningFunds(1, accounts[3]));
        funds5 = new BigNumber(await WeeklyLottery.getWinningFunds(1, accounts[4]));
        funds6 = new BigNumber(await WeeklyLottery.getWinningFunds(1, accounts[5]));
        funds7 = new BigNumber(await WeeklyLottery.getWinningFunds(1, accounts[6]));
        funds8 = new BigNumber(await WeeklyLottery.getWinningFunds(1, accounts[7]));
        funds9 = new BigNumber(await WeeklyLottery.getWinningFunds(1, accounts[8]));
        funds10 = new BigNumber(await WeeklyLottery.getWinningFunds(1, accounts[9]));
        funds = await WeeklyLottery.getRoundFunds(1);
        totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());

        await MonthlyLottery.restartLottery({value: value});

        result = 'TestResult4';
        ids = await RNG.getRequestsArray();
        id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        funds1 = new BigNumber(await MonthlyLottery.getWinningFunds(1, accounts[0]));
        funds2 = new BigNumber(await MonthlyLottery.getWinningFunds(1, accounts[1]));
        funds3 = new BigNumber(await MonthlyLottery.getWinningFunds(1, accounts[2]));
        funds4 = new BigNumber(await MonthlyLottery.getWinningFunds(1, accounts[3]));
        funds5 = new BigNumber(await MonthlyLottery.getWinningFunds(1, accounts[4]));
        funds6 = new BigNumber(await MonthlyLottery.getWinningFunds(1, accounts[5]));
        funds7 = new BigNumber(await MonthlyLottery.getWinningFunds(1, accounts[6]));
        funds8 = new BigNumber(await MonthlyLottery.getWinningFunds(1, accounts[7]));
        funds9 = new BigNumber(await MonthlyLottery.getWinningFunds(1, accounts[8]));
        funds10 = new BigNumber(await MonthlyLottery.getWinningFunds(1, accounts[9]));
        funds = await MonthlyLottery.getRoundFunds(1);
        totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());

        await YearlyLottery.restartLottery({value: value});

        result = 'TestResult5';
        ids = await RNG.getRequestsArray();
        id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        funds1 = new BigNumber(await YearlyLottery.getWinningFunds(1, accounts[0]));
        funds2 = new BigNumber(await YearlyLottery.getWinningFunds(1, accounts[1]));
        funds3 = new BigNumber(await YearlyLottery.getWinningFunds(1, accounts[2]));
        funds4 = new BigNumber(await YearlyLottery.getWinningFunds(1, accounts[3]));
        funds5 = new BigNumber(await YearlyLottery.getWinningFunds(1, accounts[4]));
        funds6 = new BigNumber(await YearlyLottery.getWinningFunds(1, accounts[5]));
        funds7 = new BigNumber(await YearlyLottery.getWinningFunds(1, accounts[6]));
        funds8 = new BigNumber(await YearlyLottery.getWinningFunds(1, accounts[7]));
        funds9 = new BigNumber(await YearlyLottery.getWinningFunds(1, accounts[8]));
        funds10 = new BigNumber(await YearlyLottery.getWinningFunds(1, accounts[9]));
        funds = await YearlyLottery.getRoundFunds(1);
        totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());

        await SuperJackPot.restartLottery({value: value});

        result = 'TestResult6';
        ids = await RNG.getRequestsArray();
        id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        funds1 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[0]));
        funds2 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[1]));
        funds3 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[2]));
        funds4 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[3]));
        funds5 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[4]));
        funds6 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[5]));
        funds7 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[6]));
        funds8 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[7]));
        funds9 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[8]));
        funds10 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[9]));
        funds = await SuperJackPot.getRoundFunds(1);
        totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());
    });

    it('getRoundParticipants function', async function() {
        let participants = await MainLottery.getRoundParticipants(1);
        assert.equal(participants[0], accounts[1], 'participant is not correct');
        assert.equal(participants[1], accounts[1], 'participant is not correct');
        assert.equal(participants[2], accounts[1], 'participant is not correct');
        assert.equal(participants[3], accounts[0], 'participant is not correct');
        assert.equal(participants[4], accounts[0], 'participant is not correct');
        assert.equal(participants[5], accounts[2], 'participant is not correct');
        assert.equal(participants[6], accounts[3], 'participant is not correct');
    });

    it('getRoundWinners function', async function() {
        let winnersCount = 10;
        let winners = await MainLottery.getRoundWinners(1);

        assert.equal(winners.length, winnersCount, 'count of winners is not correct');
    });

    it('getRoundwinningTickets function', async function() {
        let winningTicketsCount = 10;
        let round = 1;
        let allTicketsCount = MainLottery.getTicketsCount(round);
        let tickets = await MainLottery.getRoundWinningTickets(round);

        assert.equal(tickets.length, winningTicketsCount, 'count of winners is not correct');

        for (let i = 0; i < winningTicketsCount; i++) {
            assert(tickets[i] < allTicketsCount, 'winning ticket is not correct');
        }
    });

    it('setWinnersWhiteList function', async function() {
        let err;
        try {
            await MainLottery.setWinnersWhiteList(0);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await MainLottery.setKYCWhitelist(KYCWhitelist.address);
    });

    it('addWinner function', async function() {
        await KYCWhitelist.addManager(accounts[3]);

        let err;
        try {
            await KYCWhitelist.addParticipant(accounts[1]);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            await KYCWhitelist.addParticipant(0, {from: accounts[3]});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await KYCWhitelist.addParticipant(accounts[1], {from: accounts[3]});
        await KYCWhitelist.addParticipant(accounts[2], {from: accounts[3]});
        await KYCWhitelist.addParticipant(accounts[5], {from: accounts[3]});
    });

    it('removeWinner function', async function() {
        await KYCWhitelist.addManager(accounts[3]);

        let err;
        try {
            await KYCWhitelist.removeParticipant(accounts[1]);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            await KYCWhitelist.removeParticipant(0, {from: accounts[3]});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);


        await KYCWhitelist.removeParticipant(accounts[5], {from: accounts[3]});

    });

    it('getGain function', async function() {
        it('getGain function', async function() {
            let round = 1;
            let account1BalanceBefore = new BigNumber(web3.eth.getBalance(accounts[1]));
            let account2BalanceBefore = new BigNumber(web3.eth.getBalance(accounts[3]));
            let mainLotteryBalanceBefore = new BigNumber(web3.eth.getBalance(MainLottery.address));

            await MainLottery.getGain(round, round, {from: accounts[1]});
            await MainLottery.getGain(round, round, {from: accounts[3]});

            let err;
            try {
                await MainLottery.getGain(round, round, {from: accounts[1]});
            } catch (error) {
                err = error;
            }
            assert.ok(err instanceof Error);

            let account1Balance = new BigNumber(web3.eth.getBalance(accounts[1]));
            let account2Balance = new BigNumber(web3.eth.getBalance(accounts[3]));
            let mainLotteryBalance = new BigNumber(web3.eth.getBalance(MainLottery.address));

            assert(account2BalanceBefore.toString(), account2Balance.toString(), 'balance is not correct');
            assert((account1Balance.minus(account1BalanceBefore)).toString(),
                (mainLotteryBalanceBefore.minus(mainLotteryBalance)).toString(), 'balance is not correct');
        });

    });

    it('sendGain function', async function() {
        let round = 1;
        let account2BalanceBefore = new BigNumber(web3.eth.getBalance(accounts[2]));
        let mainLotteryBalanceBefore = new BigNumber(web3.eth.getBalance(MainLottery.address));
        let err;
        try {
            await MainLottery.sendGain(accounts[2], round, round);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await MainLottery.addManager(accounts[0]);
        await MainLottery.sendGain(accounts[2], round, round);

        try {
            await MainLottery.sendGain(accounts[2], round, round);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        let account2Balance = new BigNumber(web3.eth.getBalance(accounts[2]));
        let mainLotteryBalance = new BigNumber(web3.eth.getBalance(MainLottery.address));


        assert((account2Balance.minus(account2BalanceBefore)).toString(),
            (mainLotteryBalanceBefore.minus(mainLotteryBalance)).toString(), 'balance is not correct');
    });


    it('buyBonusTickets function', async function() {


        await MainLottery.buyBonusTickets(accounts[0], 10, 10, 10, 10, 10, 10);
    });



});