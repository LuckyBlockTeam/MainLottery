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

contract('Constructors tests', async (accounts) => {

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

    let failRNG = 0;
    let failBaseLottery = 0;
    let failMainLottery = 0;
    let failDailyLottery = 0;
    let failWeeklyLottery = 0;
    let failMonthlyLottery = 0;
    let failYearlyLottery = 0;
    let failSuperJackPot = 0;
    let failJackPotChecker = 0;
    let failKYCWhitelist = 0;

    let failPeriod = 10;
    let period = 65;

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
    });

    it('BaseLottery constructor test', async function() {
        let err;
        try {
            BaseLottery = BaseLottery.new(failRNG, period);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            BaseLottery = BaseLottery.new(RNG.address, failPeriod);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('MainLottery constructor test', async function() {
        let err;
        try {
            MainLottery = MainLottery.new(
                RNG.address,
                period,
                failDailyLottery,
                failWeeklyLottery,
                failMonthlyLottery,
                failYearlyLottery,
                failSuperJackPot
            );
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            MainLottery = MainLottery.new(
                RNG.address,
                period,
                DailyLottery.address,
                failWeeklyLottery,
                failMonthlyLottery,
                failYearlyLottery,
                failSuperJackPot
            );
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            MainLottery = MainLottery.new(
                RNG.address,
                period,
                DailyLottery.address,
                WeeklyLottery.address,
                failMonthlyLottery,
                failYearlyLottery,
                failSuperJackPot
            );
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            MainLottery = MainLottery.new(
                RNG.address,
                period,
                DailyLottery.address,
                WeeklyLottery.address,
                MonthlyLottery.address,
                failYearlyLottery,
                failSuperJackPot
            );
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            MainLottery = MainLottery.new(
                RNG.address,
                period,
                DailyLottery.address,
                WeeklyLottery.address,
                MonthlyLottery.address,
                YearlyLottery.address,
                failSuperJackPot
            );
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('SuperJackPot constructor test', async function() {
        let err;
        try {
            SuperJackPot = SuperJackPot.new(RNG.address, period, failJackPotChecker);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });
});
