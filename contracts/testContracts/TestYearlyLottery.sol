pragma solidity 0.5.2;

import "../YearlyLottery.sol";

contract TestYearlyLottery is YearlyLottery {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        YearlyLottery(_rng, _period)
    {

    }
}
