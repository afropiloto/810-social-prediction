import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import { PrivyClient } from "@privy-io/server-auth";
import { createPublicClient, http, parseAbi } from "viem";
import { optimism } from "viem/chains";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));

let adminApp;
try {
  adminApp = initializeApp({
    projectId: firebaseConfig.projectId
  });
  console.log("Firebase Admin initialized");
} catch (e) {
  console.error("Firebase Admin failed to initialize", e);
}

const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" }); // Added fallback to prevent crash

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID || "",
  process.env.PRIVY_APP_SECRET || ""
);

const ADMIN_ALLOWLIST = new Set(
  (process.env.ADMIN_WALLETS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

function assertAdminAllowlistConfigured() {
  // If you haven't configured an allowlist yet, only permit admin routes in dev.
  if (ADMIN_ALLOWLIST.size === 0 && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_WALLETS must be set in production");
  }
}

const UMA_OOV3_OPTIMISM = (process.env.UMA_OOV3_OPTIMISM ||
  "0x072819Bb43B50E7A251c64411e7aA362ce82803B") as `0x${string}`;

const optimismClient = createPublicClient({
  chain: optimism,
  transport: http(process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io"),
});

const ooV3Abi = parseAbi([
  "function assertTruth(bytes claim,address asserter,address callbackRecipient,address escalationManager,uint64 liveness,address currency,uint256 bond,bytes32 identifier,bytes32 domainId) external returns (bytes32 assertionId)",
  "function getAssertion(bytes32 assertionId) external view returns (uint8 state,address asserter,address callbackRecipient,uint64 assertionTime,bool settled,bool truthfullyAsserted)",
]);

async function requireAdmin(req: express.Request) {
  assertAdminAllowlistConfigured();
  const auth = req.headers.authorization;
  if (!auth?.toLowerCase().startsWith("bearer ")) {
    throw new Error("Missing bearer token");
  }
  const token = auth.slice("bearer ".length);
  const { userId } = await privy.verifyAuthToken(token);
  const user = await privy.getUser(userId);
  const walletAcct = user.linkedAccounts?.find((a: any) => a.type === "wallet");
  const wallet = String((walletAcct as any)?.address || "").toLowerCase();
  if (!wallet) throw new Error("No wallet on session");
  if (!ADMIN_ALLOWLIST.has(wallet)) throw new Error("Wallet not allowed");
  return { wallet, userId };
}

async function optionalTrader(req: express.Request) {
  const auth = req.headers.authorization;
  if (auth?.toLowerCase().startsWith("bearer ")) {
    try {
      const token = auth.slice("bearer ".length);
      const { userId } = await privy.verifyAuthToken(token);
      const user = await privy.getUser(userId);
      const walletAcct = user.linkedAccounts?.find((a: any) => a.type === "wallet");
      const wallet = String((walletAcct as any)?.address || "").toLowerCase();
      if (wallet) return { kind: "wallet" as const, id: wallet, userId };
      return { kind: "privy" as const, id: userId, userId };
    } catch {
      // fall through to guest
    }
  }
  const guestId = String(req.headers["x-guest-id"] || "").trim();
  return { kind: "guest" as const, id: guestId || "guest_unknown" };
}

function getReferralCode(req: express.Request) {
  const header = String(req.headers["x-ref"] || "").trim();
  const q = String((req.query?.ref as any) || "").trim();
  const code = (header || q).toLowerCase();
  return code || null;
}

function feeConfig() {
  // All values are in bps of *notional* (amount), not bps-of-fee.
  const tradeFeeBps = Number(process.env.TRADE_FEE_BPS ?? 200); // 2.00% total
  const protocolBps = Number(process.env.PROTOCOL_FEE_BPS ?? 100);
  const creatorBps = Number(process.env.CREATOR_FEE_BPS ?? 60);
  const clobMmBaseBps = Number(process.env.CLOB_MM_FEE_BPS ?? 20);
  const affiliateBps = Number(process.env.AFFILIATE_FEE_BPS ?? 10);
  const bufferBps = Number(process.env.BUFFER_POOL_FEE_BPS ?? 10);
  const liquidityMode = String(process.env.LIQUIDITY_MODE || "clob").toLowerCase();
  const clobMmBps = liquidityMode === "clob" || liquidityMode === "pm-amm" ? clobMmBaseBps : 0;

  const sum = protocolBps + creatorBps + clobMmBps + affiliateBps + bufferBps;
  if (sum !== tradeFeeBps) {
    // Keep the system safe: allow overrides, but never under/over charge silently.
    throw new Error(`Fee bps mismatch: TRADE_FEE_BPS=${tradeFeeBps} but components sum to ${sum}`);
  }

  return { tradeFeeBps, protocolBps, creatorBps, clobMmBps, affiliateBps, bufferBps, liquidityMode };
}

function nowIso() {
  return new Date().toISOString();
}

function parseCloseTime(deadline: any) {
  // Accept ISO string, epoch ms, or shorthand like "24h", "7d".
  if (!deadline) return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  if (typeof deadline === "number" && Number.isFinite(deadline)) return new Date(deadline).toISOString();
  if (typeof deadline === "string") {
    const s = deadline.trim();
    // ISO or parseable date string
    const t = Date.parse(s);
    if (!Number.isNaN(t)) return new Date(t).toISOString();
    // Shorthand
    const m = s.toLowerCase().match(/^(\d+)\s*([hd])$/);
    if (m) {
      const n = Number(m[1]);
      const unit = m[2];
      const ms = unit === "h" ? n * 60 * 60 * 1000 : n * 24 * 60 * 60 * 1000;
      return new Date(Date.now() + ms).toISOString();
    }
  }
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function payoutDelayMs() {
  const configured = Number(process.env.PAYOUT_DELAY_SEC || 172800);
  const minSec = Number(process.env.PAYOUT_DELAY_MIN_SEC || 86400);
  const maxSec = Number(process.env.PAYOUT_DELAY_MAX_SEC || 259200);
  const normalized = Number.isFinite(configured) ? configured : 172800;
  const clamped = Math.min(Math.max(normalized, minSec), maxSec);
  return clamped * 1000;
}

function payoutDelayConfigSec() {
  const configured = Number(process.env.PAYOUT_DELAY_SEC || 172800);
  const minSec = Number(process.env.PAYOUT_DELAY_MIN_SEC || 86400);
  const maxSec = Number(process.env.PAYOUT_DELAY_MAX_SEC || 259200);
  const normalized = Number.isFinite(configured) ? configured : 172800;
  const applied = Math.min(Math.max(normalized, minSec), maxSec);
  return { configured, minSec, maxSec, applied };
}

function walletRoleConfig() {
  return {
    adminAllowlistCount: ADMIN_ALLOWLIST.size,
    orderExecutionWallet: String(process.env.HL_OPERATOR_WALLET || "").toLowerCase() || null,
    payoutWallet: String(process.env.PAYOUT_WALLET || "").toLowerCase() || null,
    treasuryWallet: String(process.env.TREASURY_WALLET || "").toLowerCase() || null,
  };
}

function hyperliquidConfig() {
  return {
    enabled: String(process.env.HL_ENABLED || "false").toLowerCase() === "true",
    apiUrl: process.env.HL_API_URL || "https://api.hyperliquid.xyz/info",
    mode: process.env.EXECUTION_MODE || "paper",
  };
}

function computePayoutAvailableAt(closeTimeIso: string) {
  const t = Date.parse(closeTimeIso);
  if (!Number.isFinite(t)) return new Date(Date.now() + payoutDelayMs()).toISOString();
  return new Date(t + payoutDelayMs()).toISOString();
}

async function generateMarketDraft(input: {
  prompt: string;
  platform?: string;
  metric?: string;
  timeframeDays?: number;
  targetUrl?: string;
}) {
  const fallback = {
    question: input.prompt.trim(),
    platform: input.platform || "twitter",
    metric: input.metric || "mentions",
    targetUrl: input.targetUrl || null,
    deadline: `${Math.min(Math.max(Number(input.timeframeDays || 7), 1), 30)}d`,
    rationale: "Fallback draft generated without AI.",
  };
  const aiEnabled = Boolean(process.env.GEMINI_API_KEY);
  if (!aiEnabled) return fallback;

  try {
    const prompt = [
      "Generate ONE social-attention prediction market draft for a testnet MVP.",
      "Return strict JSON with keys:",
      "question, platform, metric, targetUrl, deadline, rationale.",
      `User prompt: ${input.prompt}`,
      `Platform hint: ${input.platform || "twitter"}`,
      `Metric hint: ${input.metric || "mentions"}`,
      `Timeframe days hint: ${String(input.timeframeDays || 7)}`,
      `Target URL hint: ${input.targetUrl || ""}`,
      "Constraints:",
      "- question concise and binary",
      "- deadline format like 7d",
      "- no markdown",
    ].join("\n");
    const model = ai.models.generateContent({
      model: "gemini-1.5-pro",
      config: { responseMimeType: "application/json" },
      contents: prompt,
    });
    const result = await model;
    const parsed = JSON.parse(result.text || "{}");
    return {
      question: String(parsed?.question || fallback.question),
      platform: String(parsed?.platform || fallback.platform),
      metric: String(parsed?.metric || fallback.metric),
      targetUrl: parsed?.targetUrl ? String(parsed.targetUrl) : fallback.targetUrl,
      deadline: String(parsed?.deadline || fallback.deadline),
      rationale: String(parsed?.rationale || "AI-generated draft."),
    };
  } catch {
    return fallback;
  }
}

async function computeAffiliateAvailableAt(code: string) {
  // Best-effort: claims should not become available until the UMA dispute window closes
  // for the *latest* market that contributed referral fees for this affiliate.
  //
  // We infer this by looking at recent referred trades and taking the max market.closeTime.
  // If anything fails (missing index, etc.), we fall back to now + delay (safe but may be stricter than needed).
  const delay = payoutDelayMs();
  try {
    const tradesSnap = await db
      .collectionGroup("trades")
      .where("referralCode", "==", code)
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    let maxCloseMs = 0;
    for (const d of tradesSnap.docs) {
      const t = d.data() as any;
      const marketId = String(t?.marketId || "").trim();
      if (!marketId) continue;
      const mSnap = await db.collection("markets").doc(marketId).get();
      const closeIso = String((mSnap.exists ? (mSnap.data() as any)?.closeTime : "") || "");
      const closeMs = Date.parse(closeIso);
      if (Number.isFinite(closeMs)) maxCloseMs = Math.max(maxCloseMs, closeMs);
    }

    const candidate =
      maxCloseMs > 0 ? maxCloseMs + delay : Date.now() + delay;
    return new Date(Math.max(candidate, Date.now())).toISOString();
  } catch {
    return new Date(Date.now() + delay).toISOString();
  }
}

async function processExecutionQueueTick() {
  const hl = hyperliquidConfig();
  if (hl.mode !== "hyperliquid") return;

  const now = nowIso();
  const heartbeatRef = db.collection("ops").doc("execution-worker");
  await heartbeatRef.set(
    {
      mode: hl.mode,
      hlEnabled: hl.enabled,
      apiUrl: hl.apiUrl,
      lastTickAt: now,
    },
    { merge: true }
  );

  const queued = await db
    .collection("executionQueue")
    .where("status", "==", "queued")
    .orderBy("createdAt", "asc")
    .limit(10)
    .get();

  for (const d of queued.docs) {
    const q = d.data() as any;
    const marketId = String(q?.marketId || "");
    const tradeId = String(q?.tradeId || "");
    const queueRef = db.collection("executionQueue").doc(d.id);
    const tradeRef = marketId && tradeId ? db.collection("markets").doc(marketId).collection("trades").doc(tradeId) : null;
    try {
      await queueRef.set({ status: "processing", pickedAt: nowIso() }, { merge: true });

      if (!hl.enabled) {
        await queueRef.set(
          {
            status: "paper_fallback",
            completedAt: nowIso(),
            note: "HL_ENABLED=false; kept in paper mode.",
          },
          { merge: true }
        );
        if (tradeRef) {
          await tradeRef.set({ execution: { mode: "paper", status: "paper" } }, { merge: true });
        }
        continue;
      }

      let httpStatus: number | null = null;
      let hlOk = false;
      try {
        const resp = await fetch(hl.apiUrl, { method: "GET" });
        httpStatus = resp.status;
        hlOk = resp.ok;
      } catch {
        hlOk = false;
      }

      const finalStatus = hlOk ? "submitted" : "failed_connectivity";
      const externalId = hlOk ? `hl_sim_${d.id}` : null;
      await queueRef.set(
        {
          status: finalStatus,
          completedAt: nowIso(),
          httpStatus,
          externalId,
        },
        { merge: true }
      );
      if (tradeRef) {
        await tradeRef.set(
          {
            execution: {
              mode: "hyperliquid",
              status: hlOk ? "submitted" : "failed_connectivity",
              externalId,
              updatedAt: nowIso(),
            },
          },
          { merge: true }
        );
      }
    } catch (e: any) {
      await queueRef.set(
        {
          status: "failed",
          error: String(e?.message || "unknown"),
          failedAt: nowIso(),
        },
        { merge: true }
      );
      if (tradeRef) {
        await tradeRef.set(
          {
            execution: {
              mode: "hyperliquid",
              status: "failed",
              error: String(e?.message || "unknown"),
              updatedAt: nowIso(),
            },
          },
          { merge: true }
        );
      }
    }
  }
}

function isClosed(m: any) {
  const closeTime = m?.closeTime ? Date.parse(String(m.closeTime)) : NaN;
  return Number.isFinite(closeTime) && Date.now() >= closeTime;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = process.env.PORT || 3000;
  let workerBusy = false;

  // CORS for admin UI + local dev (beta-safe; tighten via CORS_ORIGIN later)
  app.use((req, res, next) => {
    const origin = process.env.CORS_ORIGIN || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type,authorization,x-guest-id,x-ref");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400");
    if (req.method === "OPTIONS") return res.status(204).end();
    next();
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // More detailed connectivity/status for ops dashboards (no secrets returned)
  app.get("/api/status", async (req, res) => {
    const startedAt = nowIso();
    const privyConfigured = Boolean(process.env.PRIVY_APP_ID) && Boolean(process.env.PRIVY_APP_SECRET);
    const firestoreConfigured = Boolean(firebaseConfig?.projectId) && Boolean(firebaseConfig?.firestoreDatabaseId);
    const optimismRpc = process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io";
    const hl = hyperliquidConfig();
    const payoutCfg = payoutDelayConfigSec();
    const fees = feeConfig();
    const walletRoles = walletRoleConfig();

    let firestoreOk = false;
    try {
      await db.collection("_health").limit(1).get();
      firestoreOk = true;
    } catch {
      firestoreOk = false;
    }

    let optimismOk = false;
    try {
      // lightweight eth_call equivalent; getAssertion on a zero id will revert on-chain,
      // so we instead just check we can reach the node with a basic request.
      await optimismClient.getBlockNumber();
      optimismOk = true;
    } catch {
      optimismOk = false;
    }

    let hyperliquidOk = false;
    let hyperliquidHttpStatus: number | null = null;
    try {
      const r = await fetch(hl.apiUrl, { method: "GET" });
      hyperliquidHttpStatus = r.status;
      hyperliquidOk = r.ok;
    } catch {
      hyperliquidOk = false;
    }

    res.json({
      success: true,
      at: startedAt,
      env: {
        executionMode: process.env.EXECUTION_MODE || "paper",
        liquidityMode: fees.liquidityMode,
        payoutDelaySec: payoutCfg.applied,
        payoutDelayRangeSec: {
          min: payoutCfg.minSec,
          max: payoutCfg.maxSec,
          configured: payoutCfg.configured,
        },
      },
      feesBps: {
        trade: fees.tradeFeeBps,
        protocol: fees.protocolBps,
        creator: fees.creatorBps,
        clobMm: fees.clobMmBps,
        affiliate: fees.affiliateBps,
        bufferPool: fees.bufferBps,
      },
      privy: { configured: privyConfigured },
      firestore: { configured: firestoreConfigured, ok: firestoreOk, projectId: firebaseConfig?.projectId },
      optimism: { ok: optimismOk, rpc: optimismRpc, umaOov3: UMA_OOV3_OPTIMISM },
      hyperliquid: {
        ok: hyperliquidOk,
        apiUrl: hl.apiUrl,
        enabled: hl.enabled,
        httpStatus: hyperliquidHttpStatus,
      },
      wallets: walletRoles,
    });
  });

  // Market routes
  app.get("/api/markets", async (req, res) => {
    try {
      const marketsRef = db.collection('markets');
      let query = marketsRef.where('status', '==', 'active').orderBy('totalVolume', 'desc').limit(50);
      
      const lastVisible = req.query.lastVisible;
      if (lastVisible) {
        const lastDoc = await marketsRef.doc(lastVisible as string).get();
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      const markets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(markets);
    } catch (error) {
      console.error(error);
      // MVP: never hard-fail the feed if Firestore is misconfigured.
      res.json([]);
    }
  });

  // Admin: create/pause/resolve markets (Privy wallet allowlist)
  app.post("/api/admin/markets", async (req, res) => {
    try {
      const { wallet } = await requireAdmin(req);
      const { question, platform, metric, targetUrl, deadline, currency = "USDT" } = req.body || {};
      if (!question) return res.status(400).json({ error: "Missing question" });
      const closeTime = parseCloseTime(deadline);

      const doc = await db.collection("markets").add({
        question,
        platform,
        metric,
        targetUrl,
        deadline,
        closeTime,
        payoutAvailableAt: computePayoutAvailableAt(closeTime),
        currency,
        status: "active",
        createdBy: wallet,
        createdAt: nowIso(),
        totalVolume: 0,
      });

      res.json({ success: true, id: doc.id });
    } catch (e: any) {
      res.status(401).json({ error: e?.message || "Unauthorized" });
    }
  });

  // Admin: AI-assisted market draft for fast testnet ops
  app.post("/api/admin/markets/auto-draft", async (req, res) => {
    try {
      await requireAdmin(req);
      const {
        prompt,
        platform = "twitter",
        metric = "mentions",
        timeframeDays = 7,
        targetUrl,
      } = req.body || {};
      if (!prompt || !String(prompt).trim()) {
        return res.status(400).json({ error: "Missing prompt" });
      }
      const draft = await generateMarketDraft({
        prompt: String(prompt),
        platform: String(platform),
        metric: String(metric),
        timeframeDays: Number(timeframeDays),
        targetUrl: targetUrl ? String(targetUrl) : undefined,
      });
      res.json({ success: true, draft });
    } catch (e: any) {
      res.status(401).json({ error: e?.message || "Unauthorized" });
    }
  });

  // Admin: execution queue visibility for ops
  app.get("/api/admin/execution/queue-status", async (req, res) => {
    try {
      await requireAdmin(req);
      const [queuedSnap, processingSnap, failedSnap, submittedSnap, heartbeatSnap] = await Promise.all([
        db.collection("executionQueue").where("status", "==", "queued").limit(1).get(),
        db.collection("executionQueue").where("status", "==", "processing").limit(1).get(),
        db.collection("executionQueue").where("status", "in", ["failed", "failed_connectivity"]).limit(10).get(),
        db.collection("executionQueue").where("status", "==", "submitted").limit(10).get(),
        db.collection("ops").doc("execution-worker").get(),
      ]);

      const recentFailures = failedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const recentSubmitted = submittedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.json({
        success: true,
        mode: process.env.EXECUTION_MODE || "paper",
        hl: hyperliquidConfig(),
        wallets: walletRoleConfig(),
        queueSignals: {
          hasQueued: queuedSnap.size > 0,
          hasProcessing: processingSnap.size > 0,
        },
        worker: heartbeatSnap.exists ? heartbeatSnap.data() : null,
        recentFailures,
        recentSubmitted,
      });
    } catch (e: any) {
      res.status(401).json({ error: e?.message || "Unauthorized" });
    }
  });

  app.post("/api/admin/markets/:id/pause", async (req, res) => {
    try {
      await requireAdmin(req);
      const id = req.params.id;
      await db.collection("markets").doc(id).set({ status: "paused", pausedAt: nowIso() }, { merge: true });
      res.json({ success: true });
    } catch (e: any) {
      res.status(401).json({ error: e?.message || "Unauthorized" });
    }
  });

  // UMA OOv3 (Optimism): create assertion for market resolution (24h liveness default)
  app.post("/api/admin/markets/:id/uma/assert", async (req, res) => {
    try {
      const { wallet } = await requireAdmin(req);
      const id = req.params.id;
      const marketDoc = await db.collection("markets").doc(id).get();
      if (!marketDoc.exists) return res.status(404).json({ error: "Market not found" });
      const market = marketDoc.data() as any;

      const proposedOutcomeYes = !!req.body?.proposedOutcomeYes;
      const livenessSec = Number(req.body?.livenessSec ?? 86400);

      const claimObj = {
        marketId: id,
        question: market.question,
        platform: market.platform,
        metric: market.metric,
        targetUrl: market.targetUrl,
        deadline: market.deadline,
        proposedOutcomeYes,
        generatedAt: nowIso(),
      };

      // Store claim snapshot for auditability
      const claimRef = await db.collection("markets").doc(id).collection("claims").add({
        ...claimObj,
        createdBy: wallet,
      });

      // MVP: we only prepare the assertion call on-chain and store metadata.
      // Broadcasting the tx should be done by your oracle/relayer wallet service.
      // However, we can still return the call data so your relayer can send it.
      const claimBytes = Buffer.from(JSON.stringify(claimObj), "utf8");

      const currency = (process.env.UMA_BOND_CURRENCY_OPTIMISM || "0x0000000000000000000000000000000000000000") as `0x${string}`;
      const bond = BigInt(process.env.UMA_BOND_AMOUNT || "0");
      const identifier = (process.env.UMA_IDENTIFIER || "ASSERT_TRUTH").padEnd(32, "\0").slice(0, 32);
      const identifierBytes32 = `0x${Buffer.from(identifier, "utf8").toString("hex")}` as `0x${string}`;

      res.json({
        success: true,
        claimId: claimRef.id,
        uma: {
          chainId: 10,
          oov3: UMA_OOV3_OPTIMISM,
          fn: "assertTruth",
          args: {
            claim: `0x${claimBytes.toString("hex")}`,
            asserter: wallet,
            callbackRecipient: "0x0000000000000000000000000000000000000000",
            escalationManager: "0x0000000000000000000000000000000000000000",
            liveness: livenessSec,
            currency,
            bond: bond.toString(),
            identifier: identifierBytes32,
            domainId: "0x0000000000000000000000000000000000000000000000000000000000000000",
          },
        },
      });
    } catch (e: any) {
      res.status(401).json({ error: e?.message || "Unauthorized" });
    }
  });

  // UMA status (requires admin): reads assertion status from Optimism
  app.get("/api/admin/uma/:assertionId", async (req, res) => {
    try {
      await requireAdmin(req);
      const assertionId = req.params.assertionId as `0x${string}`;
      const a = await optimismClient.readContract({
        address: UMA_OOV3_OPTIMISM,
        abi: ooV3Abi,
        functionName: "getAssertion",
        args: [assertionId],
        // viem requires this field on some chain configs; empty is fine for eth_call.
        authorizationList: [],
      });
      res.json({ success: true, assertionId, assertion: a });
    } catch (e: any) {
      res.status(401).json({ error: e?.message || "Unauthorized" });
    }
  });

  // Culture Club routes
  app.get("/api/culture-metrics", async (req, res) => {
    try {
      const snapshot = await db.collection('cultureMetrics').orderBy('day').get();
      const metrics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(metrics);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch culture metrics" });
    }
  });

  // AI Prediction routes
  app.post("/api/ai/predict", async (req, res) => {
    const { marketId, contextPayload } = req.body;
    try {
      const prompt = `Act as a ruthless, unbiased quantitative analyst. Analyze the following context and return the probability of 'yes', confidence score, key drivers, and reasoning.
Context: ${JSON.stringify(contextPayload)}
Return strictly only the requested JSON schema.`;
      
      const model = ai.models.generateContent({ model: "gemini-1.5-pro", config: { responseMimeType: "application/json" }, contents: prompt });
      const result = await model;
      const prediction = JSON.parse(result.text!);
      res.json(prediction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "AI prediction failed" });
    }
  });

  // Trading routes
  app.post("/api/trade", async (req, res) => {
    const { marketId, side, amount, price, shares, currency, clientTs } = req.body || {};
    try {
      // 1. Status Check
      const marketDoc = await db.collection('markets').doc(marketId).get();
      if (!marketDoc.exists || marketDoc.data()?.status !== 'active') {
        return res.status(400).json({ error: "Market not active" });
      }

      if (!marketId || (side !== "YES" && side !== "NO")) {
        return res.status(400).json({ error: "Bad request" });
      }
      const amt = Number(amount);
      const px = Number(price);
      const sh = Number(shares);
      if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: "Invalid amount" });
      if (!Number.isFinite(px) || px <= 0) return res.status(400).json({ error: "Invalid price" });
      if (!Number.isFinite(sh) || sh <= 0) return res.status(400).json({ error: "Invalid shares" });

      const trader = await optionalTrader(req);
      const referralCode = getReferralCode(req);
      const fees = feeConfig();
      const tradeRef = db.collection("markets").doc(marketId).collection("trades").doc();

      await db.runTransaction(async (tx) => {
        const mRef = db.collection("markets").doc(marketId);
        const mSnap = await tx.get(mRef);
        if (!mSnap.exists) throw new Error("Market not found");
        const m = mSnap.data() as any;
        if (m?.status !== "active") throw new Error("Market not active");
        if (isClosed(m)) {
          tx.set(mRef, { status: "closed", closedAt: nowIso() }, { merge: true });
          throw new Error("Market closed");
        }

        const prevVol = Number(m?.totalVolume || 0);
        const feeAmount = (amt * fees.tradeFeeBps) / 10000;
        const protocolFee = (amt * fees.protocolBps) / 10000;
        const creatorFee = (amt * fees.creatorBps) / 10000;
        const clobMmFee = (amt * fees.clobMmBps) / 10000;
        const affiliateFee = (amt * fees.affiliateBps) / 10000;
        const bufferPoolFee = (amt * fees.bufferBps) / 10000;

        // For MVP, creator pool accrues to whoever created the market (admin wallet).
        // The "Are you @creator?" verification can later remap this beneficiary.
        const creatorBeneficiary = String(m?.createdBy || "").toLowerCase() || null;

        const normalizedRef =
          referralCode && referralCode !== String(trader.id).toLowerCase() ? referralCode : null;

        tx.set(tradeRef, {
          marketId,
          side,
          amount: amt,
          price: px,
          shares: sh,
          currency: currency || "USDT",
          feeBps: fees.tradeFeeBps,
          feeAmount,
          feeBreakdown: {
            protocolFee,
            creatorFee,
            clobMmFee,
            affiliateFee,
            bufferPoolFee,
          },
          traderKind: trader.kind,
          traderId: trader.id,
          privyUserId: (trader as any).userId || null,
          referralCode: normalizedRef,
          clientTs: Number(clientTs) || null,
          createdAt: nowIso(),
          execution: {
            mode: process.env.EXECUTION_MODE || "paper",
            status: process.env.EXECUTION_MODE === "hyperliquid" ? "queued" : "paper",
          },
        });
        tx.set(
          mRef,
          {
            totalVolume: prevVol + amt,
            lastTradeAt: nowIso(),
            feesAccruedTotal: Number(m?.feesAccruedTotal || 0) + feeAmount,
            protocolAccrued: Number(m?.protocolAccrued || 0) + protocolFee,
            creatorPoolAccrued: Number(m?.creatorPoolAccrued || 0) + creatorFee,
            clobMmAccrued: Number(m?.clobMmAccrued || 0) + clobMmFee,
            affiliateAccrued: Number(m?.affiliateAccrued || 0) + affiliateFee,
            bufferPoolAccrued: Number(m?.bufferPoolAccrued || 0) + bufferPoolFee,
          },
          { merge: true }
        );

        // Global treasury ledger
        const tRef = db.collection("treasury").doc("fees");
        const tSnap = await tx.get(tRef);
        const t = (tSnap.exists ? (tSnap.data() as any) : {}) || {};
        tx.set(
          tRef,
          {
            updatedAt: nowIso(),
            totalFeesAccrued: Number(t.totalFeesAccrued || 0) + feeAmount,
            protocolAccrued: Number(t.protocolAccrued || 0) + protocolFee,
            creatorPoolAccrued: Number(t.creatorPoolAccrued || 0) + creatorFee,
            clobMmAccrued: Number(t.clobMmAccrued || 0) + clobMmFee,
            affiliatePoolAccrued: Number(t.affiliatePoolAccrued || 0) + affiliateFee,
            bufferPoolAccrued: Number(t.bufferPoolAccrued || 0) + bufferPoolFee,
          },
          { merge: true }
        );

        // Affiliate ledger (by referral code)
        if (normalizedRef && affiliateFee > 0) {
          const aRef = db.collection("affiliates").doc(normalizedRef);
          const aSnap = await tx.get(aRef);
          const a = (aSnap.exists ? (aSnap.data() as any) : {}) || {};
          tx.set(
            aRef,
            {
              updatedAt: nowIso(),
              code: normalizedRef,
              accrued: Number(a.accrued || 0) + affiliateFee,
              claimed: Number(a.claimed || 0),
              tradesReferred: Number(a.tradesReferred || 0) + 1,
              volumeReferred: Number(a.volumeReferred || 0) + amt,
            },
            { merge: true }
          );
        }

        // Creator pool beneficiary (market creator wallet)
        if (creatorBeneficiary && creatorFee > 0) {
          const cRef = db.collection("creators").doc(creatorBeneficiary);
          const cSnap = await tx.get(cRef);
          const c = (cSnap.exists ? (cSnap.data() as any) : {}) || {};
          tx.set(
            cRef,
            {
              updatedAt: nowIso(),
              wallet: creatorBeneficiary,
              accrued: Number(c.accrued || 0) + creatorFee,
              claimed: Number(c.claimed || 0),
            },
            { merge: true }
          );
        }
      });

      // If Hyperliquid execution is enabled, enqueue a job (actual execution handled by a worker).
      if ((process.env.EXECUTION_MODE || "paper") === "hyperliquid") {
        await db.collection("executionQueue").add({
          kind: "hyperliquid",
          marketId,
          tradeId: tradeRef.id,
          createdAt: nowIso(),
          status: "queued",
          payload: {
            side,
            amount: amt,
            price: px,
            shares: sh,
            currency: currency || "USDT",
          },
        });
      }

      res.json({ success: true, tradeId: tradeRef.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Trading failed" });
    }
  });

  // Affiliate: check claimable (Privy optional; uses wallet if available)
  app.get("/api/affiliate/me", async (req, res) => {
    try {
      const trader = await optionalTrader(req);
      const code = String(trader.id).toLowerCase();
      const doc = await db.collection("affiliates").doc(code).get();
      const d = doc.exists ? (doc.data() as any) : {};
      const accrued = Number(d?.accrued || 0);
      const claimed = Number(d?.claimed || 0);
      const pending = Number(d?.pending || 0);
      res.json({
        success: true,
        code,
        accrued,
        claimed,
        pending,
        claimable: Math.max(0, accrued - claimed - pending),
        payoutDelaySec: payoutDelayConfigSec().applied,
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Failed" });
    }
  });

  // Affiliate: request claim (records a payout request for ops/relayer)
  app.post("/api/affiliate/me/claim", async (req, res) => {
    try {
      const trader = await optionalTrader(req);
      const code = String(trader.id).toLowerCase();
      const aRef = db.collection("affiliates").doc(code);
      const reqRef = db.collection("payoutRequests").doc();
      const amountReq = Number(req.body?.amount || 0);
      if (!Number.isFinite(amountReq) || amountReq <= 0) return res.status(400).json({ error: "Invalid amount" });

      const availableAt = await computeAffiliateAvailableAt(code);

      await db.runTransaction(async (tx) => {
        const snap = await tx.get(aRef);
        const a = snap.exists ? (snap.data() as any) : {};
        const accrued = Number(a?.accrued || 0);
        const claimed = Number(a?.claimed || 0);
        const pending = Number(a?.pending || 0);
        const claimable = Math.max(0, accrued - claimed - pending);
        if (amountReq > claimable) throw new Error("Amount exceeds claimable");
        // MVP safety: never "pay out" immediately. We reserve the amount as pending
        // and let ops/relayer settle after the 24h dispute window.
        tx.set(aRef, { pending: pending + amountReq, updatedAt: nowIso() }, { merge: true });
        tx.set(reqRef, {
          kind: "affiliate",
          code,
          amount: amountReq,
          currency: "USDT",
          createdAt: nowIso(),
          availableAt,
          status: "queued",
          traderKind: trader.kind,
        });
      });

      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e?.message || "Failed" });
    }
  });

  // Creator pool: view claimable for a market (MVP: based on accrual)
  app.get("/api/markets/:id/creator-pool", async (req, res) => {
    try {
      const id = req.params.id;
      const snap = await db.collection("markets").doc(id).get();
      if (!snap.exists) return res.status(404).json({ error: "Market not found" });
      const m = snap.data() as any;
      res.json({
        success: true,
        marketId: id,
        creatorPoolAccrued: Number(m?.creatorPoolAccrued || 0),
        currency: m?.currency || "USDT",
        beneficiary: String(m?.createdBy || "").toLowerCase() || null,
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  const workerIntervalMs = Number(process.env.EXECUTION_WORKER_INTERVAL_MS || 8000);
  setInterval(async () => {
    if (workerBusy) return;
    workerBusy = true;
    try {
      await processExecutionQueueTick();
    } catch (e) {
      console.error("Execution worker tick failed:", e);
    } finally {
      workerBusy = false;
    }
  }, workerIntervalMs);
}

startServer();
