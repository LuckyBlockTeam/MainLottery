const TestMainLotteryContract = artifacts.require("./TestMainLottery.sol");

contract('Pausable tests', async (accounts) => {

    beforeEach(async function () {
        MainLottery = await TestMainLotteryContract.deployed();
    });

    it('check pause function', async function() {
        await MainLottery.pause(true);
        let paused = await MainLottery.paused.call();
        assert(paused);
    });

    it('check unpause function', async function() {
        await MainLottery.pause(false);
        let paused = await MainLottery.paused.call();
        assert(!paused);
    });
});