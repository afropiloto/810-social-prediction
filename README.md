# 810 — monorepo (evaluation / beta)

Single repo so tools (e.g. Claude Code) can see the full surface area.

## Layout

| Path | Description |
|------|-------------|
| `apps/demo-lite/` | User app + Express API (Vite, Privy, Firestore, trade/admin routes). |
| `apps/admin-v3/` | Admin UI (Vite + Privy), calls demo-lite API. |
| `packages/onchain/` | Foundry workspace (escrow + binary market contracts, tests). |

## Copy notes

- **Excluded from copy:** `node_modules/`, `dist/`, `.next/`, `out/`, `cache/`, nested `.git/`, and other heavy/derived dirs.
- After clone, run **`npm ci`** in each `apps/*` and **`forge install`** / **`forge build`** in `packages/onchain` as needed.

## Product direction (short)

- **810 prediction markets** for social attention outcomes.
- **Testnet first** on HyperEVM; **PM-AMM** path until HIP-4 stake is viable; avoid claiming native CLOB where it is not implemented.

## Remote

Push target: `origin` → GitHub `810-social-prediction` (see `git remote -v`).
