import { ReactNode } from "react";
import { getServerFlags } from "@/lib/server-flags";
import { FeatureFlags } from "@/lib/flags";

interface FeatureGateProps {
  flag: keyof FeatureFlags;
  fallback?: ReactNode;
  children: ReactNode;
}

export default async function FeatureGate({
  flag, fallback, children,
}: FeatureGateProps) {
  const flags = await getServerFlags();
  if (!flags[flag]) return <>{fallback ?? null}</>;
  return <>{children}</>;
}
