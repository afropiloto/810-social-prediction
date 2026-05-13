// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PredictionMarket {
    struct Market {
        string question;
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        bool outcome;
        address creator;
    }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => uint256)) public yesShares;
    mapping(uint256 => mapping(address => uint256)) public noShares;
    uint256 public marketCount;

    event MarketCreated(uint256 indexed marketId, string question, address creator);
    event SharesBought(uint256 indexed marketId, address buyer, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address user, uint256 amount);

    function createMarket(string memory _question) external payable {
        require(msg.value > 0, "Initial liquidity required");
        uint256 half = msg.value / 2;
        
        marketCount++;
        markets[marketCount] = Market({
            question: _question,
            yesPool: half,
            noPool: msg.value - half,
            resolved: false,
            outcome: false,
            creator: msg.sender
        });

        emit MarketCreated(marketCount, _question, msg.sender);
    }

    function buyShares(uint256 _marketId, bool _isYes) external payable {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market already resolved");
        require(msg.value > 0, "Must send ETH");

        uint256 sharesToMint;
        if (_isYes) {
            sharesToMint = (msg.value * (market.yesPool + market.noPool)) / market.yesPool;
            market.yesPool += msg.value;
            yesShares[_marketId][msg.sender] += sharesToMint;
        } else {
            sharesToMint = (msg.value * (market.yesPool + market.noPool)) / market.noPool;
            market.noPool += msg.value;
            noShares[_marketId][msg.sender] += sharesToMint;
        }

        emit SharesBought(_marketId, msg.sender, _isYes, msg.value);
    }

    function resolveMarket(uint256 _marketId, bool _outcome) external {
        Market storage market = markets[_marketId];
        require(msg.sender == market.creator, "Only creator can resolve");
        require(!market.resolved, "Already resolved");

        market.resolved = true;
        market.outcome = _outcome;

        emit MarketResolved(_marketId, _outcome);
    }

    function claimWinnings(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");

        uint256 userShares;
        uint256 totalWinningShares;
        uint256 totalPool = market.yesPool + market.noPool;

        if (market.outcome) {
            userShares = yesShares[_marketId][msg.sender];
            totalWinningShares = market.yesPool; // Simplified for CPMM
            yesShares[_marketId][msg.sender] = 0;
        } else {
            userShares = noShares[_marketId][msg.sender];
            totalWinningShares = market.noPool; // Simplified for CPMM
            noShares[_marketId][msg.sender] = 0;
        }

        require(userShares > 0, "No winning shares");

        uint256 payout = (userShares * totalPool) / totalWinningShares;
        payable(msg.sender).transfer(payout);

        emit WinningsClaimed(_marketId, msg.sender, payout);
    }
}
