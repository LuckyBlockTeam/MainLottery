pragma solidity 0.5.2;


import "./BaseLottery.sol";


contract IChecker {
    function update() public payable;
}


contract JackPot is BaseLottery {

    IChecker public checker;

    modifier onlyChecker {
        require(msg.sender == address(checker), "");
        _;
    }

    constructor(
        address payable _rng,
        uint _period,
        address _checker
    )
        public
        BaseLottery(_rng, _period) {
            require(_checker != address(0), "");

            checker = IChecker(_checker);
    }

    function () external payable {

    }

    function processLottery() public payable onlyChecker {
        rounds[currentRound].state = RoundState.WAIT_RESULT;
        emit RoundStateChanged(currentRound, rounds[currentRound].state);
        currentRound = currentRound.add(1);
        rounds[currentRound].startRoundTime = getCurrentTime();
        rounds[currentRound].state = RoundState.ACCEPT_FUNDS;
        emit RoundStateChanged(currentRound, rounds[currentRound].state);
        iRNG(rng).update.value(msg.value)(currentRound, rounds[currentRound].nonce, 0);
    }

    function startLottery(uint _startPeriod) public payable onlyLotteryContract {
        _startPeriod;
        currentRound = 1;
        uint time = getCurrentTime();
        rounds[currentRound].startRoundTime = time;
        rounds[currentRound].state = RoundState.ACCEPT_FUNDS;
        emit RoundStateChanged(currentRound, rounds[currentRound].state);
        emit LotteryStarted(time);
        checker.update.value(msg.value)();
    }

    function setChecker(address _checker) public onlyOwner {
        require(_checker != address(0), "");

        checker = IChecker(_checker);
    }

    function processRound(uint _round, uint _randomNumber) public payable onlyRng returns (bool) {
        rounds[_round].random = _randomNumber;
        rounds[_round].winningTickets.push(_randomNumber.mod(rounds[_round].ticketsCount));

        address winner = getWinner(
            _round,
            0,
            (rounds[_round].tickets.length).sub(1),
            rounds[_round].winningTickets[0]
        );

        rounds[_round].winners.push(winner);
        rounds[_round].winnersFunds[winner] = rounds[_round].roundFunds;
        rounds[_round].state = RoundState.SUCCESS;

        emit RoundStateChanged(_round, rounds[_round].state);
        emit RoundProcecced(_round, rounds[_round].winners, rounds[_round].winningTickets, rounds[_round].roundFunds);

        currentRound = currentRound.add(1);
        rounds[currentRound].state = RoundState.ACCEPT_FUNDS;

        emit RoundStateChanged(_round, rounds[_round].state);
        return true;
    }

    function buyTickets(address _participant) public payable onlyLotteryContract {
        require(msg.value > 0, "");

        uint ticketsCount = msg.value.div(ticketPrice);
        addParticipant(_participant, ticketsCount);

        updateRoundFundsAndParticipants(_participant, msg.value);
    }
}
