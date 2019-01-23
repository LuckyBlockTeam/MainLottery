pragma solidity 0.5.2;

import "../MainLottery.sol";

contract TestMainLottery is MainLottery {

    constructor (
        address payable _rng,
        uint _period,
        address _dailyLottery,
        address _weeklyLottery,
        address _monthlyLottery,
        address _yearlyLottery,
        address _superJackPot
    )
        public
        MainLottery(
            _rng,
            _period,
            _dailyLottery,
            _weeklyLottery,
            _monthlyLottery,
            _yearlyLottery,
            _superJackPot
        )
    { }

}
