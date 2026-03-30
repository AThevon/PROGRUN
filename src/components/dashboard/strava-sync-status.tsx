import { RefreshCw } from "lucide-react";

interface StravaSyncStatusProps {
  isConnected: boolean;
  lastSync?: Date | null;
}

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Il y a ${diffD}j`;
}

export function StravaSyncStatus({ isConnected, lastSync }: StravaSyncStatusProps) {
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3">
      {/* Status dot */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isConnected ? "bg-success" : "bg-muted"
          }`}
        />
        {isConnected && (
          <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-dm text-text">
          Strava {isConnected ? "connecte" : "deconnecte"}
        </span>
        {lastSync && (
          <p className="text-xs font-dm text-muted">
            {timeAgo(lastSync)}
          </p>
        )}
        {!lastSync && isConnected && (
          <p className="text-xs font-dm text-muted">Jamais synchronise</p>
        )}
      </div>

      {/* Refresh button */}
      <button
        className="p-1.5 rounded-lg text-muted hover:text-text transition-colors active:opacity-60"
        aria-label="Synchroniser Strava"
      >
        <RefreshCw size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
