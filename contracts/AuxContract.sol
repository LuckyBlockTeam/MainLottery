pragma solidity 0.5.2;

contract iRNG {
    function update(uint roundNumber, uint additionalNonce, uint period) public payable;
}

contract AuxContract {

    uint public counter = 0;
    uint public random;
    iRNG public rng;

    function () payable external {

    }

    function count() public {
        counter++;
    }

    function setRNG(address _rng) public {
        rng = iRNG(_rng);
    }

    function startLottery(uint round) payable public {
        rng.update.value(msg.value)(round, 0, 0);
    }

    function processRound(uint _round, uint _randomNumber) public payable returns (bool) {
        _round;
        random = _randomNumber;
        return true;
    }

}
