# Lucky block lottery

## Contracts

Please see the [contracts/](contracts) directory.

## Develop

* Contracts are written in [Solidity][solidity] and tested using [Truffle][truffle] and [ganache-cli][ganache-cli].

## Code

#### Functions
#### Public variable
#### Events

### Dependencies

```bash
# Install Truffle and ganache-cli packages globally:
$ npm install -g truffle ganache-cli

# Install local node dependencies:
$ npm install
```

## Test

```bash
$ ganache-cli&
$ truffle test --network ganache
```

## Deploy and manage

Use metamask to deploy the smart contracts.
Copy code to [remix browser](https://remix.ethereum.org). Compile the source and click deploy at the 'run' tab.

## Code Coverage

```bash
$ ./node_modules/.bin/solidity-coverage
```

## Collaborators

* **[Dmitriy Gogolev](https://github.com/gogolevdms)**


## License

MIT

[ethereum]: https://www.ethereum.org/
[solidity]: https://solidity.readthedocs.io/en/develop/
[truffle]: http://truffleframework.com/
[ganache-cli]: https://github.com/trufflesuite/ganache-cli
