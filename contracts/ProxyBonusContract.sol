pragma solidity 0.5.2;

import "./Manageable.sol";
import "./SafeMath.sol";


interface iMainLottery {
    function getCurrentRound() external view returns (uint);
    function buyBonusTickets(
        address _participant,
        uint _mainTicketsCount,
        uint _dailyTicketsCount,
        uint _weeklyTicketsCount,
        uint _monthlyTicketsCount,
        uint _yearlyTicketsCount,
        uint _jackPotTicketsCount,
        uint _superJackPotTicketsCount
    ) external payable;
}

interface iAllLottery {
    function getCurrentRound() external view returns (uint);
}

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
interface IERC20 {
    function balanceOf(address who) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract ProxyBonusContract is Manageable {
    using SafeMath for uint;

    IERC20 public token;

    address mainLottery;
    address dailyLottery;
    address weeklyLottery;
    address monthlyLottery;
    address yearlyLottery;
    address jackPot;
    address superJackPot;

    mapping(address => uint) lotteryLimits;

    // Lottery => round => amount
    mapping(address => mapping (uint => uint)) public ticketRoundAmount;

    uint public betLimit = 100;

    constructor (
        address _token,
        address _mainLottery,
        address _dailyLottery,
        address _weeklyLottery,
        address _monthlyLottery,
        address _yearlyLottery,
        address _jackPot,
        address _superJackPot
    )
    public
    {
        require(_token != address(0));

        require(_mainLottery != address(0), "");

        require(_dailyLottery != address(0), "");
        require(_weeklyLottery != address(0), "");
        require(_monthlyLottery != address(0), "");
        require(_yearlyLottery != address(0), "");
        require(_jackPot != address(0), "");
        require(_superJackPot != address(0), "");

        token = IERC20(_token);

        mainLottery = _mainLottery;
        dailyLottery = _dailyLottery;
        weeklyLottery = _weeklyLottery;
        monthlyLottery = _monthlyLottery;
        yearlyLottery = _yearlyLottery;
        jackPot = _jackPot;
        superJackPot = _superJackPot;
    }

    function buyTickets(address _participant, uint _luckyBacksAmount) public {
        require(_luckyBacksAmount > 0, "");
        require(token.transferFrom(msg.sender, address(this), _luckyBacksAmount), "");
        require(_luckyBacksAmount <= betLimit);

        uint mainTicketsAmount = calcAmount(mainLottery, _luckyBacksAmount);
        uint dailyTicketsAmount = calcAmount(dailyLottery, _luckyBacksAmount);
        uint weeklyTicketsAmount = calcAmount(weeklyLottery, _luckyBacksAmount);
        uint monthlyTicketsAmount = calcAmount(monthlyLottery, _luckyBacksAmount);
        uint yearlyTicketsAmount = calcAmount(yearlyLottery, _luckyBacksAmount);
        uint jackPotTicketsAmount = calcAmount(jackPot, _luckyBacksAmount);
        uint superJackPotTicketsAmount = calcAmount(superJackPot, _luckyBacksAmount);

        iMainLottery(mainLottery).buyBonusTickets(
            _participant,
            mainTicketsAmount,
            dailyTicketsAmount,
            weeklyTicketsAmount,
            monthlyTicketsAmount,
            yearlyTicketsAmount,
            jackPotTicketsAmount,
            superJackPotTicketsAmount
        );
    }

    function calcAmount(address _lottery, uint _luckyBacksAmount) public returns (uint) {
        uint ticketsAmount = _luckyBacksAmount;
        uint currentRoundTicketsAmount = getRoundTicketsAmount(_lottery);
        uint lotteryRoundLimit = getRoundLimit(_lottery);

        if (currentRoundTicketsAmount.add(ticketsAmount) > lotteryRoundLimit) {
            ticketsAmount = lotteryRoundLimit.sub(currentRoundTicketsAmount);
        }

        addRoundTicketsAmount(_lottery, ticketsAmount);

        return ticketsAmount;
    }

    function getRoundTicketsAmount(address _lottery) public view returns (uint) {
        uint currentRound = iAllLottery(_lottery).getCurrentRound();
        return ticketRoundAmount[_lottery][currentRound];
    }

    function addRoundTicketsAmount(address _lottery, uint _amount) internal {
        uint currentRound = iAllLottery(_lottery).getCurrentRound();
        ticketRoundAmount[_lottery][currentRound] =  ticketRoundAmount[_lottery][currentRound].add(_amount);
    }

    function changeToken(address _token) public onlyManager {
        token = IERC20(_token);
    }

    function changeAllRoundLimits(
        uint _mainRoundLimit,
        uint _dailyRoundLimit,
        uint _weeklyRoundLimit,
        uint _monthlyRoundLimit,
        uint _yearlyRoundLimit,
        uint _jackPotRoundLimit,
        uint _superJackPotRoundLimit
    )
    public
    onlyManager
    {
        changeRoundLimit(mainLottery,_mainRoundLimit);
        changeRoundLimit(dailyLottery, _dailyRoundLimit);
        changeRoundLimit(weeklyLottery, _weeklyRoundLimit);
        changeRoundLimit(monthlyLottery, _monthlyRoundLimit);
        changeRoundLimit(yearlyLottery, _yearlyRoundLimit);
        changeRoundLimit(jackPot, _jackPotRoundLimit);
        changeRoundLimit(superJackPot, _superJackPotRoundLimit);
    }

    function changeRoundLimit(address _lottery, uint _roundLimit) public onlyManager {
        lotteryLimits[_lottery] = _roundLimit;
    }

    function getRoundLimit(address _lottery) public view returns (uint) {
        return lotteryLimits[_lottery];
    }

    function setBetLimit(uint _betLimit) public onlyManager {
        betLimit = _betLimit;
    }
}
