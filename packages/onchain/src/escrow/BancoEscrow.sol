// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Escrow & settlement rail for Hyperliquid CLOB fills.
/// @dev Backend relayer (owner) calls `processSettlement` for confirmed off-chain fills.
contract BancoEscrow is Initializable, OwnableUpgradeable, PausableUpgradeable {
    using SafeERC20 for IERC20;

    IERC20 public usdc;
    mapping(bytes32 => bool) public processedFills;

    event Deposit(address indexed user, uint256 amount);
    event SettlementProcessed(bytes32 indexed fillId, address indexed user, uint256 amount);

    function initialize(address _usdc, address _owner) public initializer {
        __Ownable_init(_owner);
        __Pausable_init();
        usdc = IERC20(_usdc);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Users deposit collateral into escrow (used by your matching engine / CLOB).
    function deposit(uint256 amount) external whenNotPaused {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount);
    }

    /// @notice Settlement function: called by backend after matching off-chain.
    function processSettlement(bytes32 fillId, address user, uint256 amount) external onlyOwner whenNotPaused {
        require(!processedFills[fillId], "Fill already processed");
        processedFills[fillId] = true;
        usdc.safeTransfer(user, amount);
        emit SettlementProcessed(fillId, user, amount);
    }
}

