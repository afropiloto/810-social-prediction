# 810 — social attention prediction markets

Phase path: **PM-AMM on HyperEVM (testnet → mainnet)** until HIP-4 stake is available; then optional native CLOB (HIP-4).

## Why this repo

- Single place for contracts + API + deployment notes.
- Default branch: `main`.

## Stack (recommended for this phase)

| Layer | Choice |
|--------|--------|
| Contracts | **Foundry**, Solidity 0.8.x, OpenZeppelin |
| Chain | **HyperEVM** (testnet first), `chainId` per official docs |
| Liquidity | **PM-AMM (LMSR or CFMM)** on-chain; no external CLOB MVP |
| Oracle | **UMA OOv3** on the same EVM where you deploy (confirm deployment) |
| API | **Node.js** (TypeScript), Cloud Run |
| Index | Start **Firestore** or **Postgres** — Postgres when you need SQL analytics + strict joins; Firestore is fine for first beta |
| HL | **API signing** for hedges / inventory later; not required for pure PM-AMM beta |

## Do not build an external CLOB for MVP

An external CLOB adds: matching engine ops, trust model, latency, MM capital, and duplicate book state vs HIP-4 later. **PM-AMM until HIP-4** is the practical path.

## Next steps

1. Deploy PM-AMM + market factory + oracle adapter to **HyperEVM testnet**.
2. Wire existing frontend to this API (no UI rewrite).
3. Add HL execution only when needed (hedge or post-HIP-4).
