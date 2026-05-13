// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Minimal interface for UMA Optimistic Oracle V3-style assertions.
/// @dev Chain deployments vary; treat this as an adapter target and keep address configurable.
interface IOptimisticOracleV3 {
    enum AssertionState {
        Uninitialized,
        Asserted,
        Disputed,
        Settled
    }

    struct Assertion {
        AssertionState state;
        address asserter;
        address callbackRecipient;
        uint64 assertionTime;
        bool settled;
        bool truthfullyAsserted;
    }

    /// @notice Make an assertion that can later be disputed/settled.
    /// @param claim Encoded claim string/bytes (project-specific).
    /// @param asserter Entity responsible for the assertion.
    /// @param callbackRecipient Callback target (optional).
    /// @param escalationManager Escalation manager (optional).
    /// @param liveness Time window for disputes.
    /// @param currency Bond currency address.
    /// @param bond Bond amount.
    /// @param identifier UMA identifier (e.g. "ASSERT_TRUTH").
    /// @param domainId Domain id for cross-chain setups (optional).
    function assertTruth(
        bytes calldata claim,
        address asserter,
        address callbackRecipient,
        address escalationManager,
        uint64 liveness,
        address currency,
        uint256 bond,
        bytes32 identifier,
        bytes32 domainId
    ) external returns (bytes32 assertionId);

    function settleAssertion(bytes32 assertionId) external returns (bool truthfullyAsserted);

    function getAssertion(bytes32 assertionId) external view returns (Assertion memory);
}

