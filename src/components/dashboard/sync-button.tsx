"use client";

import { useState } from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [state, setState] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [synced, setSynced] = useState(0);
  const router = useRouter();

  async function handleSync() {
    setState("syncing");
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setSynced(data.synced);
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={state === "syncing"}
      className="w-full flex items-center justify-center gap-2 bg-accent text-bg font-semibold text-sm px-4 py-2.5 rounded-xl disabled:opacity-50 transition-colors"
    >
      {state === "syncing" && (
        <>
          <RefreshCw size={16} className="animate-spin" />
          Synchronisation...
        </>
      )}
      {state === "idle" && (
        <>
          <RefreshCw size={16} />
          Synchroniser les activites
        </>
      )}
      {state === "done" && (
        <>
          <Check size={16} />
          {synced} activite{synced !== 1 ? "s" : ""} importee{synced !== 1 ? "s" : ""}
        </>
      )}
      {state === "error" && (
        <>
          <AlertCircle size={16} />
          Erreur de sync — reessayer
        </>
      )}
    </button>
  );
}
