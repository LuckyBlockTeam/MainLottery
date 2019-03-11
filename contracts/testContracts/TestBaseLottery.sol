pragma solidity 0.5.2;


import "../BaseLottery.sol";

contract TestBaseLottery is BaseLottery {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        BaseLottery(_rng, _period)
    {

    }

    function setPeriod(uint _period) public onlyOwner {
        period = _period;
    }

    function setOraclizeTimeout(uint _timeout) public onlyOwner {
        ORACLIZE_TIMEOUT = _timeout;
    }

    function setParticipantsCount(uint _round, uint _count) public  {
        rounds[_round].participantCount = _count;
    }

}
