import { requireAuth } from "@/lib/auth/session";
import {
  getActivePlan,
  getUserPlans,
  getPlanWeeksWithProgress,
} from "@/lib/db/queries/plans";

export default async function PlanPage() {
  try {
    const session = await requireAuth();
    const userId = session.user!.id as string;

    const [activePlan, allPlans] = await Promise.all([
      getActivePlan(userId),
      getUserPlans(userId),
    ]);

    if (!activePlan) {
      return (
        <div className="p-5">
          <h1 className="font-bebas text-[32px] text-text">Mon plan</h1>
          <p className="text-muted text-sm mt-2">Aucun plan actif</p>
        </div>
      );
    }

    const weeksWithProgress = await getPlanWeeksWithProgress(
      activePlan.id,
      userId,
    );

    return (
      <div className="p-5">
        <h1 className="font-bebas text-[32px] text-text">Mon plan</h1>
        <pre className="text-xs text-muted mt-4 overflow-auto whitespace-pre-wrap">
          {JSON.stringify(
            {
              plan: activePlan.name,
              startDate: activePlan.startDate,
              weeks: weeksWithProgress.length,
              allPlans: allPlans.length,
              week1: weeksWithProgress[0]
                ? {
                    weekNumber: weeksWithProgress[0].weekNumber,
                    phase: weeksWithProgress[0].phase,
                    sessionsCount: weeksWithProgress[0].sessions?.length,
                    actualVolumeKm: weeksWithProgress[0].actualVolumeKm,
                  }
                : null,
            },
            null,
            2,
          )}
        </pre>
      </div>
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);
    const stack =
      error instanceof Error ? error.stack : undefined;
    return (
      <div className="p-5">
        <h1 className="font-bebas text-[32px] text-accent2">Erreur</h1>
        <pre className="text-xs text-accent2 mt-4 overflow-auto whitespace-pre-wrap">
          {message}
        </pre>
        <pre className="text-xs text-muted mt-2 overflow-auto whitespace-pre-wrap">
          {stack}
        </pre>
      </div>
    );
  }
}
