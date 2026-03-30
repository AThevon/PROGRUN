import { db } from "@/lib/db";
import { plans, planWeeks, planSessions } from "@/lib/db/schema";

type S = {
  day: number; type: string; key: boolean; title: string; desc: string;
  dist: number; pace: string | null; zone: string | null;
  intervals: { reps: number; work: string; rest: string } | null;
};

type W = { n: number; phase: string; title: string; vol: number; sess: number; sessions: S[] };

const WEEKS: W[] = [
  { n: 1, phase: "build", title: "Pose les bases", vol: 18, sess: 3, sessions: [
    { day: 1, type: "fondamentale", key: false, title: "Sortie fondamentale", desc: "6 km en Z2 (7:00-7:30)\nEffort percu : chill, tu peux parler", dist: 6, pace: "7:15", zone: "z2", intervals: null },
    { day: 3, type: "fartlek", key: true, title: "Fartlek debutant", desc: "5 km total · 5x (1 min allure Z3 + 2 min Z2)\nPremiere touche a l'allure objectif", dist: 5, pace: null, zone: "z2-z3", intervals: { reps: 5, work: "1 min allure Z3", rest: "2 min Z2" } },
    { day: 5, type: "sortie_longue", key: false, title: "Sortie longue", desc: "7 km en Z2 (7:15-7:45)\nAllure tres tranquille, pas d'ego", dist: 7, pace: "7:30", zone: "z2", intervals: null },
  ]},
  { n: 2, phase: "build", title: "Monte en volume", vol: 21, sess: 3, sessions: [
    { day: 1, type: "fondamentale", key: false, title: "Sortie fondamentale", desc: "7 km en Z2\nRegulier, meme sensation que S1", dist: 7, pace: "7:15", zone: "z2", intervals: null },
    { day: 3, type: "fractionne", key: true, title: "Fractionne Z3", desc: "5 km total · 3x (5 min a 6:15 + 3 min recup Z1)\nCommence a sentir l'allure objectif", dist: 5, pace: "6:15", zone: "z3", intervals: { reps: 3, work: "5 min a 6:15", rest: "3 min recup Z1" } },
    { day: 5, type: "sortie_longue", key: false, title: "Sortie longue", desc: "9 km en Z2\nPremier run long — prends ton temps", dist: 9, pace: "7:30", zone: "z2", intervals: null },
  ]},
  { n: 3, phase: "build", title: "Consolide", vol: 24, sess: 4, sessions: [
    { day: 0, type: "recup", key: false, title: "Sortie recup", desc: "5 km en Z1 (8:30-9:00)\nSuper facile — active la recuperation", dist: 5, pace: "8:45", zone: "z1", intervals: null },
    { day: 2, type: "fractionne", key: true, title: "Allure specifique", desc: "7 km total · 2x (10 min a 6:00-6:10 + 5 min Z2)\nGros bloc allure cible !", dist: 7, pace: "6:05", zone: "z3", intervals: { reps: 2, work: "10 min a 6:00-6:10", rest: "5 min Z2" } },
    { day: 4, type: "tempo", key: false, title: "Sortie tempo", desc: "6 km en Z2-Z3 (6:45-7:00)\nLegerement plus rapide que d'hab", dist: 6, pace: "6:50", zone: "z2-z3", intervals: null },
    { day: 6, type: "sortie_longue", key: false, title: "Sortie longue", desc: "10 km en Z2\nPremiere fois que tu couvres la distance !", dist: 10, pace: "7:30", zone: "z2", intervals: null },
  ]},
  { n: 4, phase: "recovery", title: "Decharge — laisse les jambes absorber", vol: 16, sess: 3, sessions: [
    { day: 1, type: "recup", key: false, title: "Recup active", desc: "5 km tres easy en Z1\nPas de montre, juste courir par plaisir", dist: 5, pace: "8:30", zone: "z1", intervals: null },
    { day: 3, type: "fartlek", key: false, title: "Fartlek leger", desc: "5 km · quelques accelerations de 30s\nJuste entretenir les sensations", dist: 5, pace: null, zone: "z1-z2", intervals: null },
    { day: 5, type: "fondamentale", key: false, title: "Sortie cool", desc: "6 km en Z2\nTe prepare pour la phase de perf", dist: 6, pace: "7:15", zone: "z2", intervals: null },
  ]},
  { n: 5, phase: "performance", title: "Renforce l'allure cible", vol: 28, sess: 4, sessions: [
    { day: 1, type: "fondamentale", key: false, title: "Fondamentale", desc: "6 km en Z2\nJambes fraiches pour le jeudi", dist: 6, pace: "7:15", zone: "z2", intervals: null },
    { day: 3, type: "fractionne", key: true, title: "Seance reine", desc: "8 km total · 4x (8 min a 5:50-6:00 + 4 min Z1)\n32 min cumules a allure objectif", dist: 8, pace: "5:55", zone: "z3", intervals: { reps: 4, work: "8 min a 5:50-6:00", rest: "4 min Z1" } },
    { day: 4, type: "recup", key: false, title: "Recup active", desc: "4 km en Z1 — jambes faciles", dist: 4, pace: "8:30", zone: "z1", intervals: null },
    { day: 6, type: "sortie_longue", key: false, title: "Sortie longue", desc: "10 km en Z2 avec 2 km finaux a 6:30\nSimulation mentale de la course", dist: 10, pace: "7:15", zone: "z2", intervals: null },
  ]},
  { n: 6, phase: "performance", title: "Peak — semaine la plus dure", vol: 32, sess: 4, sessions: [
    { day: 0, type: "recup", key: false, title: "Recup", desc: "5 km en Z1", dist: 5, pace: "8:30", zone: "z1", intervals: null },
    { day: 2, type: "fractionne", key: true, title: "Test allure", desc: "10 km · 5 km easy + 5 km a 6:00/km\nProuve a toi-meme que c'est possible", dist: 10, pace: "6:00", zone: "z2-z3", intervals: null },
    { day: 4, type: "fartlek", key: false, title: "Fartlek court", desc: "6 km · 6x (45s rapide Z4 + 90s recup)\nTravaille la vitesse de base", dist: 6, pace: null, zone: "z2-z4", intervals: { reps: 6, work: "45s rapide Z4", rest: "90s recup" } },
    { day: 6, type: "sortie_longue", key: false, title: "Sortie longue finale", desc: "11 km en Z2\nDernier long run avant la course", dist: 11, pace: "7:30", zone: "z2", intervals: null },
  ]},
  { n: 7, phase: "taper", title: "Affutage — conserve les gains", vol: 15, sess: 3, sessions: [
    { day: 1, type: "fondamentale", key: false, title: "Sortie cool", desc: "5 km en Z2\nPas d'effort, entretien", dist: 5, pace: "7:15", zone: "z2", intervals: null },
    { day: 3, type: "fractionne", key: true, title: "Rappel allure", desc: "5 km · 2x (5 min a 5:55 + 4 min Z1)\nRappeler au corps l'allure cible", dist: 5, pace: "5:55", zone: "z3", intervals: { reps: 2, work: "5 min a 5:55", rest: "4 min Z1" } },
    { day: 5, type: "recup", key: false, title: "Footing leger", desc: "5 km en Z1\nDerniere sortie — jambes fraiches dimanche", dist: 5, pace: "8:30", zone: "z1", intervals: null },
  ]},
  { n: 8, phase: "race", title: "Race Week — Sub 1h", vol: 10, sess: 2, sessions: [
    { day: 2, type: "recup", key: false, title: "Legere activation", desc: "20 min footing Z1 + 4x 30s a allure cible", dist: 3, pace: "8:00", zone: "z1", intervals: null },
    { day: 6, type: "course", key: true, title: "10 km — Sub 1h", desc: "Part a 6:05-6:10 les 5 premiers km\nLache les chevaux km 6-8 · Finish fort", dist: 10, pace: "5:55", zone: "z3", intervals: null },
  ]},
];

export async function seedPlan(userId: string) {
  const [plan] = await db
    .insert(plans)
    .values({
      userId,
      name: "10 KM — Sub 1h",
      targetDistance: 10,
      targetTime: "1:00:00",
      targetPace: "6:00",
      durationWeeks: 8,
      startDate: new Date().toISOString().split("T")[0],
      isActive: true,
      zones: {
        z1: { name: "Recup", min: "8:00", max: "9:00", desc: "Conversation facile, respiration nasale possible" },
        z2: { name: "Fondamentale", min: "7:00", max: "7:45", desc: "Ton zone actuel — socle aerobie, la plus utile" },
        z3: { name: "Objectif", min: "5:50", max: "6:15", desc: "Allure cible 10km. Effort soutenu, parler par phrases courtes" },
        z4: { name: "Seuil", min: "5:10", max: "5:40", desc: "Fractionne court, inconfort controle" },
      },
    })
    .returning();

  for (const w of WEEKS) {
    const [week] = await db
      .insert(planWeeks)
      .values({ planId: plan.id, weekNumber: w.n, phase: w.phase, title: w.title, targetVolumeKm: w.vol, targetSessions: w.sess })
      .returning();

    for (const s of w.sessions) {
      await db.insert(planSessions).values({
        weekId: week.id,
        dayOfWeek: s.day,
        type: s.type,
        isKeySession: s.key,
        title: s.title,
        description: s.desc,
        targetDistanceKm: s.dist,
        targetPace: s.pace,
        targetZone: s.zone,
        intervals: s.intervals,
      });
    }
  }

  return plan;
}
