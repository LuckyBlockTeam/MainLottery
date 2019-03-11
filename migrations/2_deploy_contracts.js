const RNGContract = artifacts.require("./RNG.sol");
const BaseLotteryContract = artifacts.require("./BaseLottery.sol");
const MainLotteryContract = artifacts.require("./MainLottery.sol");
const DailyLotteryContract = artifacts.require("./DailyLottery.sol");
const WeeklyLotteryContract = artifacts.require("./WeeklyLottery.sol");
const MonthlyLotteryContract = artifacts.require("./MonthlyLottery.sol");
const YearlyLotteryContract = artifacts.require("./YearlyLottery.sol");
const JackPotContract = artifacts.require("./JackPot.sol");
const SuperJackPotContract = artifacts.require("./SuperJackPot.sol");
const JackPotCheckerContract = artifacts.require("./JackPotChecker.sol");
const KYCWhitelistContract = artifacts.require("./KYCWhitelist.sol");
const ManagementContract = artifacts.require("./Management.sol");
const TestBaseLotteryContract = artifacts.require("./TestBaseLottery.sol");
const TestMainLotteryContract = artifacts.require("./TestMainLottery.sol");
const TestDailyLotteryContract = artifacts.require("./TestDailyLottery.sol");
const TestWeeklyLotteryContract = artifacts.require("./TestWeeklyLottery.sol");
const TestMonthlyLotteryContract = artifacts.require("./TestMonthlyLottery.sol");
const TestYearlyLotteryContract = artifacts.require("./TestYearlyLottery.sol");
const TestJackPotContract = artifacts.require("./TestJackPot.sol");
const TestSuperJackPotContract = artifacts.require("./TestSuperJackPot.sol");
const RandaoContract = artifacts.require("./Randao.sol");
const AuxContractContract= artifacts.require("./AuxContract.sol");

module.exports = async function(deployer, network, accounts) {
    let BasePeriod = 121;
    let MainPeriod = 61;
    let DailyPeriod = 121;
    let WeeklyPeriod = 181;
    let MonthlyPeriod = 240;
    let YearlyPeriod = 300;
    let JackPotPeriod = 61;
    let SuperJackPotPeriod = 61;

    if ( true ||
        network == 'develop'
        || network == 'ganache'
        || network == 'coverage'
    )
    {
        deployer.then(async () => {

            await deployer.deploy(RNGContract, true);
            await deployer.deploy(KYCWhitelistContract);

            await deployer.link(RNGContract, TestBaseLotteryContract);
            await deployer.link(KYCWhitelistContract, TestBaseLotteryContract);
            await deployer.deploy(TestBaseLotteryContract, RNGContract.address, BasePeriod);


            await deployer.link(RNGContract, TestDailyLotteryContract);
            await deployer.link(KYCWhitelistContract, TestDailyLotteryContract);
            await deployer.deploy(TestDailyLotteryContract, RNGContract.address, DailyPeriod);

            await deployer.link(RNGContract, TestWeeklyLotteryContract);
            await deployer.link(KYCWhitelistContract, TestWeeklyLotteryContract);
            await deployer.deploy(TestWeeklyLotteryContract, RNGContract.address, WeeklyPeriod);

            await deployer.link(RNGContract, TestMonthlyLotteryContract);
            await deployer.link(KYCWhitelistContract, TestMonthlyLotteryContract);
            await deployer.deploy(TestMonthlyLotteryContract, RNGContract.address, MonthlyPeriod);

            await deployer.link(RNGContract, TestYearlyLotteryContract);
            await deployer.link(KYCWhitelistContract, TestYearlyLotteryContract);
            await deployer.deploy(TestYearlyLotteryContract, RNGContract.address, YearlyPeriod);

            await deployer.deploy(JackPotCheckerContract);

            await deployer.link(RNGContract, TestJackPotContract);
            await deployer.link(KYCWhitelistContract, TestJackPotContract);
            await deployer.deploy(TestJackPotContract, RNGContract.address, JackPotPeriod, JackPotCheckerContract.address);

            await deployer.link(RNGContract, TestSuperJackPotContract);
            await deployer.link(KYCWhitelistContract, TestSuperJackPotContract);
            await deployer.deploy(TestSuperJackPotContract, RNGContract.address, SuperJackPotPeriod, JackPotCheckerContract.address);

            await deployer.link(RNGContract, TestMainLotteryContract);
            await deployer.link(TestDailyLotteryContract, TestMainLotteryContract);
            await deployer.link(TestWeeklyLotteryContract, TestMainLotteryContract);
            await deployer.link(TestMonthlyLotteryContract, TestMainLotteryContract);
            await deployer.link(TestYearlyLotteryContract, TestMainLotteryContract);
            await deployer.link(TestJackPotContract, TestMainLotteryContract);
            await deployer.link(TestSuperJackPotContract, TestMainLotteryContract);
            await deployer.link(KYCWhitelistContract, TestMainLotteryContract);
            await deployer.deploy(
                TestMainLotteryContract,
                RNGContract.address,
                MainPeriod,
                TestDailyLotteryContract.address,
                TestWeeklyLotteryContract.address,
                TestMonthlyLotteryContract.address,
                TestYearlyLotteryContract.address,
                TestJackPotContract.address,
                TestSuperJackPotContract.address
            );

            await deployer.link(TestMainLotteryContract, ManagementContract);
            await deployer.link(TestDailyLotteryContract, ManagementContract);
            await deployer.link(TestWeeklyLotteryContract, ManagementContract);
            await deployer.link(TestMonthlyLotteryContract, ManagementContract);
            await deployer.link(TestYearlyLotteryContract, ManagementContract);
            await deployer.link(TestJackPotContract, ManagementContract);
            await deployer.link(TestSuperJackPotContract, ManagementContract);
            await deployer.deploy(
                ManagementContract,
                TestMainLotteryContract.address,
                TestDailyLotteryContract.address,
                TestWeeklyLotteryContract.address,
                TestMonthlyLotteryContract.address,
                TestYearlyLotteryContract.address,
                TestJackPotContract.address,
                TestSuperJackPotContract.address
            );

            await deployer.link(RNGContract, RandaoContract);
            await deployer.deploy(RandaoContract);

            await deployer.deploy(AuxContractContract);

            return console.log('Contracts are deployed in test network!');
        });
    } else {
        deployer.then(async () => {

            await deployer.deploy(RNGContract);
            await deployer.deploy(KYCWhitelistContract);

            await deployer.link(RNGContract, BaseLotteryContract);
            await deployer.link(KYCWhitelistContract, BaseLotteryContract);
            await deployer.deploy(BaseLotteryContract, RNGContract.address, BasePeriod);

            await deployer.link(RNGContract, DailyLotteryContract);
            await deployer.link(KYCWhitelistContract, DailyLotteryContract);
            await deployer.deploy(DailyLotteryContract, RNGContract.address, DailyPeriod);

            await deployer.link(RNGContract, WeeklyLotteryContract);
            await deployer.link(KYCWhitelistContract, WeeklyLotteryContract);
            await deployer.deploy(WeeklyLotteryContract, RNGContract.address, WeeklyPeriod);

            await deployer.link(RNGContract, MonthlyLotteryContract);
            await deployer.link(KYCWhitelistContract, MonthlyLotteryContract);
            await deployer.deploy(MonthlyLotteryContract, RNGContract.address, MonthlyPeriod);

            await deployer.link(RNGContract, YearlyLotteryContract);
            await deployer.link(KYCWhitelistContract, YearlyLotteryContract);
            await deployer.deploy(YearlyLotteryContract, RNGContract.address, YearlyPeriod);

            await deployer.deploy(JackPotCheckerContract);

            await deployer.link(RNGContract, SuperJackPotContract);
            await deployer.link(KYCWhitelistContract, SuperJackPotContract);
            await deployer.deploy(SuperJackPotContract, RNGContract.address, JackPotPeriod, JackPotCheckerContract.address);

            await deployer.link(RNGContract, MainLotteryContract);
            await deployer.link(DailyLotteryContract, MainLotteryContract);
            await deployer.link(WeeklyLotteryContract, MainLotteryContract);
            await deployer.link(MonthlyLotteryContract, MainLotteryContract);
            await deployer.link(YearlyLotteryContract, MainLotteryContract);
            await deployer.link(SuperJackPotContract, MainLotteryContract);
            await deployer.link(KYCWhitelistContract, MainLotteryContract);
            await deployer.deploy(
                MainLotteryContract,
                RNGContract.address,
                MainPeriod,
                DailyLotteryContract.address,
                WeeklyLotteryContract.address,
                MonthlyLotteryContract.address,
                YearlyLotteryContract.address,
                SuperJackPotContract.address
            );

            await deployer.link(MainLotteryContract, ManagementContract);
            await deployer.link(DailyLotteryContract, ManagementContract);
            await deployer.link(WeeklyLotteryContract, ManagementContract);
            await deployer.link(MonthlyLotteryContract, ManagementContract);
            await deployer.link(YearlyLotteryContract, ManagementContract);
            await deployer.link(SuperJackPotContract, ManagementContract);
            await deployer.deploy(
                ManagementContract,
                MainLotteryContract.address,
                DailyLotteryContract.address,
                WeeklyLotteryContract.address,
                MonthlyLotteryContract.address,
                YearlyLotteryContract.address,
                SuperJackPotContract.address
            );

            await deployer.link(RNGContract, RandaoContract);
            await deployer.deploy(RandaoContract);

            return console.log('Contracts are deployed in real network!');
        });
    }



};
