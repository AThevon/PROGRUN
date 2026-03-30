export interface Zone {
  name: string;
  min: string;
  max: string;
  desc: string;
}
export type Zones = Record<string, Zone>;

export const DEFAULT_ZONES: Zones = {
  z1: { name: "Recup", min: "8:00", max: "9:00", desc: "Conversation facile" },
  z2: { name: "Fondamentale", min: "7:00", max: "7:45", desc: "Socle aerobie" },
  z3: { name: "Objectif", min: "5:50", max: "6:15", desc: "Allure cible 10km" },
  z4: { name: "Seuil", min: "5:10", max: "5:40", desc: "Fractionne court" },
};

export const PHASE_COLORS: Record<string, string> = {
  build: "#81c784",
  recovery: "#4fc3f7",
  performance: "#ff6b35",
  taper: "#4fc3f7",
  race: "#e8ff47",
};
