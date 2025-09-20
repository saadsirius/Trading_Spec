// Server-side flags loader. Merge from ENV + per-user DB (optional).
// You can extend with LaunchDarkly/GrowthBook later without changing the API.
import { cookies } from "next/headers";
import { FeatureFlags } from "./flags";

export async function getServerFlags(userId?: string): Promise<FeatureFlags> {
  // ENV defaults (toggle quickly in .env)
  const envDefaults: FeatureFlags = {
    live: process.env.FEAT_LIVE === "1",
    screener: process.env.FEAT_SCREENER !== "0",
    backtest: process.env.FEAT_BACKTEST !== "0",
    aiSignals: process.env.FEAT_AI_SIGNALS !== "0",
    notifications: process.env.FEAT_NOTIFICATIONS !== "0",
  };

  // Cookie override: live_enabled sets `live`
  const c = cookies();
  const liveEnabled = c.get("live_enabled")?.value === "1";

  // Optional: load per-user flags from DB
  // const row = userId ? await prisma.featureFlag.findMany({ where: { userId } }) : [];
  // const dbMap = Object.fromEntries(row.map(r => [r.key, r.value === "1"]));

  return { ...envDefaults, live: envDefaults.live || liveEnabled };
}
