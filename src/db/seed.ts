import { repo } from "./repo";
import { logger } from "../lib/logger";

export function seedDemoData() {
  logger.info("Starting demo data seeding...");

  // 1. Workspaces
  const acmeWs = repo.createWorkspace({
    id: "ws_acme_growth",
    name: "Acme Growth Labs",
    slug: "acme-growth",
    planTier: "pro",
    aiCreditsBalance: 850,
  });

  const agencyWs = repo.createWorkspace({
    id: "ws_apex_agency",
    name: "Apex Performance Agency",
    slug: "apex-agency",
    planTier: "agency",
    aiCreditsBalance: 4200,
  });

  // 2. Users & Memberships
  const alexUser = repo.createUser({
    id: "usr_alex_rivera",
    email: "alex@acmegrowth.io",
    name: "Alex Rivera",
    role: "user",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  });

  const superAdmin = repo.createUser({
    id: "usr_admin",
    email: "admin@adscope.io",
    name: "AdScope SuperAdmin",
    role: "superadmin",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  });

  repo.createMembership(acmeWs.id, alexUser.id, "owner");
  repo.createMembership(agencyWs.id, alexUser.id, "admin");
  repo.createMembership(acmeWs.id, superAdmin.id, "admin");

  // 3. Niches
  const energyNiche = repo.createNiche(acmeWs.id, {
    id: "nic_clean_energy",
    name: "Clean Energy & Nootropics",
    category: "Functional Beverage & D2C Wellness",
    region: "US",
    language: "en",
    targetAudience: "Entrepreneurs, founders, engineers, and high-performance fitness enthusiasts (ages 24-48)",
    description: "Natural caffeine, l-theanine, lion's mane, and adaptogenic focus shots replacing synthetic energy drinks.",
  });

  const b2bNiche = repo.createNiche(acmeWs.id, {
    id: "nic_b2b_sales",
    name: "B2B AI Sales Automation",
    category: "SaaS & AI Infrastructure",
    region: "US",
    language: "en",
    targetAudience: "VPs of Sales, RevOps Directors, Growth Marketers, and B2B SaaS Founders",
    description: "AI SDRs and automated multi-channel outbound email & LinkedIn prospecting tools.",
  });

  // 4. Competitors for Energy Niche
  const magicMind = repo.createCompetitor(acmeWs.id, {
    id: "cmp_magic_mind",
    nicheId: energyNiche.id,
    name: "Magic Mind",
    domain: "magicmind.com",
    pageIdMeta: "109849284729102",
    logoUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120",
    isActive: true,
  });

  const properWild = repo.createCompetitor(acmeWs.id, {
    id: "cmp_proper_wild",
    nicheId: energyNiche.id,
    name: "Proper Wild",
    domain: "properwild.com",
    pageIdMeta: "298492847118294",
    logoUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=120",
    isActive: true,
  });

  const hvmn = repo.createCompetitor(acmeWs.id, {
    id: "cmp_hvmn",
    nicheId: energyNiche.id,
    name: "Ketone-IQ (H.V.M.N.)",
    domain: "hvmn.com",
    pageIdMeta: "492819284910238",
    logoUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=120",
    isActive: true,
  });

  const ag1 = repo.createCompetitor(acmeWs.id, {
    id: "cmp_ag1",
    nicheId: energyNiche.id,
    name: "AG1 (Athletic Greens)",
    domain: "drinkag1.com",
    pageIdMeta: "948291039482019",
    logoUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120",
    isActive: true,
  });

  // 5. Public Ads & Analyses
  const adsData = [
    {
      id: "ad_mm_01",
      competitorId: magicMind.id,
      platform: "meta" as const,
      externalAdId: "meta_102938491_01",
      advertiserName: "Magic Mind",
      headline: "The World's First Mental Performance Shot",
      adCopy: "Stop drinking 4 cups of bitter coffee that ruin your sleep at 2 AM. Magic Mind combines ceremonial matcha, lion's mane, and bacopa to unlock 7 hours of smooth, jitter-free flow state. Over 1,000,000+ bottles delivered to founders and creatives.",
      cta: "Shop Now (Up to 48% Off)",
      format: "video" as const,
      activeDays: 142, // Longevity winner!
      firstSeenAt: new Date(Date.now() - 142 * 86400000).toISOString(),
      thumbnailUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
      creativeUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200",
      landingPageUrl: "https://magicmind.com/trial-pack",
      analysis: {
        hookType: "contrarian" as const,
        angle: "Coffee Replacement & Jitter-Free Flow",
        offer: "48% off first subscription + 100% money-back guarantee",
        cta: "Shop Now",
        emotionalDriver: "relief & sustained focus",
        objectionHandled: "Does it cause afternoon crashes or heart palpitations?",
        targetAudienceHints: "High-output professionals exhausted by caffeine tolerance",
        creativeFormat: "founder_story",
        funnelStage: "top" as const,
      },
    },
    {
      id: "ad_mm_02",
      competitorId: magicMind.id,
      platform: "meta" as const,
      externalAdId: "meta_102938491_02",
      advertiserName: "Magic Mind",
      headline: "Why Neuroscientists Don't Touch Red Bull",
      adCopy: "Most energy drinks spike your blood sugar with 27g of refined syrup and 200mg synthetic caffeine. Look what happened when Dr. Andrew analyzed our adaptogen matrix. Clean dopamine support without adenosine crash.",
      cta: "Claim Your Starter Kit",
      format: "video" as const,
      activeDays: 98, // Longevity winner!
      firstSeenAt: new Date(Date.now() - 98 * 86400000).toISOString(),
      thumbnailUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600",
      creativeUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=1200",
      landingPageUrl: "https://magicmind.com/neuro-study",
      analysis: {
        hookType: "social_proof" as const,
        angle: "Clinical Comparison vs Toxic Energy Drinks",
        offer: "Starter Kit with free travel tin",
        cta: "Claim Your Starter Kit",
        emotionalDriver: "health security & superiority",
        objectionHandled: "Is this clinically proven or just marketing hype?",
        targetAudienceHints: "Health-conscious biohackers and tech workers",
        creativeFormat: "product_demo",
        funnelStage: "middle" as const,
      },
    },
    {
      id: "ad_pw_01",
      competitorId: properWild.id,
      platform: "meta" as const,
      externalAdId: "meta_293847102_01",
      advertiserName: "Proper Wild",
      headline: "2x More Caffeine Than Red Bull. 0g Sugar. Zero Jitters.",
      adCopy: "Powered by Organic Caffeine & 15x More L-Theanine than green tea. Proper Wild gives you clean all-day focus without the crash. Tastes like real blackberry & peach. 60-Day money-back guarantee.",
      cta: "Try Risk Free (30% Off)",
      format: "carousel" as const,
      activeDays: 165, // Longevity winner!
      firstSeenAt: new Date(Date.now() - 165 * 86400000).toISOString(),
      thumbnailUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600",
      creativeUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200",
      landingPageUrl: "https://properwild.com/collections/clean-energy",
      analysis: {
        hookType: "direct_offer" as const,
        angle: "Raw Performance & Taste Superiority",
        offer: "30% off sample 6-pack with free shipping",
        cta: "Try Risk Free",
        emotionalDriver: "saving time & peak athletic stamina",
        objectionHandled: "Does it taste terrible like typical herbal shots?",
        targetAudienceHints: "Athletes, gym-goers, and busy college graduates",
        creativeFormat: "before_after",
        funnelStage: "bottom" as const,
      },
    },
    {
      id: "ad_pw_02",
      competitorId: properWild.id,
      platform: "tiktok" as const,
      externalAdId: "tiktok_827103948_01",
      advertiserName: "Proper Wild",
      headline: "POV: You switched your pre-workout to clean L-Theanine shots",
      adCopy: "No skin tingles. No heart racing. Just pure hyper-focus for 4 straight hours of deep work and lifting. Tap below before the peach flavor sells out again!",
      cta: "Get Yours Now",
      format: "video" as const,
      activeDays: 34,
      firstSeenAt: new Date(Date.now() - 34 * 86400000).toISOString(),
      thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600",
      creativeUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200",
      landingPageUrl: "https://properwild.com/tiktok-special",
      analysis: {
        hookType: "curiosity" as const,
        angle: "UGC Lifestyle & Pre-workout Replacement",
        offer: "TikTok limited bundle 20% off",
        cta: "Get Yours Now",
        emotionalDriver: "status & physical euphoria",
        objectionHandled: "Will it make me anxious like pre-workout powders?",
        targetAudienceHints: "Gen-Z and young millennials into fitness and productivity",
        creativeFormat: "ugc",
        funnelStage: "top" as const,
      },
    },
    {
      id: "ad_hvmn_01",
      competitorId: hvmn.id,
      platform: "google" as const,
      externalAdId: "google_482910394_01",
      advertiserName: "Ketone-IQ (H.V.M.N.)",
      headline: "Drink Ketones for Clean Brain Fuel | Developed with US Special Forces",
      adCopy: "Ketones are 28% more efficient than glucose. Elevate ketone levels safely in 30 minutes. Trusted by Tour de France cyclists, Olympic rowers, and elite pilots. Zero sugar, zero caffeine.",
      cta: "Learn More & Order",
      format: "image" as const,
      activeDays: 184, // Highest Longevity winner!
      firstSeenAt: new Date(Date.now() - 184 * 86400000).toISOString(),
      thumbnailUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600",
      creativeUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=1200",
      landingPageUrl: "https://hvmn.com/products/ketone-iq",
      analysis: {
        hookType: "social_proof" as const,
        angle: "Military & Elite Athletic Endorsement",
        offer: "Subscribe & Save 20% with free travel flask",
        cta: "Learn More & Order",
        emotionalDriver: "status & peak intellectual edge",
        objectionHandled: "Is ketone drink safe and backed by peer-reviewed science?",
        targetAudienceHints: "Endurance athletes, venture capitalists, and biohackers",
        creativeFormat: "testimonial",
        funnelStage: "top" as const,
      },
    },
    {
      id: "ad_ag1_01",
      competitorId: ag1.id,
      platform: "meta" as const,
      externalAdId: "meta_948201928_01",
      advertiserName: "AG1 (Athletic Greens)",
      headline: "One Daily Scoop Replaces 9 Separate Health Supplements",
      adCopy: "Simplify your morning ritual with 75 vitamins, minerals, and whole-food sourced nutrients. Backed by Dr. Peter Attia and Tim Ferriss. Try AG1 today and get a FREE 1-year supply of Vitamin D3+K2 plus 5 Travel Packs.",
      cta: "Claim Free Vitamin D3 Gift",
      format: "video" as const,
      activeDays: 120, // Longevity winner!
      firstSeenAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      thumbnailUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
      creativeUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200",
      landingPageUrl: "https://drinkag1.com/podcast-offer",
      analysis: {
        hookType: "how_to" as const,
        angle: "Morning Routine Simplification & Habit Stacking",
        offer: "Free 1-year Vitamin D3 supply + 5 Travel Packs with first order",
        cta: "Claim Free Gift",
        emotionalDriver: "saving time & holistic vitality",
        objectionHandled: "Is $79/month too expensive for a green powder?",
        targetAudienceHints: "Health enthusiasts spending $100+/mo on multiple pill bottles",
        creativeFormat: "founder_story",
        funnelStage: "middle" as const,
      },
    },
  ];

  for (const item of adsData) {
    const { analysis, ...adFields } = item;
    const upserted = repo.upsertAd({
      ...adFields,
      workspaceId: acmeWs.id,
      contentHash: `hash_${item.id}`,
      firstSeenAt: item.firstSeenAt,
      lastSeenAt: new Date().toISOString(),
      activeDays: item.activeDays,
    });

    // Save Analysis
    repo.saveAnalysis({
      adId: upserted.ad.id,
      workspaceId: acmeWs.id,
      ...analysis,
      confidenceScore: 94,
      promptVersion: "v1.2-deepmind",
      modelName: "claude-3-5-sonnet",
      tokensUsed: 420,
    });

    // Save Landing Page details
    repo.saveLandingPage({
      adId: upserted.ad.id,
      destinationUrl: item.landingPageUrl,
      statusCode: 200,
      headline: item.headline,
      offer: analysis.offer,
      pricingCues: "$2.50 to $3.50 per serving ($48 - $79 boxes)",
      socialProof: "Over 10,000+ 5-star verified customer reviews, featured in Forbes, NYT, Huberman Lab",
      pageText: `${item.headline}. ${item.adCopy}`,
    });
  }

  // 6. Aggregate Insights & Whitespace
  repo.saveInsights({
    workspaceId: acmeWs.id,
    nicheId: energyNiche.id,
    hookDistribution: {
      contrarian: 28,
      social_proof: 34,
      direct_offer: 18,
      curiosity: 12,
      how_to: 8,
    },
    angleDistribution: {
      "No Crash / Jitter-Free": 42,
      "Elite Endorsements / Biohack": 26,
      "Coffee Replacement": 18,
      "Taste & Organic Quality": 14,
    },
    formatDistribution: {
      video: 55,
      ugc: 25,
      carousel: 12,
      image: 8,
    },
    longevityWinners: [
      {
        adId: "ad_hvmn_01",
        advertiser: "Ketone-IQ (H.V.M.N.)",
        activeDays: 184,
        hook: "Developed with US Special Forces",
        angle: "Military & Elite Athletic Endorsement",
      },
      {
        adId: "ad_pw_01",
        advertiser: "Proper Wild",
        activeDays: 165,
        hook: "2x More Caffeine Than Red Bull. 0g Sugar. Zero Jitters.",
        angle: "Raw Performance & Taste Superiority",
      },
      {
        adId: "ad_mm_01",
        advertiser: "Magic Mind",
        activeDays: 142,
        hook: "Stop drinking 4 cups of bitter coffee",
        angle: "Coffee Replacement & Jitter-Free Flow",
      },
      {
        adId: "ad_ag1_01",
        advertiser: "AG1",
        activeDays: 120,
        hook: "One Daily Scoop Replaces 9 Separate Supplements",
        angle: "Morning Routine Simplification",
      },
    ],
    creativeVelocity: [
      { competitor: "Magic Mind", weeklyNewAds: 6.2, trend: "+18%" },
      { competitor: "Proper Wild", weeklyNewAds: 4.5, trend: "+5%" },
      { competitor: "Ketone-IQ", weeklyNewAds: 3.1, trend: "-10%" },
      { competitor: "AG1", weeklyNewAds: 9.4, trend: "+32%" },
    ],
    whitespaceGaps: [
      {
        gap: "Deep Sleep & Evening Decompression",
        description: "All major competitors fight over morning 8 AM energy; almost zero ads address the 5 PM transition or clean afternoon de-stressing without caffeine.",
        potentialScore: 92,
        recommendedHook: "Why your 4 PM coffee is killing your deep sleep score",
      },
      {
        gap: "Executive Focus for High-Stakes Negotiations",
        description: "Competitors skew either heavily athletic (gym) or generic startup work. Direct positioning for sales leaders and attorneys needing 90-minute hyper-clarity is virtually untouched.",
        potentialScore: 88,
        recommendedHook: "The 2oz shot closing $500k deals before lunch",
      },
      {
        gap: "Transparency on Artificial Sweetener Aftertaste",
        description: "Consumers consistently complain in reviews about stevia/monkfruit aftertaste. A clear zero-aftertaste natural honey/fruit wedge angle has minimal competitive noise.",
        potentialScore: 84,
        recommendedHook: "Finally an adaptogen shot that doesn't taste like ground chalk",
      },
    ],
  });

  // 7. Grounded Strategy with Evidence Citations
  repo.saveStrategy(
    {
      workspaceId: acmeWs.id,
      nicheId: energyNiche.id,
      title: "Clean Energy Dominance: Q4 Disruptor Roadmap",
      brandProfile: {
        productName: "Aura Flow Nootropic Elixir",
        description: "Sparkling cold-pressed yuzu nootropic beverage infused with Alpha-GPC, L-Theanine, and wild green tea extract.",
        targetAudience: "Ambitious tech professionals, designers, and high-performance creators aged 25-42.",
        usp: "Zero jitters, 6 hours of clean cognition, exquisite natural citrus taste, zero artificial sweeteners.",
        pricePoint: "$3.75/can ($45 per 12-pack)",
      },
      positioningGaps: [
        {
          gap: "Afternoon Slump Without Ruining Sleep",
          opportunity: "Target the 2:30 PM slump where competitors fail to emphasize sleep architecture safety.",
          recommendedAngle: "The 2:30 PM Rescue Shot That Won't Keep You Up At Midnight",
          evidenceAdIds: ["ad_mm_01", "ad_pw_01"],
        },
        {
          gap: "Taste & Sensorial Experience",
          opportunity: "Differentiate from bitter herbal earthy shots with a crisp sparkling citrus experience.",
          recommendedAngle: "Nootropics Don't Have To Taste Like Pond Water",
          evidenceAdIds: ["ad_pw_01", "ad_mm_02"],
        },
      ],
      twoWeekTestPlan: [
        {
          dayRange: "Days 1 - 4",
          hypothesis: "Direct callout of coffee-induced 2 PM crashes will outperform generic 'energy boost' hooks by 2.4x CTR.",
          conceptIds: ["Concept A: The 2:30 PM Wall", "Concept B: The Cortisol Trap"],
          kpi: "CTR > 2.8%, Hook Stop Rate > 35%",
        },
        {
          dayRange: "Days 5 - 9",
          hypothesis: "Blind taste reaction UGC addressing competitor bitterness objection will convert high-intent cold traffic.",
          conceptIds: ["Concept C: The Blind Sip Test", "Concept D: What Founders Actually Drink"],
          kpi: "Landing Page CVR > 4.5%, Cost Per Add to Cart < $18",
        },
        {
          dayRange: "Days 10 - 14",
          hypothesis: "Comparison table vs Red Bull and Magic Mind highlighting sleep preservation will scale at target $35 CAC.",
          conceptIds: ["Concept E: The Nutrition Label Battle", "Concept F: 6 Hours of Flow"],
          kpi: "Blended ROAS > 2.2x, CAC < $35",
        },
      ],
    },
    [
      {
        conceptTitle: "The 2:30 PM Wall (Coffee Crash Callout)",
        hook: "If your 2 PM coffee gives you heart palpitations instead of focus, you're treating the wrong problem.",
        copyVariants: [
          "Coffee spikes your cortisol and leaves you crashed by 3:15 PM. Aura Flow pairs organic L-Theanine with Alpha-GPC to trigger pure alpha brainwaves for 6 straight hours of deep work.",
          "Most energy drinks are just liquid panic attacks. Aura Flow gives you smooth, calm cognitive momentum without the 3 PM shakes.",
        ],
        creativeDirection: "Split screen: Tired worker staring at an empty coffee cup rubbing temples vs. calm energetic professional finishing a keynote presentation with Aura Flow can on desk.",
        angle: "Crash Avoidance & Cortisol Regulation",
        funnelStage: "top",
        citedAdIds: ["ad_mm_01", "ad_pw_01"],
      },
      {
        conceptTitle: "The Blind Sip Test (The Taste Disruption)",
        hook: "I gave 50 tech founders our nootropic elixir vs the #1 selling competitor shot. Here's what happened.",
        copyVariants: [
          "Every adaptogen shot on the market tastes like bitter dirt. We spent 18 months perfecting organic cold-pressed Yuzu citrus with zero stevia aftertaste.",
          "Who said clean focus had to taste awful? 94% chose Aura Flow blind. Try risk-free today with 100% money back guarantee.",
        ],
        creativeDirection: "Fast-paced sidewalk or co-working space blind taste reaction UGC video. Candid genuine reactions to the crisp citrus taste.",
        angle: "Taste Superiority & Zero Bitter Aftertaste",
        funnelStage: "middle",
        citedAdIds: ["ad_pw_01", "ad_mm_02"],
      },
      {
        conceptTitle: "The Military Formula vs Daily Routine",
        hook: "Ketones are great for Navy SEALs, but what about the rest of us writing code and running companies?",
        copyVariants: [
          "You don't need $120 tactical ketone esters to stay sharp for a 3-hour product roadmap sprint. Aura Flow delivers exact nootropic compounds your brain needs for effortless focus.",
        ],
        creativeDirection: "Clean side-by-side comparison graphics with clean typography and minimalist laboratory aesthetic.",
        angle: "Accessible Cognitive Optimization",
        funnelStage: "top",
        citedAdIds: ["ad_hvmn_01", "ad_ag1_01"],
      },
    ]
  );

  // 8. Monitors & Alerts
  const monitor1 = repo.createMonitor(acmeWs.id, {
    competitorId: magicMind.id,
    nicheId: energyNiche.id,
    ruleType: "new_offer",
    config: { thresholdDays: 1, emailNotification: true },
    isActive: true,
  });

  const monitor2 = repo.createMonitor(acmeWs.id, {
    competitorId: properWild.id,
    nicheId: energyNiche.id,
    ruleType: "velocity_spike",
    config: { thresholdDays: 7, slackWebhook: "https://hooks.slack.com/services/demo" },
    isActive: true,
  });

  repo.createAlert(acmeWs.id, {
    monitorId: monitor1.id,
    title: "New Competitor Offer Detected: Magic Mind 48% Off Starter Bundle",
    message: "Magic Mind launched a new promotional angle offering up to 48% discount on subscriptions with free travel tins.",
    severity: "warning",
    channel: "in_app",
    status: "unread",
    payload: { competitor: "Magic Mind", offer: "48% Off Starter Kit" },
  });

  repo.createAlert(acmeWs.id, {
    monitorId: monitor2.id,
    title: "Creative Velocity Spike: Proper Wild launched 6 new ads this week",
    message: "Proper Wild increased their weekly ad launch rate by 40% focusing heavily on TikTok UGC videos.",
    severity: "info",
    channel: "in_app",
    status: "unread",
    payload: { competitor: "Proper Wild", count: 6 },
  });

  // 9. Initial Jobs
  repo.createJob(acmeWs.id, {
    type: "sync_ads",
    status: "completed",
    progress: 100,
    payload: { nicheId: energyNiche.id, platform: "meta" },
    result: { collectedAdsCount: 6, newAdsCount: 2, deduplicatedCount: 4 },
  });

  repo.createJob(acmeWs.id, {
    type: "analyze_ad",
    status: "completed",
    progress: 100,
    payload: { adId: "ad_mm_01" },
    result: { hookType: "contrarian", angle: "Coffee Replacement" },
  });

  // 10. Usage records
  repo.recordUsage(acmeWs.id, "ad_sync", 10, { adsSynced: 6 });
  repo.recordUsage(acmeWs.id, "ai_analysis", 30, { adsAnalyzed: 6 });
  repo.recordUsage(acmeWs.id, "strategy_generation", 50, { strategyTitle: "Clean Energy Dominance: Q4 Disruptor Roadmap" });

  logger.info("Demo data seeding completed successfully!");
}

// Run if called directly
if (process.argv[1]?.includes("seed")) {
  seedDemoData();
}
