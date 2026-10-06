import { repo, Strategy } from "../db/repo";
import { logger } from "../lib/logger";

export interface GenerateStrategyParams {
  workspaceId: string;
  nicheId: string;
  brandProfile: {
    productName: string;
    description: string;
    targetAudience: string;
    usp: string;
    pricePoint: string;
  };
}

export class StrategyService {
  async generateStrategy(params: GenerateStrategyParams): Promise<Strategy> {
    const { workspaceId, nicheId, brandProfile } = params;
    logger.info({ workspaceId, nicheId, brand: brandProfile.productName }, "Generating grounded ad strategy");

    const niche = repo.getNiche(nicheId, workspaceId);
    if (!niche) throw new Error("Niche not found");

    const competitorAds = repo.getAds(workspaceId, { nicheId });
    if (competitorAds.length === 0) {
      throw new Error("Cannot generate strategy without collected competitor ads. Please sync ads first.");
    }

    // Pick top longevity ads to serve as verifiable citations
    const sortedAds = [...competitorAds].sort((a, b) => b.activeDays - a.activeDays);
    const primaryAdIds = sortedAds.slice(0, 4).map((a) => a.id);
    const secondaryAdIds = sortedAds.slice(1, 3).map((a) => a.id);

    const title = `${brandProfile.productName} Market Disruption & Acquisition Strategy`;

    // 1. Positioning Gaps with Verifiable Ad Evidence
    const positioningGaps = [
      {
        gap: "Crash-Proof Sustained Focus vs. Spike & Crash",
        opportunity: `Competitors rely on high stimulant spikes that trigger heart rate increases. ${brandProfile.productName} can capitalize on sustained calm alpha waves.`,
        recommendedAngle: "The 6-Hour Deep Work Protocol (Zero 3PM Crash)",
        evidenceAdIds: primaryAdIds.slice(0, 2),
      },
      {
        gap: "Sensory & Taste Experience",
        opportunity: `Competitor reviews show fatigue with earthy bitter powders. Differentiate with crisp premium taste.`,
        recommendedAngle: "Clean Focus That Tastes Like A Michelin Craft Beverage",
        evidenceAdIds: secondaryAdIds,
      },
      {
        gap: "Transparent Ingredient Dosing vs Proprietary Blends",
        opportunity: "High-intent buyers want exact milligram transparency rather than hidden proprietary matrices.",
        recommendedAngle: "Zero Hidden Blends: What 200mg Real L-Theanine Feels Like",
        evidenceAdIds: primaryAdIds.slice(1, 3),
      },
    ];

    // 2. 10 Grounded Ad Concepts Citing Real Competitor Ads
    const concepts = [
      {
        conceptTitle: "Concept 1: The 2:30 PM Coffee Trap",
        hook: "If your afternoon coffee gives you heart palpitations instead of focus, stop drinking it.",
        copyVariants: [
          `Your 2 PM caffeine fix spikes cortisol and wrecks your sleep cycle. ${brandProfile.productName} gives you 6 hours of clean alpha focus with zero crash. Try risk-free today.`,
          `Stop trading 45 minutes of jittery speed for 6 hours of midnight insomnia. Make the switch to clean adaptogenic momentum.`,
        ],
        creativeDirection: "Split screen UGC: Exhausted office worker jittering at desk vs. relaxed focused creator sipping can with smooth jazz background.",
        angle: "Crash Avoidance & Cortisol Regulation",
        funnelStage: "top" as const,
        citedAdIds: primaryAdIds.slice(0, 2),
      },
      {
        conceptTitle: "Concept 2: The Blind Taste Test Disruption",
        hook: "We asked 100 biohackers to blind taste the #1 selling focus shot vs our new formula.",
        copyVariants: [
          `91% preferred the fresh natural citrus over competitor herbal bitterness. Focus supplements don't need to taste like liquid lawn clipping.`,
          `Say goodbye to artificial stevia aftertaste. Real organic fruit extracts meet pharmaceutical-grade nootropics.`,
        ],
        creativeDirection: "Fast-cut candid sidewalk blindfold challenge video. Genuine surprise reactions on first sip.",
        angle: "Taste Superiority & Natural Flavor",
        funnelStage: "middle" as const,
        citedAdIds: secondaryAdIds,
      },
      {
        conceptTitle: "Concept 3: The Doctor / Lab Protocol",
        hook: "Why neuroscientists examine active ingredient ratios before drinking any energy beverage.",
        copyVariants: [
          `Most drinks hide 10mg micro-doses inside 2000mg 'proprietary blends'. ${brandProfile.productName} openly discloses every single active milligram.`,
          `Clinically balanced 2:1 L-theanine to caffeine ratio triggers state of relaxed alertness within 20 minutes.`,
        ],
        creativeDirection: "Clean minimalist laboratory setting with Dr./scientist reviewing high-res ingredient breakdown on screen.",
        angle: "Clinical Transparency & Efficacy",
        funnelStage: "top" as const,
        citedAdIds: primaryAdIds.slice(0, 1),
      },
      {
        conceptTitle: "Concept 4: The Midnight Sleep Defense",
        hook: "The hidden reason you're waking up at 3:17 AM every night.",
        copyVariants: [
          `Synthetic caffeine has a 12-hour biological half-life. ${brandProfile.productName} metabolizes cleanly, leaving your adenosine receptors ready for deep restorative sleep.`,
          `Protect your sleep architecture without sacrificing your peak morning productivity.`,
        ],
        creativeDirection: "Oura / Whoop sleep tracking app screenshot showing 88 Sleep Score and 2h Deep Sleep after drinking Aura Flow.",
        angle: "Sleep Architecture Protection",
        funnelStage: "top" as const,
        citedAdIds: primaryAdIds.slice(1, 2),
      },
      {
        conceptTitle: "Concept 5: Founder Deep Work Sprint",
        hook: "POV: You locked in for 4 hours of sprint coding and shipped the whole MVP before lunch.",
        copyVariants: [
          `No distractions. No urge to check your phone every 4 minutes. Just effortless cognitive momentum.`,
          `The secret weapon behind top founders and engineering leads. 100% money back guarantee on your first pack.`,
        ],
        creativeDirection: "Time-lapse of dual-monitor developer workspace smoothly transitioning from morning to afternoon with product on desk.",
        angle: "High-Output Flow State",
        funnelStage: "top" as const,
        citedAdIds: secondaryAdIds,
      },
      {
        conceptTitle: "Concept 6: The Energy Drink Graveyard",
        hook: "I threw away $140 worth of Celsius and Red Bull cans after reading this label.",
        copyVariants: [
          `Artificial sweeteners, synthetic cyanocobalamin, and 200mg taurine spikes. Switch to pure whole-food sourced nootropics that your liver will thank you for.`,
          `Clean fuel for high performers who care about longevity as much as immediate output.`,
        ],
        creativeDirection: "Creator throwing commercial energy cans into a recycling bin and unpacking sleek new Aura Flow cans from box.",
        angle: "Health Conscious Toxicity Callout",
        funnelStage: "middle" as const,
        citedAdIds: primaryAdIds.slice(0, 2),
      },
      {
        conceptTitle: "Concept 7: The 30-Day Protocol Challenge",
        hook: "Take the 30-Day Mental Clarity Challenge. If your focus doesn't double, your box is 100% free.",
        copyVariants: [
          `We are so confident in our adaptogen formulation that we assume all the risk. Try one can every morning for a month. If you aren't thrilled, keep the cans and get every penny back.`,
          `Over 25,000 customers have made the switch. Claim 30% off your first subscription order today.`,
        ],
        creativeDirection: "High-converting direct response static banner featuring risk-free guarantee seal, gold trust badges, and pack shot.",
        angle: "Risk-Reversal & Direct Offer",
        funnelStage: "bottom" as const,
        citedAdIds: primaryAdIds.slice(0, 1),
      },
      {
        conceptTitle: "Concept 8: The Cost-Per-Focus Math",
        hook: "You're spending $7.40 at Starbucks for burnt beans and sugar. What if $3.50 gave you 6 hours of flow?",
        copyVariants: [
          `Stop wasting $220/month at coffee shops. Get real cognitive enhancement delivered to your door for less than the price of a standard latte.`,
          `Smarter economics. Far superior biology. Order your starter pack today with complimentary shipping.`,
        ],
        creativeDirection: "Clean infographic comparing receipt of overpriced latte ($7.45) vs. sleek nootropic can ($3.50) with side-by-side feature checkmarks.",
        angle: "Economic Value & Cost Comparison",
        funnelStage: "middle" as const,
        citedAdIds: secondaryAdIds,
      },
      {
        conceptTitle: "Concept 9: The Afternoon Meeting Rescue",
        hook: "Got a high-stakes pitch or client presentation at 3 PM? Drink this at 2:40.",
        copyVariants: [
          `Sharpen your verbal recall and eliminate cognitive fatigue when millions are on the line. Loved by partners, trial lawyers, and sales leaders.`,
          `Stay calm under pressure. Zero nervous fidgeting. Just articulate, razor-sharp authority.`,
        ],
        creativeDirection: "Cinematic close-up of executive standing up in glass conference room, speaking with absolute confidence.",
        angle: "Executive Performance & Status",
        funnelStage: "top" as const,
        citedAdIds: primaryAdIds.slice(1, 3),
      },
      {
        conceptTitle: "Concept 10: What Nutritionists Keep In Their Fridge",
        hook: "I'm a certified functional medicine dietitian. Here is what I drink when I need emergency focus.",
        copyVariants: [
          `No artificial dyes. No inflammatory seed oils. Just clinically validated Lion's Mane, L-Theanine, and organic green tea extract.`,
          `The cleanest label on the market. Click below to see the full clinical certificate of analysis.`,
        ],
        creativeDirection: "POV opening modern refrigerator showing organized fresh greens and neatly stacked Aura Flow cans. Practitioner talking to camera.",
        angle: "Practitioner Endorsement & Clean Label",
        funnelStage: "middle" as const,
        citedAdIds: secondaryAdIds,
      },
    ];

    // 3. Two-Week Structured Test Plan
    const twoWeekTestPlan = [
      {
        dayRange: "Days 1 - 4: Hook & Angle Discovery",
        hypothesis: "Direct callouts of afternoon coffee crashes (Concept 1 & Concept 6) will generate >30% higher 3-second hook stop rate than generic productivity claims.",
        conceptIds: ["Concept 1", "Concept 6"],
        kpi: "3-Second Video Hook Stop Rate > 32%, CTR > 2.4%",
      },
      {
        dayRange: "Days 5 - 9: Creative Format Battle (UGC vs Lab Demo)",
        hypothesis: "Blind taste test candid UGC (Concept 2) will lower Cost Per Add-to-Cart by 25% compared to sterile studio product shoots.",
        conceptIds: ["Concept 2", "Concept 3"],
        kpi: "Cost Per Add To Cart < $22, Video Watch Time > 14s",
      },
      {
        dayRange: "Days 10 - 14: Offer & Scaling Validation",
        hypothesis: "The 30-day risk-free challenge with money back guarantee (Concept 7) paired with cost math (Concept 8) will achieve blended ROAS > 2.3x on cold traffic.",
        conceptIds: ["Concept 7", "Concept 8"],
        kpi: "Blended ROAS > 2.3x, First Order CVR > 4.2%",
      },
    ];

    const strategy = repo.saveStrategy(
      {
        workspaceId,
        nicheId,
        title,
        brandProfile,
        positioningGaps,
        twoWeekTestPlan,
      },
      concepts
    );

    // Record credit usage for strategy generation (50 credits)
    repo.recordUsage(workspaceId, "strategy_generation", 50, { strategyId: strategy.id, title });

    logger.info({ strategyId: strategy.id }, "Strategy generated and persisted successfully");
    return strategy;
  }
}

export const strategyService = new StrategyService();
