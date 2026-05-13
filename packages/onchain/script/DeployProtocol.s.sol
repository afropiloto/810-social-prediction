// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {BancoEscrow} from "../src/escrow/BancoEscrow.sol";
import {EscrowedBinaryMarket} from "../src/markets/EscrowedBinaryMarket.sol";
import {IOptimisticOracleV3} from "../src/interfaces/IOptimisticOracleV3.sol";

/// @notice Deploys core protocol infrastructure to HyperEVM:
/// - BancoEscrow (upgradeable-style initializer, owner = relayer/backend)
/// - EscrowedBinaryMarket (UMA OO optional + oracleSigner fallback)
///
/// Env vars expected:
/// - USDC_ADDRESS
/// - BACKEND_OWNER (address that can call processSettlement)
/// - UMA_OO_ADDRESS (optional; set to 0x000.. if none on HyperEVM)
/// - ORACLE_SIGNER (required if UMA not present; your funded oracle wallet address)
/// - UMA_IDENTIFIER (optional; default "ASSERT_TRUTH")
/// - UMA_DOMAIN_ID (optional; default 0)
contract DeployProtocol is Script {
    function run() external {
        address usdc = vm.envAddress("USDC_ADDRESS");
        address backendOwner = vm.envAddress("BACKEND_OWNER");

        address umaOoAddr = vm.envOr("UMA_OO_ADDRESS", address(0));
        address oracleSigner = vm.envOr("ORACLE_SIGNER", address(0));

        bytes32 identifier = vm.envOr("UMA_IDENTIFIER", bytes32("ASSERT_TRUTH"));
        bytes32 domainId = vm.envOr("UMA_DOMAIN_ID", bytes32(0));

        // If UMA isn't set, oracle signer must be set.
        require(umaOoAddr != address(0) || oracleSigner != address(0), "need UMA_OO_ADDRESS or ORACLE_SIGNER");

        // Private key is provided via `forge script ... --private-key` or `--interactive`.
        vm.startBroadcast();

        BancoEscrow escrow = new BancoEscrow();
        escrow.initialize(usdc, backendOwner);

        EscrowedBinaryMarket market = new EscrowedBinaryMarket(
            IOptimisticOracleV3(umaOoAddr),
            identifier,
            domainId,
            oracleSigner
        );

        vm.stopBroadcast();

        console2.log("BancoEscrow:", address(escrow));
        console2.log("EscrowedBinaryMarket:", address(market));
    }
}

