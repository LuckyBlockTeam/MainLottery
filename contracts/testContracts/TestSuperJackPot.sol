pragma solidity 0.5.2;

import "../SuperJackPot.sol";

contract TestSuperJackPot is SuperJackPot {

    constructor(
        address payable _rng,
        uint _period,
        address _checker
    )
        public
        SuperJackPot(_rng, _period, _checker)
    {

    }
}
