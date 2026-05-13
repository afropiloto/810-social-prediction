// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Minimal ERC20 escrow for creator bonds keyed by an off-chain market id.
/// @dev `marketId` is bytes32 so the backend can hash Firestore doc ids:
///      marketId = keccak256(bytes(firestoreMarketDocId)).
contract CreatorBondEscrow is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error AlreadyPosted();
    error NotCreator();
    error NotMatured();
    error AlreadySlashed();
    error NoBond();
    error InvalidAmount();
    error InvalidTimes();

    struct Bond {
        address creator;
        IERC20 currency;
        uint256 amount;
        uint64 closeTime;
        uint64 payoutAvailableAt; // closeTime + dispute window (e.g. 24h)
        bool slashed;
        bool refunded;
    }

    /// @notice dispute window (seconds). Default 86400 (24h).
    uint64 public immutable disputeWindow;
    /// @notice destination for slashed funds (buffer pool / protocol treasury).
    address public slashRecipient;

    mapping(bytes32 => Bond) public bonds;

    event BondPosted(bytes32 indexed marketId, address indexed creator, address indexed currency, uint256 amount, uint64 closeTime, uint64 payoutAvailableAt);
    event BondRefunded(bytes32 indexed marketId, address indexed creator, uint256 amount);
    event BondSlashed(bytes32 indexed marketId, address indexed recipient, uint256 amount);
    event SlashRecipientUpdated(address indexed recipient);
    event Paused();
    event Unpaused();

    constructor(uint64 _disputeWindow, address _slashRecipient, address _owner) Ownable(_owner) {
        disputeWindow = _disputeWindow == 0 ? 86400 : _disputeWindow;
        slashRecipient = _slashRecipient;
    }

    function setSlashRecipient(address recipient) external onlyOwner {
        slashRecipient = recipient;
        emit SlashRecipientUpdated(recipient);
    }

    function pause() external onlyOwner {
        _pause();
        emit Paused();
    }

    function unpause() external onlyOwner {
        _unpause();
        emit Unpaused();
    }

    /// @notice Post a creator bond for an off-chain market.
    /// @param marketId keccak256(bytes(offchainMarketId))
    /// @param currency ERC20 collateral (USDT/USDC)
    /// @param amount bond amount in token units
    /// @param closeTime when market stops accepting trades (unix seconds)
    function postBond(bytes32 marketId, IERC20 currency, uint256 amount, uint64 closeTime) external whenNotPaused nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (closeTime <= block.timestamp) revert InvalidTimes();

        Bond storage b = bonds[marketId];
        if (b.creator != address(0)) revert AlreadyPosted();

        uint64 payoutAt = closeTime + disputeWindow;
        bonds[marketId] = Bond({
            creator: msg.sender,
            currency: currency,
            amount: amount,
            closeTime: closeTime,
            payoutAvailableAt: payoutAt,
            slashed: false,
            refunded: false
        });

        currency.safeTransferFrom(msg.sender, address(this), amount);

        emit BondPosted(marketId, msg.sender, address(currency), amount, closeTime, payoutAt);
    }

    /// @notice Refund bond to creator after dispute window.
    function refund(bytes32 marketId) external whenNotPaused nonReentrant {
        Bond storage b = bonds[marketId];
        if (b.creator == address(0)) revert NoBond();
        if (msg.sender != b.creator) revert NotCreator();
        if (b.slashed) revert AlreadySlashed();
        if (b.refunded) revert NoBond();
        if (block.timestamp < b.payoutAvailableAt) revert NotMatured();

        b.refunded = true;
        b.currency.safeTransfer(b.creator, b.amount);
        emit BondRefunded(marketId, b.creator, b.amount);
    }

    /// @notice Slash the bond to `slashRecipient` after dispute window.
    /// @dev Owner-only (protocol admin / court multisig). For MVP, dispute outcome is off-chain.
    function slash(bytes32 marketId) external onlyOwner whenNotPaused nonReentrant {
        Bond storage b = bonds[marketId];
        if (b.creator == address(0)) revert NoBond();
        if (b.slashed) revert AlreadySlashed();
        if (b.refunded) revert NoBond();
        if (block.timestamp < b.payoutAvailableAt) revert NotMatured();

        b.slashed = true;
        address recipient = slashRecipient == address(0) ? owner() : slashRecipient;
        b.currency.safeTransfer(recipient, b.amount);
        emit BondSlashed(marketId, recipient, b.amount);
    }
}

