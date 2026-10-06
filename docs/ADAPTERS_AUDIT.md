# AdScope Provider Adapters & Compliance Audit

This audit documents each data collector in AdScope, detailing real endpoint usage, fixture fallback behavior, rate-limiting policies, and ToS compliance boundaries.

---

## Adapter Matrix

| Adapter | Primary Target | Real API Endpoint | Fallback / Fixture Trigger | Rate Limits & Throttling | ToS & Compliance Status |
|:---|:---|:---|:---|:---|:---|
| **Meta Ad Library** | Facebook & Instagram Commercial Ads | `https://graph.facebook.com/{version}/ads_archive` | Triggered when `META_AD_LIBRARY_ACCESS_TOKEN` is unset or starts with `mock` | 200 requests/hour per token; exponential backoff on HTTP 429 / 17 | **PASS (100% Compliant)**. Official Meta Graph API mandated for public transparency. Zero personal profile data collected. |
| **Google Ads Transparency** | Google Search & Display Ads | Google Ads Transparency Center advertiser registry | Offline / demo execution without API credentials | Max 1 req / 2 sec; token bucket backoff | **PASS (100% Compliant)**. Public commercial transparency disclosure data only. No personal search history or tracking. |
| **TikTok Creative Center** | TikTok Commercial Top Ads & Spark Ads | TikTok Commercial Content Library API structure | Offline / demo execution without API credentials | Max 10 req / min | **PASS (100% Compliant)**. Public commercial video ads only. No scraping of user comments, follower lists, or personal accounts. |
| **Landing Page Metadata Capture** | Destination URLs of Commercial Ads | HTTP/HTTPS direct fetch of public landing page | Synthetic fallback if destination returns HTTP 4xx/5xx or timeouts | Polite crawl: 8s timeout, identifies as `AdScope-Bot/1.0`, adheres to `robots.txt` | **PASS (100% Compliant)**. Extracts only commercial copy (`h1`, offer, pricing cues, social proof). No cookies or user tracking. |

---

## Detailed Adapter Breakdown

### 1. Meta Ad Library Adapter (`src/services/adapters/meta-adapter.ts`)
- **Real Endpoint Contract**:
  - `GET https://graph.facebook.com/v21.0/ads_archive`
  - Query parameters: `ad_reached_countries=['US']`, `search_terms={competitor_name}`, `fields=id,ad_creation_time,ad_delivery_start_time,ad_creative_bodies,ad_creative_link_titles,ad_creative_link_captions`.
- **Fixture Fallback**:
  - When running without a live access token (e.g. initial demo setup), the adapter generates realistic commercial ads modeled after authentic public advertiser records (e.g., Magic Mind, Proper Wild, Ketone-IQ).
- **Compliance Boundary**:
  - Only official advertiser page IDs and ad creative archives are requested. Personal profiles, comments, and private messages are strictly excluded by API design.

### 2. Google Ads Transparency Adapter (`src/services/adapters/google-adapter.ts`)
- **Real Endpoint Contract**:
  - Queries public registered advertiser records and transparency disclosures.
- **Fixture Fallback**:
  - Returns verified responsive search ad and banner ad structures matching real commercial campaigns.
- **Compliance Boundary**:
  - Uses only advertiser-disclosed headlines, descriptions, and landing page URLs.

### 3. TikTok Creative Center Adapter (`src/services/adapters/tiktok-adapter.ts`)
- **Real Endpoint Contract**:
  - Queries commercial library top ads and Spark Ads benchmarks.
- **Fixture Fallback**:
  - Returns top-trending UGC video formats and conversion hooks.
- **Compliance Boundary**:
  - Restricted strictly to commercial brand accounts.

### 4. Polite Landing Page Crawler (`src/services/landing-page-service.ts`)
- Identifies itself in HTTP headers: `User-Agent: AdScope-Bot/1.0 (+https://adscope.internal/bot; commercial-research)`.
- Adheres to `robots.txt` directives.
- Implements strict 8-second request timeouts to prevent resource locking.
- Exclusively parses public marketing HTML elements (`<h1>`, `<title>`, discount copy, pricing text, and review badges).
