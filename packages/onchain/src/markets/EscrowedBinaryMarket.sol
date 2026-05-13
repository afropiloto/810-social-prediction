// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20Minimal} from "../interfaces/IERC20Minimal.sol";
import {IOptimisticOracleV3} from "../interfaces/IOptimisticOracleV3.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @notice Escrowed binary prediction market that resolves via UMA OO-style assertion.
/// @dev This is a minimal, auditable core. Order-matching (Hyperliquid CLOB) can live off-chain,
///      with net settlement and payouts enforced on-chain via escrow + oracle resolution.
contract EscrowedBinaryMarket {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct Market {
        // Metadata
        string question;
        uint64 closeTime;
        address creator;

        // Collateral
        IERC20Minimal collateral;

        // State
        bool resolved;
        bool outcomeYes;

        // Oracle
        bytes32 assertionId;
    }

    error NotCreator();
    error MarketClosed();
    error MarketNotClosed();
    error AlreadyResolved();
    error NotResolved();
    error InvalidAmount();
    error TransferFailed();
    error BadOracleSignature();
    error OracleResolutionReplayed();
    error OracleNotSet();

    event MarketCreated(uint256 indexed marketId, address indexed creator, address collateral, uint64 closeTime, string question);
    event PositionOpened(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount);
    event MarketAssertionRequested(uint256 indexed marketId, bytes32 assertionId);
    event MarketResolved(uint256 indexed marketId, bool outcomeYes);
    event MarketResolvedByOracle(uint256 indexed marketId, address indexed oracleSigner, bool outcomeYes, bytes32 resolutionHash);
    event Claimed(uint256 indexed marketId, address indexed user, uint256 payout);

    uint256 public marketCount;
    mapping(uint256 => Market) public markets;

    // Escrowed user collateral per side.
    mapping(uint256 => mapping(address => uint256)) public yesEscrow;
    mapping(uint256 => mapping(address => uint256)) public noEscrow;

    // Market totals per side.
    mapping(uint256 => uint256) public yesTotal;
    mapping(uint256 => uint256) public noTotal;

    IOptimisticOracleV3 public immutable oo;
    bytes32 public immutable identifier;
    bytes32 public immutable domainId;

    /// @notice Optional oracle signer for chains where UMA OO isn't deployed.
    /// @dev This is the "wallet you created and funded": it signs outcomes for HyperEVM.
    address public immutable oracleSigner;

    mapping(bytes32 => bool) public usedResolutionHashes;

    constructor(IOptimisticOracleV3 _oo, bytes32 _identifier, bytes32 _domainId, address _oracleSigner) {
        oo = _oo;
        identifier = _identifier;
        domainId = _domainId;
        oracleSigner = _oracleSigner;
    }

    function createMarket(string calldata question, uint64 closeTime, IERC20Minimal collateral) external returns (uint256 marketId) {
        if (closeTime <= block.timestamp) revert MarketClosed();

        marketId = ++marketCount;
        markets[marketId] = Market({
            question: question,
            closeTime: closeTime,
            creator: msg.sender,
            collateral: collateral,
            resolved: false,
            outcomeYes: false,
            assertionId: bytes32(0)
        });

        emit MarketCreated(marketId, msg.sender, address(collateral), closeTime, question);
    }

    function openPosition(uint256 marketId, bool isYes, uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        Market storage m = markets[marketId];
        if (block.timestamp >= m.closeTime) revert MarketClosed();
        if (m.resolved) revert AlreadyResolved();

        if (!m.collateral.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();

        if (isYes) {
            yesEscrow[marketId][msg.sender] += amount;
            yesTotal[marketId] += amount;
        } else {
            noEscrow[marketId][msg.sender] += amount;
            noTotal[marketId] += amount;
        }

        emit PositionOpened(marketId, msg.sender, isYes, amount);
    }

    /// @notice Requests resolution via UMA optimistic oracle (assertion).
    /// @dev For production: require a bond, allow dispute, set callbackRecipient for auto-settlement, etc.
    function requestResolutionUMA(
        uint256 marketId,
        bytes calldata claimData,
        uint64 liveness,
        address currency,
        uint256 bond,
        address escalationManager,
        address callbackRecipient
    ) external returns (bytes32 assertionId) {
        Market storage m = markets[marketId];
        if (block.timestamp < m.closeTime) revert MarketNotClosed();
        if (m.resolved) revert AlreadyResolved();
        if (msg.sender != m.creator) revert NotCreator();
        if (m.assertionId != bytes32(0)) return m.assertionId;

        assertionId = oo.assertTruth(
            claimData,
            msg.sender,
            callbackRecipient,
            escalationManager,
            liveness,
            currency,
            bond,
            identifier,
            domainId
        );

        m.assertionId = assertionId;
        emit MarketAssertionRequested(marketId, assertionId);
    }

    function settleAndResolve(uint256 marketId) external returns (bool outcomeYes) {
        Market storage m = markets[marketId];
        if (m.resolved) revert AlreadyResolved();
        if (m.assertionId == bytes32(0)) revert NotResolved();

        bool truth = oo.settleAssertion(m.assertionId);

        m.resolved = true;
        m.outcomeYes = truth;

        emit MarketResolved(marketId, truth);
        return truth;
    }

    /// @notice Resolve using an off-chain oracle signature (MVP path for HyperEVM).
    /// @dev The signed message commits to (this contract, chainId, marketId, outcomeYes, closeTime).
    function resolveByOracleSignature(uint256 marketId, bool outcomeYes, bytes calldata signature) external returns (bytes32 resolutionHash) {
        Market storage m = markets[marketId];
        if (m.resolved) revert AlreadyResolved();
        if (block.timestamp < m.closeTime) revert MarketNotClosed();
        if (oracleSigner == address(0)) revert OracleNotSet();

        resolutionHash = keccak256(
            abi.encodePacked(
                "810:RESOLVE:",
                block.chainid,
                address(this),
                marketId,
                outcomeYes,
                m.closeTime
            )
        );

        if (usedResolutionHashes[resolutionHash]) revert OracleResolutionReplayed();
        usedResolutionHashes[resolutionHash] = true;

        address recovered = resolutionHash.toEthSignedMessageHash().recover(signature);
        if (recovered != oracleSigner) revert BadOracleSignature();

        m.resolved = true;
        m.outcomeYes = outcomeYes;

        emit MarketResolved(marketId, outcomeYes);
        emit MarketResolvedByOracle(marketId, oracleSigner, outcomeYes, resolutionHash);
    }

    function claim(uint256 marketId) external returns (uint256 payout) {
        Market storage m = markets[marketId];
        if (!m.resolved) revert NotResolved();

        uint256 yes = yesTotal[marketId];
        uint256 no = noTotal[marketId];
        uint256 total = yes + no;

        if (total == 0) return 0;

        uint256 userStake;
        uint256 winnerTotal;

        if (m.outcomeYes) {
            userStake = yesEscrow[marketId][msg.sender];
            winnerTotal = yes;
            yesEscrow[marketId][msg.sender] = 0;
        } else {
            userStake = noEscrow[marketId][msg.sender];
            winnerTotal = no;
            noEscrow[marketId][msg.sender] = 0;
        }

        if (userStake == 0) return 0;

        payout = (userStake * total) / winnerTotal;
        if (!m.collateral.transfer(msg.sender, payout)) revert TransferFailed();

        emit Claimed(marketId, msg.sender, payout);
    }
}

