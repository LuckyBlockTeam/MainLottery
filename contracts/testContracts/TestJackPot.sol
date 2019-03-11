pragma solidity 0.5.2;

import "../JackPot.sol";

contract TestJackPot is JackPot {

    constructor(
        address payable _rng,
        uint _period,
        address _checker
    )
        public
        JackPot(_rng, _period, _checker)
    {

    }
}
