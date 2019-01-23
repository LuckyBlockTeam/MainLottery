pragma solidity 0.5.2;

import "../WeeklyLottery.sol";

contract TestWeeklyLottery is WeeklyLottery {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        WeeklyLottery(_rng, _period)
    {

    }
}
