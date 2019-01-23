const KYCWhitelistContract = artifacts.require("./KYCWhitelist.sol");

contract('Manageable tests', async (accounts) => {

    let KYCWhitelist;
    let testAddress = accounts[9];

    beforeEach(async function () {
        KYCWhitelist = await KYCWhitelistContract.deployed();
    });

    it('add address to manager list', async function() {
        let err;
        try {
            await KYCWhitelist.addManager(0);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await KYCWhitelist.addManager(testAddress);

        let isAddressManager = await KYCWhitelist.getInfo(testAddress);

        assert(isAddressManager, 'manager is not correct');

        //double adding
        await KYCWhitelist.addManager(testAddress);

        isAddressManager = await KYCWhitelist.getInfo(testAddress);

        assert(isAddressManager, 'manager is not correct');
    });

    it('remove address from manager list', async function() {
        await KYCWhitelist.removeManager(testAddress);

        let isAddressManager = await KYCWhitelist.getInfo(testAddress);

        assert(!isAddressManager, 'manager is not correct');

        //double removing
        await KYCWhitelist.removeManager(testAddress);

        isAddressManager = await KYCWhitelist.getInfo(testAddress);

        assert(!isAddressManager, 'manager is not correct');
    });
});