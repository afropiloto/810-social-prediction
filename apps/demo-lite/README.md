<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 810-demo-lite (User app + API)

This is the **beta user app** (Vite + React) and **backend API** (Express + Firestore + Privy admin auth).

## Live (Cloud Run)

- User app + API: `https://banco-demo-lite-422728451591.us-central1.run.app`
- Health: `GET /api/health`
- Status: `GET /api/status`

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a local env file (example keys):

   - `PRIVY_APP_ID`
   - `PRIVY_APP_SECRET`
   - `ADMIN_WALLETS` (comma-separated `0x...` addresses allowed to create/pause/assert)
   - Optional: `GEMINI_API_KEY`

3. Run the app:
   `npm run dev`

## Admin (Privy wallet allowlist)

Set these environment variables:

- `PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `ADMIN_WALLETS` (comma-separated `0x...` addresses allowed to create/pause/assert)

**Production safety:** `ADMIN_WALLETS` must be set in production (admin routes are blocked otherwise).

### Admin endpoints

- `POST /api/admin/markets`
- `POST /api/admin/markets/:id/pause`
- `POST /api/admin/markets/:id/uma/assert` (returns calldata + args for UMA OOv3 assertion on Optimism)
- `GET /api/admin/uma/:assertionId` (reads assertion status from Optimism)

## Beta rules (current)

- **Hard close**: markets stop accepting trades at `closeTime` (server-enforced).
- **24h dispute window**: payouts/claims are held until `closeTime + 24h` (UMA liveness alignment).

## Fee structure (bps of notional)

Total `TRADE_FEE_BPS=200` (2.00%), split into:

- `PROTOCOL_FEE_BPS=100`
- `CREATOR_FEE_BPS=60`
- `CLOB_MM_FEE_BPS=20`
- `AFFILIATE_FEE_BPS=10`
- `BUFFER_POOL_FEE_BPS=10`

## Ops status endpoint

`GET /api/status` returns JSON with:
- Fee config
- Firestore connectivity check
- Optimism RPC reachability (block number)
- Execution mode + payout delay

