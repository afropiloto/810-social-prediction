// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {EscrowedBinaryMarket} from "../src/markets/EscrowedBinaryMarket.sol";
import {MockOptimisticOracleV3} from "./mocks/MockOptimisticOracleV3.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract EscrowedBinaryMarketTest is Test {
    MockOptimisticOracleV3 oo;
    MockERC20 usdc;
    EscrowedBinaryMarket market;

    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    address creator = address(0xC0FFEE);
    uint256 oraclePk;
    address oracleSigner;

    function setUp() external {
        oo = new MockOptimisticOracleV3();
        usdc = new MockERC20("USD Coin", "USDC", 6);

        oraclePk = 0xA0A0A0;
        oracleSigner = vm.addr(oraclePk);
        market = new EscrowedBinaryMarket(oo, bytes32("ASSERT_TRUTH"), bytes32(0), oracleSigner);

        usdc.mint(alice, 1_000_000e6);
        usdc.mint(bob, 1_000_000e6);

        vm.prank(alice);
        usdc.approve(address(market), type(uint256).max);
        vm.prank(bob);
        usdc.approve(address(market), type(uint256).max);
    }

    function test_resolveYes_paysYesSide() external {
        vm.prank(creator);
        uint256 id = market.createMarket("Will X happen?", uint64(block.timestamp + 1 days), usdc);

        vm.prank(alice);
        market.openPosition(id, true, 100e6);

        vm.prank(bob);
        market.openPosition(id, false, 300e6);

        vm.warp(block.timestamp + 2 days);

        vm.prank(creator);
        bytes32 assertionId = market.requestResolutionUMA(
            id,
            bytes("YES"),
            60,
            address(usdc),
            0,
            address(0),
            address(0)
        );

        oo.setTruth(assertionId, true);
        market.settleAndResolve(id);

        uint256 aliceBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        uint256 payout = market.claim(id);
        uint256 aliceAfter = usdc.balanceOf(alice);

        assertEq(payout, 400e6);
        assertEq(aliceAfter - aliceBefore, 400e6);
    }

    function test_resolveNo_paysNoSide() external {
        vm.prank(creator);
        uint256 id = market.createMarket("Will Y happen?", uint64(block.timestamp + 1 days), usdc);

        vm.prank(alice);
        market.openPosition(id, true, 200e6);

        vm.prank(bob);
        market.openPosition(id, false, 500e6);

        vm.warp(block.timestamp + 2 days);

        vm.prank(creator);
        bytes32 assertionId = market.requestResolutionUMA(
            id,
            bytes("NO"),
            60,
            address(usdc),
            0,
            address(0),
            address(0)
        );

        oo.setTruth(assertionId, false);
        market.settleAndResolve(id);

        uint256 bobBefore = usdc.balanceOf(bob);
        vm.prank(bob);
        uint256 payout = market.claim(id);
        uint256 bobAfter = usdc.balanceOf(bob);

        assertEq(payout, 700e6);
        assertEq(bobAfter - bobBefore, 700e6);
    }

    function test_oracleSignatureResolution_worksAndCannotReplay() external {
        vm.prank(creator);
        uint256 id = market.createMarket("Will Z happen?", uint64(block.timestamp + 1 days), usdc);

        vm.prank(alice);
        market.openPosition(id, true, 100e6);
        vm.prank(bob);
        market.openPosition(id, false, 100e6);

        vm.warp(block.timestamp + 2 days);

        // Pull stored closeTime out of the Market struct getter.
        (, uint64 closeTime,, , , ,) = market.markets(id);
        bytes32 resolutionHash = keccak256(abi.encodePacked("810:RESOLVE:", block.chainid, address(market), id, true, closeTime));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(oraclePk, keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", resolutionHash)));
        bytes memory sig = abi.encodePacked(r, s, v);

        market.resolveByOracleSignature(id, true, sig);

        vm.expectRevert();
        market.resolveByOracleSignature(id, true, sig);
    }
}

