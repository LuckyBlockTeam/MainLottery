pragma solidity 0.5.2;

import "../DailyLottery.sol";


contract TestDailyLottery is DailyLottery {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        DailyLottery(_rng, _period)
    {

    }
}
