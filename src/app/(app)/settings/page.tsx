import {
  User,
  Wifi,
  WifiOff,
  ClipboardPen,
  Download,
  LogOut,
  ChevronRight,
  Watch,
} from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { getUserPlans } from "@/lib/db/queries/plans";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signOut } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await requireAuth();
  const userId = session.user!.id as string;

  const [userRecord, userPlans] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    getUserPlans(userId),
  ]);

  const isGarminConnected = Boolean(userRecord?.garminAccessToken);
  const userName = userRecord?.name ?? session.user?.name ?? "Runner";
  const userEmail = userRecord?.email ?? session.user?.email ?? "";

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Header */}
      <h1 className="font-bebas text-[36px] leading-none text-text">
        Reglages
      </h1>

      {/* Profile card */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-muted shrink-0">
          <User size={22} strokeWidth={2} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bebas text-xl leading-none text-text">
            {userName}
          </span>
          <span className="text-xs font-dm text-muted mt-0.5 truncate">
            {userEmail}
          </span>
        </div>
      </div>

      {/* Strava section */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <Watch size={16} strokeWidth={2} className="text-muted" />
            <span className="font-bebas text-base text-text tracking-wide">
              Strava
            </span>
          </div>
          <p className="text-xs font-dm text-muted">
            Synchronise tes activites depuis Strava
          </p>
        </div>
        <a
          href="/api/garmin/connect"
          className="flex items-center justify-between p-4 hover:bg-card transition-colors"
        >
          <div className="flex items-center gap-3">
            {isGarminConnected ? (
              <Wifi size={18} strokeWidth={2} className="text-success" />
            ) : (
              <WifiOff size={18} strokeWidth={2} className="text-muted" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-dm text-text">
                {isGarminConnected ? "Strava connecte" : "Non connecte"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isGarminConnected && (
              <span className="text-xs font-dm text-accent">Connecter</span>
            )}
            <ChevronRight size={16} strokeWidth={2} className="text-muted" />
          </div>
        </a>
      </div>

      {/* Plans section */}
      {userPlans.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <ClipboardPen size={16} strokeWidth={2} className="text-muted" />
            <span className="font-bebas text-base text-text tracking-wide">
              Plans d&apos;entrainement
            </span>
          </div>
          <div className="flex flex-col">
            {userPlans.map((plan, idx) => (
              <div
                key={plan.id}
                className={`flex items-center justify-between p-4 ${
                  idx < userPlans.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-dm text-text truncate">
                    {plan.name}
                  </span>
                  {plan.targetPace && (
                    <span className="text-[10px] font-dm text-muted">
                      Cible: {plan.targetPace}/km
                    </span>
                  )}
                </div>
                {plan.isActive && (
                  <span className="text-[10px] font-dm text-success bg-success/10 border border-success/20 rounded-full px-2 py-0.5 shrink-0 ml-2">
                    Actif
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data section */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <span className="font-bebas text-base text-text tracking-wide">
            Donnees
          </span>
        </div>
        <a
          href="/api/activities/export"
          className="flex items-center justify-between p-4 hover:bg-card transition-colors"
        >
          <div className="flex items-center gap-3">
            <Download size={18} strokeWidth={2} className="text-muted" />
            <span className="text-sm font-dm text-text">
              Exporter mes activites
            </span>
          </div>
          <ChevronRight size={16} strokeWidth={2} className="text-muted" />
        </a>
      </div>

      {/* Logout */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-between p-4 hover:bg-card transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} strokeWidth={2} className="text-accent2" />
              <span className="text-sm font-dm text-accent2">
                Se deconnecter
              </span>
            </div>
            <ChevronRight size={16} strokeWidth={2} className="text-muted" />
          </button>
        </form>
      </div>
    </div>
  );
}
