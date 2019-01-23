pragma solidity 0.5.2;
pragma experimental ABIEncoderV2;

//import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";
import "./oraclizeAPI_mock.sol";
import "./Ownable.sol";
import "./SafeMath.sol";


contract iJackPot {
    function processLottery() public payable;
    function getCurrentRound() public view returns (uint);
    function getRoundFunds(uint _round) public view returns (uint);
}


contract JackPotChecker is usingOraclize, Ownable {
    using SafeMath for uint;

    string public url = "json(https://api.etherscan.io/api?module=stats&action=ethprice&apikey=91DFNHV3CJDJE12PG4DD66FUZEK71TC6NW).result.ethusd";

    //    uint public startValue = 10**9*100; //  $ 1 000 000 000 in cents
    uint public startValue = 40000; //400 USD in cents, ~2 ether, 2 ether for test
    uint public ETHInUSD;
    uint public CUSTOM_GASLIMIT = 350000;
    uint public timeout = 60; //86400; //1 day in sec

    uint public lastCallbackTimestamp;
    uint public minTimeUpdate = 600; // 10 min in sec

    iJackPot public superJackPot;

    event NewOraclizeQuery(string description);
    event NewPrice(uint price);
    event CallbackIsFailed(address lottery, bytes32 queryId);
    event Withdraw(address to, uint amount);

    constructor () public {
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
    }

    function () external payable {

    }

    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
        require(msg.sender == oraclize_cbAddress());
        require(now > lastCallbackTimestamp + minTimeUpdate);
        ETHInUSD = parseInt(_result, 2);
        emit NewPrice(ETHInUSD);
        processSuperJackPot();

        lastCallbackTimestamp = now;
        update();
    }

    function update() public payable {
        require(msg.sender == oraclize_cbAddress() || msg.sender == address(owner) || msg.sender == address(superJackPot));

        if (oraclize_getPrice("URL", CUSTOM_GASLIMIT) > address(this).balance) {
            emit NewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit NewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query(
                timeout,
                "URL",
                url,
                CUSTOM_GASLIMIT
            );
        }
    }

    function processSuperJackPot() public {
        uint currentRound = superJackPot.getCurrentRound();
        uint roundFunds = superJackPot.getRoundFunds(currentRound);

        if (ETHInUSD.mul(roundFunds).div(10**18) >= startValue) {
            superJackPot.processLottery();
        }
    }

    function setSuperJackPot(address _superJackPot) public onlyOwner {
        require(_superJackPot != address(0), "");

        superJackPot = iJackPot(_superJackPot);
    }

    function setUrl(string memory _url) public onlyOwner {
        url = _url;
    }

    function getPrice() public view returns (uint) {
        return ETHInUSD;
    }

    function setOraclizeCallbackGasLimit(uint _limit) public onlyOwner {
        CUSTOM_GASLIMIT = _limit;
    }

    function setOraclizeTimeout(uint _timeout) public onlyOwner {
        timeout = _timeout;
    }

    function withdraw(address payable _to, uint _amount) public onlyOwner {
        address(_to).transfer(_amount);
        emit Withdraw(_to, _amount);
    }


    // For test only!!!
    function setPrice(uint _price) public {
        ETHInUSD = _price;
    }

    function setMinTimeUpdate(uint _time) public {
        minTimeUpdate = _time;
    }
}