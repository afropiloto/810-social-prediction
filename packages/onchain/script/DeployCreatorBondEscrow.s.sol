// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {CreatorBondEscrow} from "../src/escrow/CreatorBondEscrow.sol";

/// @notice Deploy CreatorBondEscrow (creator bond rail) to HyperEVM.
///
/// Env vars expected:
/// - BACKEND_OWNER (owner/admin address)
/// - SLASH_RECIPIENT (buffer pool / treasury address; optional, defaults to owner)
/// - DISPUTE_WINDOW_SEC (optional; default 86400)
contract DeployCreatorBondEscrow is Script {
    function run() external {
        address owner = vm.envAddress("BACKEND_OWNER");
        address slashRecipient = vm.envOr("SLASH_RECIPIENT", owner);
        uint64 window = uint64(vm.envOr("DISPUTE_WINDOW_SEC", uint256(86400)));

        vm.startBroadcast();
        CreatorBondEscrow escrow = new CreatorBondEscrow(window, slashRecipient, owner);
        vm.stopBroadcast();

        console2.log("CreatorBondEscrow:", address(escrow));
    }
}

