pragma solidity 0.5.2;


import "./BaseLottery.sol";


contract DailyLottery is BaseLottery {
    
    constructor(
        address payable _rng,
        uint _period
    )
        public
        BaseLottery(_rng, _period)
    {

    }

}