pragma solidity 0.5.2;


import "./BaseLottery.sol";


contract iBaseLottery {
    function getPeriod() public view returns (uint);
    function buyTickets(address _participant) public payable;
    function startLottery(uint _startPeriod) public payable;
    function setTicketPrice(uint _ticketPrice) public;
    function buyBonusTickets(address _participant, uint _ticketsCount) public;
}

contract iJackPotChecker {
    function getPrice() public view returns (uint);
}


contract MainLottery is BaseLottery {
    address payable public checker;
    uint public serviceMinBalance = 1 ether;

    uint public BET_PRICE; // = 10000000000000000;  //0.01 eth in wei

    uint constant public HOURLY_LOTTERY_SHARE = 30;                       //30% to hourly lottery
    uint constant public DAILY_LOTTERY_SHARE = 10;                        //10% to daily lottery
    uint constant public WEEKLY_LOTTERY_SHARE = 5;                        //5% to weekly lottery
    uint constant public MONTHLY_LOTTERY_SHARE = 5;                       //5% to monthly lottery
    uint constant public YEARLY_LOTTERY_SHARE = 5;                        //5% to yearly lottery
    uint constant public JACKPOT_LOTTERY_SHARE = 10;                 //10% to jackpot lottery
    uint constant public SUPER_JACKPOT_LOTTERY_SHARE = 15;                 //15% to superJackpot lottery
    uint constant public LOTTERY_ORGANISER_SHARE = 20;                    //20% to lottery organiser
    uint constant public SHARE_DENOMINATOR = 100;                        //denominator for share

    bool public paused;

    address public dailyLottery;
    address public weeklyLottery;
    address public monthlyLottery;
    address public yearlyLottery;
    address public jackPot;
    address public superJackPot;

    event TransferFunds(address to, uint funds);

    constructor (
        address payable _rng,
        uint _period,
        address _dailyLottery,
        address _weeklyLottery,
        address _monthlyLottery,
        address _yearlyLottery,
        address _jackPot,
        address _superJackPot
    )
        public
        BaseLottery(_rng, _period)
    {
        require(_dailyLottery != address(0), "");
        require(_weeklyLottery != address(0), "");
        require(_monthlyLottery != address(0), "");
        require(_yearlyLottery != address(0), "");
        require(_jackPot != address(0), "");
        require(_superJackPot != address(0), "");

        dailyLottery = _dailyLottery;
        weeklyLottery = _weeklyLottery;
        monthlyLottery = _monthlyLottery;
        yearlyLottery = _yearlyLottery;
        jackPot = _jackPot;
        superJackPot = _superJackPot;
    }

    function () external payable {
        buyTickets(msg.sender);
    }

    function buyTickets(address _participant) public payable {
        require(!paused, "");
        require(msg.value > 0, "");

        uint ETHinUSD = iJackPotChecker(checker).getPrice();
        BET_PRICE = uint(100).mul(10**18).div(ETHinUSD);    // BET_PRICE is $1 in wei

        uint funds = msg.value;
        uint extraFunds = funds.mod(BET_PRICE);

        if (extraFunds > 0) {
            organiser.transfer(extraFunds);
            emit TransferFunds(organiser, extraFunds);
            funds = funds.sub(extraFunds);
        }

        uint fundsToOrginiser = funds.mul(LOTTERY_ORGANISER_SHARE).div(SHARE_DENOMINATOR);

        fundsToOrginiser = transferToServices(rng, fundsToOrginiser, serviceMinBalance);
        fundsToOrginiser = transferToServices(checker, fundsToOrginiser, serviceMinBalance);

        if (fundsToOrginiser > 0) {
            organiser.transfer(fundsToOrginiser);
            emit TransferFunds(organiser, fundsToOrginiser);
        }

        updateRoundTimeAndState();
        addParticipant(_participant, funds.div(BET_PRICE));
        updateRoundFundsAndParticipants(_participant, funds.mul(HOURLY_LOTTERY_SHARE).div(SHARE_DENOMINATOR));

        if (getCurrentTime() > rounds[currentRound].startRoundTime.add(period)
            && rounds[currentRound].participantCount >= 10
        ) {
            _restartLottery();
        }

        iBaseLottery(dailyLottery).buyTickets.value(funds.mul(DAILY_LOTTERY_SHARE).div(SHARE_DENOMINATOR))(_participant);
        iBaseLottery(weeklyLottery).buyTickets.value(funds.mul(WEEKLY_LOTTERY_SHARE).div(SHARE_DENOMINATOR))(_participant);
        iBaseLottery(monthlyLottery).buyTickets.value(funds.mul(MONTHLY_LOTTERY_SHARE).div(SHARE_DENOMINATOR))(_participant);
        iBaseLottery(yearlyLottery).buyTickets.value(funds.mul(YEARLY_LOTTERY_SHARE).div(SHARE_DENOMINATOR))(_participant);
        iBaseLottery(jackPot).buyTickets.value(funds.mul(JACKPOT_LOTTERY_SHARE).div(SHARE_DENOMINATOR))(_participant);
        iBaseLottery(superJackPot).buyTickets.value(funds.mul(SUPER_JACKPOT_LOTTERY_SHARE).div(SHARE_DENOMINATOR))(_participant);

    }

    function buyBonusTickets(
        address _participant,
        uint _mainTicketsCount,
        uint _dailyTicketsCount,
        uint _weeklyTicketsCount,
        uint _monthlyTicketsCount,
        uint _yearlyTicketsCount,
        uint _jackPotTicketsCount,
        uint _superJackPotTicketsCount
    )
        public
        payable
        onlyManager
    {
        require(!paused, "");

        updateRoundTimeAndState();
        addParticipant(_participant, _mainTicketsCount);
        updateRoundFundsAndParticipants(_participant, uint(0));

        if (getCurrentTime() > rounds[currentRound].startRoundTime.add(period)
            && rounds[currentRound].participantCount >= 10
        ) {
            _restartLottery();
        }

        iBaseLottery(dailyLottery).buyBonusTickets(_participant, _dailyTicketsCount);
        iBaseLottery(weeklyLottery).buyBonusTickets(_participant, _weeklyTicketsCount);
        iBaseLottery(monthlyLottery).buyBonusTickets(_participant, _monthlyTicketsCount);
        iBaseLottery(yearlyLottery).buyBonusTickets(_participant, _yearlyTicketsCount);
        iBaseLottery(jackPot).buyBonusTickets(_participant, _jackPotTicketsCount);
        iBaseLottery(superJackPot).buyBonusTickets(_participant, _superJackPotTicketsCount);
    }

    function setChecker(address payable _checker) public onlyOwner {
        require(_checker != address(0), "");

        checker = _checker;
    }

    function setMinBalance(uint _minBalance) public onlyOwner {
        require(_minBalance >= 1 ether, "");

        serviceMinBalance = _minBalance;
    }

    function pause(bool _paused) public onlyOwner {
        paused = _paused;
    }

    function transferToServices(address payable _service, uint _funds, uint _minBalance) internal returns (uint) {
        uint result = _funds;
        if (_service.balance < _minBalance) {
            uint lack = _minBalance.sub(_service.balance);
            if (_funds > lack) {
                _service.transfer(lack);
                emit TransferFunds(_service, lack);
                result = result.sub(lack);
            } else {
                _service.transfer(_funds);
                emit TransferFunds(_service, _funds);
                result = uint(0);
            }
        }
        return result;
    }
}
