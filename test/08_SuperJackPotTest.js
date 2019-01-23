const RNGContract = artifacts.require("./RNG.sol");
const TestSuperJackPotContract = artifacts.require("./TestSuperJackPot.sol");
const JackPotCheckerContract = artifacts.require("./JackPotChecker.sol");
const TestMainLotteryContract = artifacts.require("./TestMainLottery.sol");

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('SuperJackPot test', async (accounts) => {

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
    });


    it('setChecker function', async function(){
        let err;
        let value = web3.utils.toWei("1", "ether");
        try {
            await SuperJackPot.processLottery({value:value})
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            await SuperJackPot.setChecker(0)
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await SuperJackPot.setChecker(accounts[0]);

    });

    it('processLottery function', async function(){
        let value = web3.utils.toWei("1", "ether");
        await RNG.setTestId('0x0');
        await SuperJackPot.processLottery({value:value});
        await SuperJackPot.setChecker(JackPotChecker.address);
    });


});

