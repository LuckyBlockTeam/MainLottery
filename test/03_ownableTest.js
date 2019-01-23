const TestBaseLotteryContract = artifacts.require("./TestBaseLottery.sol");

contract('Ownable tests', async (accounts) => {

    beforeEach(async function () {
        BaseLottery = await TestBaseLotteryContract.deployed();
    });

    it('check owner function', async function() {
        let owner = await BaseLottery.owner();

        assert.equal(owner, accounts[0]);
    });

    it('check transferOwnership function', async function() {
        let newOwner = accounts[5];
        await BaseLottery.transferOwnership(newOwner);
        let owner = await BaseLottery.owner();
        assert.equal(owner, newOwner);
    });

    it('check transferOwnership function from not owner', async function() {
        let newOwner = accounts[0];
        let err;
        try {
            await BaseLottery.transferOwnership(newOwner);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await BaseLottery.transferOwnership(newOwner, {from: accounts[5]});
        let owner = await BaseLottery.owner();
        assert.equal(owner, newOwner);
    });

    it('check transferOwnership function with zero address', async function() {
        let newOwner = 0;
        let err;
        try {
            await BaseLottery.transferOwnership(newOwner);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });
});