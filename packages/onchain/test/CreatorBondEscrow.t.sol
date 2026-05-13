// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {CreatorBondEscrow} from "../src/escrow/CreatorBondEscrow.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract CreatorBondEscrowTest is Test {
    ERC20Mock usdt;
    CreatorBondEscrow escrow;

    address owner = address(0xBEEF);
    address slashRecipient = address(0xB0BA);
    address creator = address(0xC0FFEE);

    function setUp() external {
        usdt = new ERC20Mock();
        escrow = new CreatorBondEscrow(86400, slashRecipient, owner);

        usdt.mint(creator, 10_000e6);
        vm.prank(creator);
        usdt.approve(address(escrow), type(uint256).max);
    }

    function test_postBond_refundAfterWindow() external {
        bytes32 marketId = keccak256("m1");
        uint64 closeTime = uint64(block.timestamp + 1 days);

        vm.prank(creator);
        escrow.postBond(marketId, usdt, 500e6, closeTime);

        // cannot refund before maturity
        vm.prank(creator);
        vm.expectRevert(CreatorBondEscrow.NotMatured.selector);
        escrow.refund(marketId);

        // after close + 24h
        vm.warp(uint256(closeTime) + 86400);
        uint256 beforeBal = usdt.balanceOf(creator);
        vm.prank(creator);
        escrow.refund(marketId);
        uint256 afterBal = usdt.balanceOf(creator);

        assertEq(afterBal - beforeBal, 500e6);
    }

    function test_onlyOwnerCanSlash_afterWindow() external {
        bytes32 marketId = keccak256("m2");
        uint64 closeTime = uint64(block.timestamp + 1 days);

        vm.prank(creator);
        escrow.postBond(marketId, usdt, 1_000e6, closeTime);

        vm.warp(uint256(closeTime) + 86400);

        vm.prank(creator);
        vm.expectRevert();
        escrow.slash(marketId);

        uint256 before = usdt.balanceOf(slashRecipient);
        vm.prank(owner);
        escrow.slash(marketId);
        uint256 afterBal = usdt.balanceOf(slashRecipient);
        assertEq(afterBal - before, 1_000e6);
    }

    function test_cannotPostTwice() external {
        bytes32 marketId = keccak256("m3");
        uint64 closeTime = uint64(block.timestamp + 1 days);

        vm.prank(creator);
        escrow.postBond(marketId, usdt, 500e6, closeTime);

        vm.prank(creator);
        vm.expectRevert(CreatorBondEscrow.AlreadyPosted.selector);
        escrow.postBond(marketId, usdt, 500e6, closeTime);
    }
}

