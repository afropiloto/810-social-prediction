<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 810-admin-v3 (Admin UI)

Thin admin UI for:
- Creating markets
- Pausing markets
- Triggering UMA assertion preparation
- Viewing system status (`/api/status`)

## Live (Cloud Run)

- Admin UI: `https://banco-admin-v3-422728451591.us-central1.run.app`

This UI calls the backend at:
- Backend API: `https://banco-demo-lite-422728451591.us-central1.run.app`

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set env vars:

   - `VITE_PRIVY_APP_ID` (client)
   - `VITE_DEMO_LITE_API_BASE_URL` (e.g. `http://localhost:3000` or the Cloud Run backend URL)

3. Run:
   `npm run dev`

## Notes

- Admin auth is enforced by the backend via `ADMIN_WALLETS` allowlist (Privy bearer token).
