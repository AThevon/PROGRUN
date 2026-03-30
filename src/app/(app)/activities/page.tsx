import { requireAuth } from "@/lib/auth/session";
import { getUserActivities } from "@/lib/db/queries/activities";
import { ActivityListCard } from "@/components/activity/activity-list-card";
import { FileUpload } from "@/components/activity/file-upload";
import { StravaSyncModal } from "@/components/dashboard/strava-sync-modal";
import { minDelay } from "@/lib/utils/delay";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function ActivitiesPage() {
  const session = await requireAuth();
  const userId = session.user!.id as string;

  const [activities, user] = await minDelay(
    Promise.all([
      getUserActivities(userId),
      db.query.users.findFirst({ where: eq(users.id, userId) }),
    ]),
  );

  const isStravaConnected = !!user?.garminAccessToken;

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-bebas text-[32px] leading-none text-text">
          Activites
        </h1>
        <FileUpload />
      </div>

      {/* Strava import */}
      {isStravaConnected && <StravaSyncModal />}

      {/* List */}
      {activities.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center gap-3 text-center mt-4">
          <span className="font-bebas text-2xl text-muted">
            Aucune activite
          </span>
          <p className="text-sm font-dm text-muted">
            Importe un fichier ou synchronise depuis Strava.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((activity) => (
            <ActivityListCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
