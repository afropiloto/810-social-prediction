// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BancoEscrow} from "../src/escrow/BancoEscrow.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract BancoEscrowTest is Test {
    ERC20Mock usdc;
    BancoEscrow escrow;

    address owner = address(0xBEEF);
    address alice = address(0xA11CE);

    function setUp() external {
        usdc = new ERC20Mock();
        escrow = new BancoEscrow();
        escrow.initialize(address(usdc), owner);

        usdc.mint(alice, 1_000_000e6);
        vm.prank(alice);
        usdc.approve(address(escrow), type(uint256).max);
    }

    function test_deposit_movesFundsIntoEscrow() external {
        uint256 amount = 123e6;
        uint256 beforeBal = usdc.balanceOf(address(escrow));

        vm.prank(alice);
        escrow.deposit(amount);

        assertEq(usdc.balanceOf(address(escrow)) - beforeBal, amount);
    }

    function test_onlyOwner_canProcessSettlement_andFillIdCannotReplay() external {
        // Seed escrow balance (so it can pay out)
        vm.prank(alice);
        escrow.deposit(500e6);

        bytes32 fillId = keccak256("fill-1");

        // Non-owner cannot settle
        vm.prank(alice);
        vm.expectRevert();
        escrow.processSettlement(fillId, alice, 100e6);

        // Owner settles once
        uint256 aliceBefore = usdc.balanceOf(alice);
        vm.prank(owner);
        escrow.processSettlement(fillId, alice, 100e6);
        uint256 aliceAfter = usdc.balanceOf(alice);
        assertEq(aliceAfter - aliceBefore, 100e6);

        // Replay should revert
        vm.prank(owner);
        vm.expectRevert(bytes("Fill already processed"));
        escrow.processSettlement(fillId, alice, 1);
    }
}

