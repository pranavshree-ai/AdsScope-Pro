export type PlanTier = "free_trial" | "starter" | "pro" | "agency";

export interface PlanLimits {
  name: string;
  priceMonthly: number; // in cents
  maxCompetitors: number;
  maxNiches: number;
  refreshFrequencyHours: number;
  aiCreditsPerMonth: number;
  maxTeamSeats: number;
  exportPdf: boolean;
  whiteLabel: boolean;
  webhookAlerts: boolean;
  supportLevel: "community" | "standard" | "priority" | "dedicated";
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free_trial: {
    name: "Free Trial (14 Days)",
    priceMonthly: 0,
    maxCompetitors: 3,
    maxNiches: 1,
    refreshFrequencyHours: 48,
    aiCreditsPerMonth: 50,
    maxTeamSeats: 1,
    exportPdf: false,
    whiteLabel: false,
    webhookAlerts: false,
    supportLevel: "community",
  },
  starter: {
    name: "Starter",
    priceMonthly: 4900,
    maxCompetitors: 10,
    maxNiches: 3,
    refreshFrequencyHours: 24,
    aiCreditsPerMonth: 250,
    maxTeamSeats: 2,
    exportPdf: true,
    whiteLabel: false,
    webhookAlerts: true,
    supportLevel: "standard",
  },
  pro: {
    name: "Growth Pro",
    priceMonthly: 12900,
    maxCompetitors: 30,
    maxNiches: 10,
    refreshFrequencyHours: 12,
    aiCreditsPerMonth: 1000,
    maxTeamSeats: 5,
    exportPdf: true,
    whiteLabel: false,
    webhookAlerts: true,
    supportLevel: "priority",
  },
  agency: {
    name: "Agency Scale",
    priceMonthly: 29900,
    maxCompetitors: 100,
    maxNiches: 50,
    refreshFrequencyHours: 6,
    aiCreditsPerMonth: 5000,
    maxTeamSeats: 20,
    exportPdf: true,
    whiteLabel: true,
    webhookAlerts: true,
    supportLevel: "dedicated",
  },
};

export function canAddCompetitor(currentCount: number, tier: PlanTier): boolean {
  return currentCount < PLAN_LIMITS[tier].maxCompetitors;
}

export function canAddNiche(currentCount: number, tier: PlanTier): boolean {
  return currentCount < PLAN_LIMITS[tier].maxNiches;
}

export function hasSufficientCredits(currentBalance: number, requiredCredits: number): boolean {
  return currentBalance >= requiredCredits;
}
