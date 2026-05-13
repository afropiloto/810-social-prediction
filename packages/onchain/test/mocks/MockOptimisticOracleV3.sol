// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IOptimisticOracleV3} from "../../src/interfaces/IOptimisticOracleV3.sol";

contract MockOptimisticOracleV3 is IOptimisticOracleV3 {
    mapping(bytes32 => Assertion) internal assertions;
    mapping(bytes32 => bool) internal settledTruth;

    function assertTruth(
        bytes calldata,
        address asserter,
        address callbackRecipient,
        address,
        uint64,
        address,
        uint256,
        bytes32,
        bytes32
    ) external returns (bytes32 assertionId) {
        assertionId = keccak256(abi.encode(msg.sender, asserter, callbackRecipient, block.number, block.timestamp));
        assertions[assertionId] = Assertion({
            state: AssertionState.Asserted,
            asserter: asserter,
            callbackRecipient: callbackRecipient,
            assertionTime: uint64(block.timestamp),
            settled: false,
            truthfullyAsserted: false
        });
    }

    function setTruth(bytes32 assertionId, bool truth) external {
        settledTruth[assertionId] = truth;
    }

    function settleAssertion(bytes32 assertionId) external returns (bool truthfullyAsserted) {
        Assertion storage a = assertions[assertionId];
        require(a.state == AssertionState.Asserted || a.state == AssertionState.Disputed, "bad-state");
        a.state = AssertionState.Settled;
        a.settled = true;
        truthfullyAsserted = settledTruth[assertionId];
        a.truthfullyAsserted = truthfullyAsserted;
    }

    function getAssertion(bytes32 assertionId) external view returns (Assertion memory) {
        return assertions[assertionId];
    }
}

