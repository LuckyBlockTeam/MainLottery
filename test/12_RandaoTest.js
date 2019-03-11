const RNGContract = artifacts.require("./RNG.sol");
const RandaoContract = artifacts.require("./Randao.sol");
const AuxContractContract = artifacts.require('./AuxContract.sol');
const BigNumber = web3.utils.BN;

let AuxContract;

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

var addBlocks = async (num) => {
    if (num == 0) return;
    let currentBlock = await web3.eth.getBlockNumber();
    while (await web3.eth.getBlockNumber() == currentBlock) {
       await AuxContract.count();
    }
    await addBlocks(num-1);
};

contract('Randao tests', async (accounts) => {

    let RNG;
    let Randao;

    before(async function () {
        RNG = await RNGContract.deployed();
        Randao = await RandaoContract.deployed();
        AuxContract = await AuxContractContract.deployed();
        await RNG.setUseOraclize(false);
        await RNG.addAddressToWhitelist(AuxContract.address);
        await Randao.setRNG(RNG.address);
        await AuxContract.setRNG(RNG.address);
        await RNG.setRandao(Randao.address);
    });

    describe('Initial state test', () => {

        it('founder test', async () => {
            let founder = accounts[0];
            let founderFromContract = await Randao.founder.call();

            assert.equal(founder, founderFromContract, 'Founder address is not correct!');
        });

    });

    let startBlock = await web3.eth.getBlockNumber();

    describe('Functional tests with success campaign', async () => {


        it('start new campaign by call update function in RNG from lottery', async () => {
            let toStartLottery = web3.utils.toWei('1', "ether");
            await AuxContract.send(web3.utils.toWei('1', "ether"));
            await RNG.send(web3.utils.toWei('1', "ether"));
            await AuxContract.startLottery(0, {value: toStartLottery});
        });

        it('commit function from account1', async () => {
            let num = 10;
            let value = web3.utils.toWei('200', 'finney');
            let hashhash = web3.utils.soliditySha3(web3.utils.soliditySha3(num));
            await Randao.commit(0, hashhash, {from: accounts[1], value: value});
        });

        it('commit function from account2', async () => {
            let num = 20;
            let value = web3.utils.toWei('200', 'finney');
            let hashhash = web3.utils.soliditySha3(web3.utils.soliditySha3(num));
            await Randao.commit(0, hashhash, {from: accounts[2], value: value});
        });

        it('commit function from account3', async () => {
            let num = 30;
            let value = web3.utils.toWei('200', 'finney');
            let hashhash = web3.utils.soliditySha3(web3.utils.soliditySha3(num));
            await Randao.commit(0, hashhash, {from: accounts[3], value: value});
        });

        it('add blocks to go to 2nd phase', async () => {
            await addBlocks(50);
        });

        it('trying commit from account4 on the 2nd phase', async () => {
            let num = 10;
            let value = web3.utils.toWei('200', 'finney');
            let hashhash = web3.utils.soliditySha3(web3.utils.soliditySha3(num));
            let err;
            try {
                await Randao.commit(0, hashhash, {from: accounts[4], value: value});
            } catch (e) {
                err = e;
            }
            assert.ok(err instanceof Error);
        });

        it('reveal function from account1', async () => {
            let num = 10;
            await Randao.reveal(0, num, {from: accounts[1]});
        });

        it('reveal function from account2', async () => {
            let num = 20;
            await Randao.reveal(0, num, {from: accounts[2]});
        });

        it('reveal function from account3', async () => {
            let num = 30;
            await Randao.reveal(0, num, {from: accounts[3]});
        });

        it('add blocks to go to 3nd phase', async () => {
            await addBlocks(50);
        });

        it('sendRandomToRNG function and check random number in lottery', async () => {
            let random = await Randao.getRandom.call(0);
            let random_ = web3.utils.toBN(web3.utils.soliditySha3(random));
            await Randao.sendRandomToRNg(0);
            let randomFromLottery = await AuxContract.random.call();

            assert.equal(randomFromLottery - random_, 0, 'Random is not correct!');
        });

        it('getMyBounty test from account1', async () => {
            let acc = accounts[1];
            let balanceBefore = await web3.eth.getBalance(acc);
            let gasPrice = new BigNumber(10000000000);
            let trans = await Randao.getMyBounty(0, {from: acc, gasPrice: gasPrice});
            let gas = new BigNumber(trans.receipt.gasUsed);
            let balanceAfter = await web3.eth.getBalance(acc);
            let gasCost = gasPrice.mul(gas);
            let BNBefore = new BigNumber(balanceBefore);
            let BNAfter = new BigNumber(balanceAfter);
            let balanceDiff = new BigNumber(BNAfter.sub(BNBefore));
            let result = new BigNumber(balanceDiff.add(gasCost));

            let value = web3.utils.toWei('950', 'finney');
            let amount = new BigNumber(value);
            let den = new BigNumber(3);
            let resultEthalon = new BigNumber(amount.div(den));

            let diff = result.sub(resultEthalon);
            assert.equal(diff, 0, 'Balance is not correct!');

        });


        it('getMyBounty test from account2', async () => {
            let acc = accounts[2];
            let balanceBefore = await web3.eth.getBalance(acc);
            let gasPrice = new BigNumber(10000000000);
            let trans = await Randao.getMyBounty(0, {from: acc, gasPrice: gasPrice});
            let gas = new BigNumber(trans.receipt.gasUsed);
            let balanceAfter = await web3.eth.getBalance(acc);
            let gasCost = gasPrice.mul(gas);
            let BNBefore = new BigNumber(balanceBefore);
            let BNAfter = new BigNumber(balanceAfter);
            let balanceDiff = new BigNumber(BNAfter.sub(BNBefore));
            let result = new BigNumber(balanceDiff.add(gasCost));

            let value = web3.utils.toWei('950', 'finney');
            let amount = new BigNumber(value);
            let den = new BigNumber(3);
            let resultEthalon = new BigNumber(amount.div(den));

            let diff = result.sub(resultEthalon);
            assert.equal(diff, 0, 'Balance is not correct!');

        });

        it('getMyBounty test from account3', async () => {
            let acc = accounts[3];
            let balanceBefore = await web3.eth.getBalance(acc);
            let gasPrice = new BigNumber(10000000000);
            let trans = await Randao.getMyBounty(0, {from: acc, gasPrice: gasPrice});
            let gas = new BigNumber(trans.receipt.gasUsed);
            let balanceAfter = await web3.eth.getBalance(acc);
            let gasCost = gasPrice.mul(gas);
            let BNBefore = new BigNumber(balanceBefore);
            let BNAfter = new BigNumber(balanceAfter);
            let balanceDiff = new BigNumber(BNAfter.sub(BNBefore));
            let result = new BigNumber(balanceDiff.add(gasCost));

            let value = web3.utils.toWei('950', 'finney');
            let amount = new BigNumber(value);
            let den = new BigNumber(3);
            let resultEthalon = new BigNumber(amount.div(den));

            let diff = result.sub(resultEthalon);
            assert.equal(diff, 0, 'Balance is not correct!');

        });

    });

    describe('Functional tests with fail campaign', async () => {


        it('start new campaign by call update function in RNG from lottery', async () => {
            let toStartLottery = web3.utils.toWei('1', "ether");
            await AuxContract.send(web3.utils.toWei('1', "ether"));
            await RNG.send(web3.utils.toWei('1', "ether"));
            await AuxContract.startLottery(1, {value: toStartLottery});
        });

        it('trying commit function from account1 with wrong deposit', async () => {
            let num = 10;
            let value = web3.utils.toWei('100', 'finney');
            let hashhash = web3.utils.soliditySha3(web3.utils.soliditySha3(num));
            let err;
            try {
                await Randao.commit(1, hashhash, {from: accounts[1], value: value});
            } catch(e) {
                err = e;
            }

            assert.ok(err instanceof Error);
        });

        it('commit function from account1', async () => {
            let num = 10;
            let value = web3.utils.toWei('200', 'finney');
            let hashhash = web3.utils.soliditySha3(web3.utils.soliditySha3(num));
            await Randao.commit(1, hashhash, {from: accounts[1], value: value});
        });

        it('commit function from account2', async () => {
            let num = 20;
            let value = web3.utils.toWei('200', 'finney');
            let hashhash = web3.utils.soliditySha3(web3.utils.soliditySha3(num));
            await Randao.commit(1, hashhash, {from: accounts[2], value: value});
        });

        it('commit function from account3', async () => {
            let num = 30;
            let value = web3.utils.toWei('200', 'finney');
            let hashhash = web3.utils.soliditySha3(web3.utils.soliditySha3(num));
            await Randao.commit(1, hashhash, {from: accounts[3], value: value});
        });

        it('add blocks to go to 2nd phase', async () => {
            await addBlocks(50);
        });

        it('trying commit from account4 on the 2nd phase', async () => {
            let num = 10;
            let value = web3.utils.toWei('200', 'finney');
            let hashhash = web3.utils.soliditySha3(web3.utils.soliditySha3(num));
            let err;
            try {
                await Randao.commit(1, hashhash, {from: accounts[4], value: value});
            } catch (e) {
                err = e;
            }
            assert.ok(err instanceof Error);
        });

        it('reveal function from account1', async () => {
            let num = 10;
            await Randao.reveal(1, num, {from: accounts[1]});
        });

        it('reveal function from account2', async () => {
            let num = 20;
            await Randao.reveal(1, num, {from: accounts[2]});
        });

        it('add blocks to go to 3nd phase', async () => {
            await addBlocks(50);
        });

        it('trying reveal function from account3 on 3rd phase', async () => {
            let num = 30;
            let err;
            try {
                await Randao.reveal(1, num, {from: accounts[3]});
            } catch(e) {
                err = e;
            }

            assert.ok(err instanceof Error);
        });

        it('sendRandomToRNG function and check random number in lottery', async () => {
            let random = await Randao.getRandom.call(0);
            let random_ = web3.utils.toBN(web3.utils.soliditySha3(random));
            await Randao.sendRandomToRNg(0);
            let randomFromLottery = await AuxContract.random.call();

            assert.equal(randomFromLottery - random_, 0, 'Random is not correct!');
        });

        it('getMyBounty test from account1', async () => {
            let acc = accounts[1];
            let balanceBefore = await web3.eth.getBalance(acc);
            let gasPrice = new BigNumber(10000000000);
            let trans = await Randao.getMyBounty(1, {from: acc, gasPrice: gasPrice});
            let gas = new BigNumber(trans.receipt.gasUsed);
            let balanceAfter = await web3.eth.getBalance(acc);
            let gasCost = gasPrice.mul(gas);
            let BNBefore = new BigNumber(balanceBefore);
            let BNAfter = new BigNumber(balanceAfter);
            let balanceDiff = new BigNumber(BNAfter.sub(BNBefore));
            let result = new BigNumber(balanceDiff.add(gasCost));

            let value = web3.utils.toWei('950', 'finney');
            let amount = new BigNumber(value);
            let den = new BigNumber(2);
            let resultEthalon = new BigNumber(amount.div(den));

            let diff = result.sub(resultEthalon);
            assert.equal(diff, 0, 'Balance is not correct!');

        });


        it('getMyBounty test from account2', async () => {
            let acc = accounts[2];
            let balanceBefore = await web3.eth.getBalance(acc);
            let gasPrice = new BigNumber(10000000000);
            let trans = await Randao.getMyBounty(1, {from: acc, gasPrice: gasPrice});
            let gas = new BigNumber(trans.receipt.gasUsed);
            let balanceAfter = await web3.eth.getBalance(acc);
            let gasCost = gasPrice.mul(gas);
            let BNBefore = new BigNumber(balanceBefore);
            let BNAfter = new BigNumber(balanceAfter);
            let balanceDiff = new BigNumber(BNAfter.sub(BNBefore));
            let result = new BigNumber(balanceDiff.add(gasCost));

            let value = web3.utils.toWei('950', 'finney');
            let amount = new BigNumber(value);
            let den = new BigNumber(2);
            let resultEthalon = new BigNumber(amount.div(den));

            let diff = result.sub(resultEthalon);
            assert.equal(diff, 0, 'Balance is not correct!');

        });

        it('trying getMyBody test from account3', async () => {
            let acc = accounts[3];
            let gasPrice = new BigNumber(10000000000);
            let err;
            try {
                await Randao.refundBounty(1, {from: acc, gasPrice: gasPrice});
            } catch(e) {
                err = e;0
            }

            assert.ok(err instanceof Error);

        });

    });

});
