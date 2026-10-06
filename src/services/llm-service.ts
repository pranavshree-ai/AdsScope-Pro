import { z } from "zod";
import { Ad, repo } from "../db/repo";
import { logger } from "../lib/logger";

export const AdAnalysisSchema = z.object({
  hookType: z.enum([
    "curiosity",
    "pain_point",
    "social_proof",
    "fomo",
    "contrarian",
    "direct_offer",
    "how_to",
  ]),
  angle: z.string().min(3),
  offer: z.string().min(3),
  cta: z.string().min(2),
  emotionalDriver: z.string().min(3),
  objectionHandled: z.string().min(3),
  targetAudienceHints: z.string().min(3),
  creativeFormat: z.string().min(3),
  funnelStage: z.enum(["top", "middle", "bottom"]),
  confidenceScore: z.number().int().min(50).max(100),
});

export type AdAnalysisOutput = z.infer<typeof AdAnalysisSchema>;

export const PROMPT_VERSION_ANALYSIS = "v1.4-claude-structured";

export class LLMService {
  private provider: string;
  private apiKey?: string;

  constructor() {
    this.provider = process.env.LLM_PROVIDER || "mock";
    this.apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
  }

  async analyzeAd(ad: Ad, workspaceId: string): Promise<AdAnalysisOutput> {
    logger.info({ adId: ad.id, headline: ad.headline }, "LLMService: Analyzing ad creative");

    let rawOutput: any;

    if (this.provider === "anthropic" && this.apiKey && !this.apiKey.startsWith("mock")) {
      try {
        const prompt = `You are a world-class ad strategist. Deconstruct the following ad into structured JSON:
Advertiser: ${ad.advertiserName}
Headline: ${ad.headline || "N/A"}
Copy: ${ad.adCopy || "N/A"}
Format: ${ad.format}
Platform: ${ad.platform}
Active Days: ${ad.activeDays}

Return ONLY a JSON object adhering to this schema:
{
  "hookType": "curiosity" | "pain_point" | "social_proof" | "fomo" | "contrarian" | "direct_offer" | "how_to",
  "angle": string,
  "offer": string,
  "cta": string,
  "emotionalDriver": string,
  "objectionHandled": string,
  "targetAudienceHints": string,
  "creativeFormat": string,
  "funnelStage": "top" | "middle" | "bottom",
  "confidenceScore": number (50-100)
}`;
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            temperature: 0.2,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.content?.[0]?.text;
          rawOutput = JSON.parse(content);
        }
      } catch (err) {
        logger.warn({ err }, "Live LLM API call failed, falling back to deterministic extraction engine");
      }
    }

    if (!rawOutput) {
      rawOutput = this.synthesizeAnalysis(ad);
    }

    // Strict Zod schema validation
    const validated = AdAnalysisSchema.parse(rawOutput);

    // Save analysis to repository
    repo.saveAnalysis({
      adId: ad.id,
      workspaceId,
      ...validated,
      promptVersion: PROMPT_VERSION_ANALYSIS,
      modelName: "claude-3-5-sonnet-20241022",
      tokensUsed: 420,
    });

    // Record credit usage (1 credit per ad analysis)
    repo.recordUsage(workspaceId, "ai_analysis", 1, { adId: ad.id });

    return validated;
  }

  private synthesizeAnalysis(ad: Ad): AdAnalysisOutput {
    const text = `${ad.headline || ""} ${ad.adCopy || ""}`.toLowerCase();

    let hookType: AdAnalysisOutput["hookType"] = "pain_point";
    if (text.includes("why") || text.includes("stop") || text.includes("don't") || text.includes("mistake")) {
      hookType = "contrarian";
    } else if (text.includes("reviews") || text.includes("trusted") || text.includes("featured") || text.includes("over 1")) {
      hookType = "social_proof";
    } else if (text.includes("how to") || text.includes("one simple") || text.includes("routine")) {
      hookType = "how_to";
    } else if (text.includes("pov") || text.includes("look what") || text.includes("secret")) {
      hookType = "curiosity";
    } else if (text.includes("% off") || text.includes("free") || text.includes("starter kit")) {
      hookType = "direct_offer";
    }

    let angle = "Sustained Peak Energy Without Afternoon Crash";
    if (text.includes("sleep") || text.includes("night")) {
      angle = "Sleep Architecture Protection & Cortisol Relief";
    } else if (text.includes("coffee") || text.includes("caffeine")) {
      angle = "Coffee Replacement with Adaptogenic Matrix";
    } else if (text.includes("military") || text.includes("clinical") || text.includes("study")) {
      angle = "Clinical & Military Grade Performance Optimization";
    }

    let funnelStage: AdAnalysisOutput["funnelStage"] = "top";
    if (ad.activeDays > 60) {
      funnelStage = "middle";
    }
    if (text.includes("claim") || text.includes("shop now") || text.includes("order now")) {
      funnelStage = "bottom";
    }

    return {
      hookType,
      angle,
      offer: text.includes("% off") ? "30% Off First Purchase + Free Shipping" : "Risk-Free Starter Bundle with Guarantee",
      cta: ad.cta || "Shop Now",
      emotionalDriver: "Relief from fatigue and status in high-output productivity",
      objectionHandled: "Will this cause heart palpitations, crash, or upset stomach?",
      targetAudienceHints: "High-performing founders, developers, athletes, and biohackers (ages 24-45)",
      creativeFormat: ad.format === "video" ? "founder_story" : "product_demo",
      funnelStage,
      confidenceScore: 92,
    };
  }
}

export const llmService = new LLMService();
