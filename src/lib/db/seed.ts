import { db } from "@/lib/db";
import { plans, planWeeks, planSessions } from "@/lib/db/schema";

export async function seedPlan(userId: string) {
  // Insert plan
  const [plan] = await db
    .insert(plans)
    .values({
      userId,
      name: "10 KM — Sub 1h",
      targetDistance: 10,
      targetTime: "1:00:00",
      targetPace: "6:00",
      durationWeeks: 8,
      isActive: true,
      zones: {
        z1: { name: "Recup", min: "8:00", max: "9:00" },
        z2: { name: "Fondamentale", min: "7:00", max: "7:45" },
        z3: { name: "Objectif", min: "5:50", max: "6:15" },
        z4: { name: "Seuil", min: "5:10", max: "5:40" },
      },
    })
    .returning();

  // Week definitions: [weekNumber, phase, title, targetVolumeKm, targetSessions]
  const weekDefs: Array<{
    weekNumber: number;
    phase: string;
    title: string;
    targetVolumeKm: number;
    targetSessions: number;
  }> = [
    { weekNumber: 1, phase: "build", title: "Semaine 1", targetVolumeKm: 18, targetSessions: 3 },
    { weekNumber: 2, phase: "build", title: "Semaine 2", targetVolumeKm: 21, targetSessions: 3 },
    { weekNumber: 3, phase: "build", title: "Semaine 3", targetVolumeKm: 24, targetSessions: 4 },
    { weekNumber: 4, phase: "recovery", title: "Semaine 4", targetVolumeKm: 14, targetSessions: 3 },
    { weekNumber: 5, phase: "performance", title: "Semaine 5", targetVolumeKm: 22, targetSessions: 4 },
    { weekNumber: 6, phase: "performance", title: "Semaine 6", targetVolumeKm: 25, targetSessions: 4 },
    { weekNumber: 7, phase: "taper", title: "Semaine 7", targetVolumeKm: 15, targetSessions: 3 },
    { weekNumber: 8, phase: "race", title: "Semaine 8", targetVolumeKm: 10, targetSessions: 2 },
  ];

  const insertedWeeks = await db
    .insert(planWeeks)
    .values(weekDefs.map((w) => ({ planId: plan.id, ...w })))
    .returning();

  // Map weekNumber -> weekId
  const weekIdByNumber: Record<number, string> = {};
  for (const w of insertedWeeks) {
    weekIdByNumber[w.weekNumber] = w.id;
  }

  // Session definitions
  // dayOfWeek: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  type SessionDef = {
    weekNumber: number;
    dayOfWeek: number;
    type: string;
    isKeySession: boolean;
    title: string;
    description: string;
    targetDistanceKm: number;
    targetZone: string | null;
  };

  const sessionDefs: SessionDef[] = [
    // Week 1
    {
      weekNumber: 1,
      dayOfWeek: 1,
      type: "fondamentale",
      isKeySession: false,
      title: "Fondamentale 6km",
      description: "Course en zone fondamentale",
      targetDistanceKm: 6,
      targetZone: "z2",
    },
    {
      weekNumber: 1,
      dayOfWeek: 3,
      type: "fartlek",
      isKeySession: true,
      title: "Fartlek 5km",
      description: "Fartlek séance clé",
      targetDistanceKm: 5,
      targetZone: null,
    },
    {
      weekNumber: 1,
      dayOfWeek: 5,
      type: "sortie_longue",
      isKeySession: false,
      title: "Sortie longue 7km",
      description: "Sortie longue en zone fondamentale",
      targetDistanceKm: 7,
      targetZone: "z2",
    },
    // Week 2
    {
      weekNumber: 2,
      dayOfWeek: 1,
      type: "fondamentale",
      isKeySession: false,
      title: "Fondamentale 7km",
      description: "Course en zone fondamentale",
      targetDistanceKm: 7,
      targetZone: "z2",
    },
    {
      weekNumber: 2,
      dayOfWeek: 3,
      type: "fractionne",
      isKeySession: true,
      title: "Fractionné 5km",
      description: "Fractionné séance clé",
      targetDistanceKm: 5,
      targetZone: null,
    },
    {
      weekNumber: 2,
      dayOfWeek: 5,
      type: "sortie_longue",
      isKeySession: false,
      title: "Sortie longue 9km",
      description: "Sortie longue en zone fondamentale",
      targetDistanceKm: 9,
      targetZone: "z2",
    },
    // Week 3
    {
      weekNumber: 3,
      dayOfWeek: 0,
      type: "recup",
      isKeySession: false,
      title: "Récupération 5km",
      description: "Course de récupération en zone 1",
      targetDistanceKm: 5,
      targetZone: "z1",
    },
    {
      weekNumber: 3,
      dayOfWeek: 2,
      type: "fractionne",
      isKeySession: true,
      title: "Fractionné 7km",
      description: "Fractionné séance clé",
      targetDistanceKm: 7,
      targetZone: null,
    },
    {
      weekNumber: 3,
      dayOfWeek: 4,
      type: "tempo",
      isKeySession: false,
      title: "Tempo 6km",
      description: "Course tempo",
      targetDistanceKm: 6,
      targetZone: null,
    },
    {
      weekNumber: 3,
      dayOfWeek: 6,
      type: "sortie_longue",
      isKeySession: false,
      title: "Sortie longue 10km",
      description: "Sortie longue en zone fondamentale",
      targetDistanceKm: 10,
      targetZone: "z2",
    },
    // Week 4
    {
      weekNumber: 4,
      dayOfWeek: 1,
      type: "recup",
      isKeySession: false,
      title: "Récupération 5km",
      description: "Course de récupération en zone 1",
      targetDistanceKm: 5,
      targetZone: "z1",
    },
    {
      weekNumber: 4,
      dayOfWeek: 3,
      type: "fartlek",
      isKeySession: false,
      title: "Fartlek 5km",
      description: "Fartlek",
      targetDistanceKm: 5,
      targetZone: null,
    },
    {
      weekNumber: 4,
      dayOfWeek: 5,
      type: "fondamentale",
      isKeySession: false,
      title: "Fondamentale 6km",
      description: "Course en zone fondamentale",
      targetDistanceKm: 6,
      targetZone: "z2",
    },
    // Week 5
    {
      weekNumber: 5,
      dayOfWeek: 1,
      type: "fondamentale",
      isKeySession: false,
      title: "Fondamentale 6km",
      description: "Course en zone fondamentale",
      targetDistanceKm: 6,
      targetZone: "z2",
    },
    {
      weekNumber: 5,
      dayOfWeek: 3,
      type: "fractionne",
      isKeySession: true,
      title: "Fractionné 8km",
      description: "Fractionné séance clé",
      targetDistanceKm: 8,
      targetZone: null,
    },
    {
      weekNumber: 5,
      dayOfWeek: 4,
      type: "recup",
      isKeySession: false,
      title: "Récupération 4km",
      description: "Course de récupération en zone 1",
      targetDistanceKm: 4,
      targetZone: "z1",
    },
    {
      weekNumber: 5,
      dayOfWeek: 6,
      type: "sortie_longue",
      isKeySession: false,
      title: "Sortie longue 10km",
      description: "Sortie longue en zone fondamentale",
      targetDistanceKm: 10,
      targetZone: "z2",
    },
    // Week 6
    {
      weekNumber: 6,
      dayOfWeek: 0,
      type: "recup",
      isKeySession: false,
      title: "Récupération 5km",
      description: "Course de récupération en zone 1",
      targetDistanceKm: 5,
      targetZone: "z1",
    },
    {
      weekNumber: 6,
      dayOfWeek: 2,
      type: "fractionne",
      isKeySession: true,
      title: "Fractionné 10km",
      description: "Fractionné séance clé",
      targetDistanceKm: 10,
      targetZone: null,
    },
    {
      weekNumber: 6,
      dayOfWeek: 4,
      type: "fartlek",
      isKeySession: false,
      title: "Fartlek 6km",
      description: "Fartlek",
      targetDistanceKm: 6,
      targetZone: null,
    },
    {
      weekNumber: 6,
      dayOfWeek: 6,
      type: "sortie_longue",
      isKeySession: false,
      title: "Sortie longue 11km",
      description: "Sortie longue en zone fondamentale",
      targetDistanceKm: 11,
      targetZone: "z2",
    },
    // Week 7
    {
      weekNumber: 7,
      dayOfWeek: 1,
      type: "fondamentale",
      isKeySession: false,
      title: "Fondamentale 5km",
      description: "Course en zone fondamentale",
      targetDistanceKm: 5,
      targetZone: "z2",
    },
    {
      weekNumber: 7,
      dayOfWeek: 3,
      type: "fractionne",
      isKeySession: true,
      title: "Fractionné 5km",
      description: "Fractionné séance clé",
      targetDistanceKm: 5,
      targetZone: null,
    },
    {
      weekNumber: 7,
      dayOfWeek: 5,
      type: "recup",
      isKeySession: false,
      title: "Récupération 5km",
      description: "Course de récupération en zone 1",
      targetDistanceKm: 5,
      targetZone: "z1",
    },
    // Week 8
    {
      weekNumber: 8,
      dayOfWeek: 2,
      type: "recup",
      isKeySession: false,
      title: "Récupération 3km",
      description: "Course de récupération en zone 1",
      targetDistanceKm: 3,
      targetZone: "z1",
    },
    {
      weekNumber: 8,
      dayOfWeek: 6,
      type: "course",
      isKeySession: true,
      title: "Course 10km",
      description: "Course objectif 10km",
      targetDistanceKm: 10,
      targetZone: null,
    },
  ];

  await db.insert(planSessions).values(
    sessionDefs.map(({ weekNumber, ...s }) => ({
      weekId: weekIdByNumber[weekNumber],
      ...s,
    }))
  );

  return plan;
}
