# AdScope Compliance & Ethical Data Collection Guarantee

## 1. Zero Personal Data Principle
AdScope is engineered strictly for **B2B competitive market and advertising intelligence**. 

- **NO Individual User Profiling**: AdScope does NOT scrape, process, or store personal data, names of individual social media users, commenter profiles, telephone numbers, emails, residential addresses, or personal browsing histories.
- **Exclusively Commercial & Public Advertiser Disclosures**: All collected records originate exclusively from publicly mandated advertiser transparency disclosures (e.g., Meta Ad Library, Google Ads Transparency Center, TikTok Commercial Content Library).
- **Public Entity Scope**: Monitored entities are strictly registered commercial brand pages, domains, and advertiser accounts.

## 2. Public Platform Guidelines & ToS Compliance
- **Official APIs First**: Data collection leverages official public platform APIs (such as Meta Graph API Ad Library endpoint) where access tokens are provided.
- **Robots.txt & Respectful Rate Limiting**: Where public web fallbacks or landing page meta-crawlers operate, AdScope adheres strictly to target domain `robots.txt` directives, implements token-bucket rate limiting (default max 1 request/2 seconds per domain), and exponential backoff with jitter on HTTP 429 status codes.
- **Aggregated Audience Signals**: Audience indicators (such as demographic skew or geographic region) are derived exclusively from the advertiser's own declared public campaign parameters (e.g. "Targeted at United States, Ages 25-54"), never from personal end-user tracking.

## 3. Storage & Retention
- Creative assets (thumbnails/copy) are stored in isolated workspace-scoped tenant buckets.
- Workspace data can be exported or purged on demand in accordance with tenant administrative controls.
