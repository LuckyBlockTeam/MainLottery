pragma solidity 0.5.2;

import "../MonthlyLottery.sol";

contract TestMonthlyLottery is MonthlyLottery {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        MonthlyLottery(_rng, _period)
    {

    }
}
