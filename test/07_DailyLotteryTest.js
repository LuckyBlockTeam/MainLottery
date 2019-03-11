const TestMainLotteryContract = artifacts.require("./TestMainLottery.sol");
const TestDailyLotteryContract = artifacts.require("./TestDailyLottery.sol");

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('DailyLottery tests', async (accounts) => {

    let MainLottery;
    let DailyLottery;

    beforeEach(async function () {
        MainLottery = await TestMainLotteryContract.deployed();
        DailyLottery = await TestDailyLotteryContract.deployed();
    });

});