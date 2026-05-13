## 810 On-chain (HyperEVM) contracts

This folder is a standalone Foundry workspace for HyperEVM deployment.

### What’s implemented

- `src/markets/EscrowedBinaryMarket.sol`
  - ERC20 collateral escrow (e.g. USDC)
  - Binary market positions (YES/NO)
  - UMA Optimistic Oracle V3-style resolution via assertions (address configurable)
  - Pro-rata payout from escrow after resolution

- `src/escrow/CreatorBondEscrow.sol`
  - Minimal ERC20 **creator bond** escrow keyed by off-chain market id hash
  - `postBond` → deposit
  - `refund` (creator) after `closeTime + 24h`
  - `slash` (owner) after `closeTime + 24h` to `slashRecipient`

### Run tests

```bash
cd onchain
forge test
```

### Run tests without installing Foundry (Docker)

```bash
cd onchain
./scripts/test-foundry.sh
```

### Notes for HyperEVM + Hyperliquid CLOB

The intended architecture is:

- **Off-chain CLOB matching** (Hyperliquid) for fast trading UX
- **On-chain escrow + oracle resolution** for final settlement guarantees
- Netting/settlement can be performed by a relayer that updates users’ escrow deltas, or by forcing all trading to be escrow movements.

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
