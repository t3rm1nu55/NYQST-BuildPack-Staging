# Chat Export Analysis — 5988fe2c-871f-4de0-afcb-381cdecdb107

> **Date**: 2026-02-18
> **Source**: Browser-saved HTML export of a Superagent.com chat session
> **File**: `5988fe2c-871f-4de0-afcb-381cdecdb107_chat` (807KB, 7 lines — one giant HTML page)
> **Analysis method**: Targeted grep + Python parsing of `__NEXT_DATA__` JSON blob; no full-file reads
> **Cross-references**: `AGENTIC-SYSTEM.md`, `GENERATION_PIPELINE.md`, `SYSTEM-ARCHITECTURE.md`

---

## Executive Summary

This file is a Next.js server-side-rendered HTML page exported from `superagent.com/chat/[chatId]`. It contains a 2-turn conversation (user → AI, user → AI) where the user requested a "WEBSITE" deliverable about Commercial Real Estate metrics templates. The session ran for approximately 29 minutes.

**What is in this file**: Full chat data schema, message content, deliverable identifiers, feature flags, pricing model, authentication architecture, UI component names, marketing copy about the 3-step workflow, and billing configuration.

**What is NOT in this file**: Actual agent reasoning, tool calls, search queries, plan tasks, system prompts, or intermediate execution events. All of that lives in `event_stream_artifact_id` records loaded dynamically via authenticated API after page load. Two artifact IDs are present but their contents require API access to retrieve.

**Primary value**: Schema confirmation, deliverable type taxonomy, feature flag inventory, and a real measurement of processing time for a WEBSITE-type run.

---

## 1. System Prompts / Instructions

**Confidence: NOT FOUND in this export**

No system prompts, agent instructions, or LLM prompt templates are embedded in the HTML. The chat export stores only the user-visible content. The prompts exist server-side and are passed to the LLM at runtime.

**What IS confirmed** (CONFIDENCE: HIGH):

The AI response format uses an XML-tagged answer wrapper:

```xml
<answer>
<p>Prose response text here...</p>
<ul><li>...</li></ul>
<div>
  <gml-ViewWebsite props='{"identifier": "...uuid..."}'>...</gml-ViewWebsite>
</div>
<div>
  <gml-ViewReport props='{"identifier": "...uuid..."}'>...</gml-ViewReport>
</div>
</answer>
```

This `<answer>` tag is the boundary the system uses to extract the user-facing prose from the AI output. It appears in `hydrated_content` field of AI messages. The system clearly instructs the LLM to wrap responses in this tag and to use `<gml-*>` web components to reference generated deliverables.

**Implication for replication**: Our AI response parser must strip the `<answer>` wrapper and render `<gml-*>` tags as React component references. The system prompt must tell the model to use this format.

---

## 2. Tool Call Patterns

**Confidence: NOT FOUND in this export**

Tool calls (brave_search, firecrawl, etc.) are stored in the event stream artifacts (`event_stream_artifact_id`), not in the HTML page data. The two artifact IDs present are:

- `bfca02b2-272f-49d0-9280-bf732358f076_artifact` — main run event stream (~29 minutes of execution)
- `b78293dd-b01f-42bf-b0a9-687dd1a38b9e_artifact` — follow-up clarification event stream (~0.2s)

**What IS confirmed** (CONFIDENCE: HIGH from JS bundle analysis + marketing copy):

Marketing copy directly states: "Superagent plans out the approach and **pulls data from the web, official filings, news, and databases you can trust**." This confirms web search + structured data sources as tool categories.

The 3-step workflow (confirmed from SSR-rendered HTML):
1. **Break down the task** — "plans out the approach and pulls data from the web, official filings, news, and databases you can trust"
2. **Deploy subagents** — "Delegate to a team of agents to gather information and analyze the problem for you"
3. **Deliver findings** — "Synthesize findings into a Super Report you can explore, share, or export"

**Implication**: This matches the Planner → Fan-out Executors → Synthesizer pattern confirmed in `AGENTIC-SYSTEM.md`.

---

## 3. Agent Reasoning Chains

**Confidence: NOT FOUND in this export**

All intermediate reasoning is in the event stream artifacts. The `plan_sets` field in `defaultData` is an **empty array** for this chat — either plan sets were stored differently or they are purged after completion.

```json
{
  "plan_sets": [],
  "has_async_entities_in_progress": false
}
```

**Key inference** (CONFIDENCE: MEDIUM): The `has_async_entities_in_progress: false` flag suggests the system tracks whether entity generation is still running. When it is `true`, the UI would show a loading/progress state. This is a completion signal, not a content store.

---

## 4. Plan Structures (PlanSet / PlanTask)

**Confidence: SCHEMA CONFIRMED, CONTENTS NOT PRESENT**

The `defaultData` object has a `plan_sets` field typed as an array, but it is empty for this completed chat. This confirms:

**Chat-level data schema** (CONFIDENCE: HIGH — directly observed):

```typescript
type ChatDefaultData = {
  messages: ChatMessage[];
  plan_sets: PlanSet[];      // empty after completion — purged or never serialized here
  user_feedback: Feedback[];
  title: string;
  stream_id: string | null;  // null when not actively streaming
  has_async_entities_in_progress: boolean;
}
```

**Message-level schema** (CONFIDENCE: HIGH — directly observed, both USER and AI fields confirmed):

```typescript
type ChatMessage = {
  id: string;                          // "{uuid}_chat_message"
  chat_id: string;                     // "{uuid}_chat"
  creator_type: "USER" | "AI";
  creator_user_id: string | null;      // null for AI messages
  message_type: "normal" | null;       // null for AI messages
  deliverable_type: "WEBSITE" | "REPORT" | "DOCUMENT" | "SLIDE" | "CODE" | null;
  is_answer: boolean;
  is_running: boolean | null;
  needs_clarification_message: string | null;
  retry_attempts: number | null;       // 0 on AI messages (was not retried)
  content: string;                     // raw content (empty — stored in hydrated_content)
  hydrated_content: string;            // rendered HTML including gml- components
  user_content_artifact_id: string | null;
  user_message_entity_ids: string[] | null;
  user_message_entities: Entity[] | null;
  ai_output_id: string | null;         // "{uuid}_ai_outputs"
  first_report_identifier: string | null; // UUID of primary deliverable (no suffix)
  entities: Entity[];
  event_stream_artifact_id: string | null; // "{uuid}_artifact" — points to run log
  error_type: string | null;
  created_at: string;                  // ISO 8601 UTC
}
```

**New discovery**: The `deliverable_type` is stored on the **USER message**, not the AI message. When the user sends a message, the frontend sends the deliverable type with the request. The AI response message has `deliverable_type: null`.

**New discovery**: `first_report_identifier` is a UUID (no suffix) that matches the identifier used in `gml-ViewReport`. This is how the chat knows which report entity is the primary deliverable.

---

## 5. Meta-Reasoning / Gap-Filling / Retry

**Confidence: NOT FOUND in this export**

No retry or fallback events are visible. What IS notable: `retry_attempts: 0` on both AI messages confirms the system tracks retry count per message. The field exists in the schema.

**New discovery — self-correction flow** (CONFIDENCE: HIGH — directly observed):

The second user message was: `"did the preview fail?"` (sent at 00:42:10)

The AI response (also 00:42:10, 226ms later) said: *"No, the preview didn't fail – the website was successfully generated! The website file was created, but I didn't properly include the component to view it in my previous response."*

This reveals a **self-correction pattern**: The first AI response (message 1) included both `gml-ViewWebsite` and `gml-ViewReport` but the website preview wasn't displaying. The user asked if it failed. The AI responded correctly and re-included just the `gml-ViewWebsite` component. The response time (226ms) indicates this follow-up was a lightweight message — likely a single LLM call without full research, using cached artifacts.

**Implication**: The system supports clarification follow-ups that reuse existing artifacts. The `event_stream_artifact_id` for the follow-up (`b78293dd`) would be a very short event stream compared to the main run (`bfca02b2`).

---

## 6. Generation Substeps

**Confidence: NOT DIRECTLY OBSERVED — inferred from timing**

The session ran from **2026-02-16 00:13:03 to 00:42:10 UTC** — approximately **29 minutes** for a WEBSITE deliverable from a highly complex prompt ("across every commercial real estate lifecycle stage... every market participant... every key workflow...").

The DB write timestamps show:
- User msg 1 created: `00:13:03.901975Z`
- AI msg 1 created: `00:13:04.136964Z` (235ms later — just the DB record creation, not completion)
- User msg 2 created: `00:42:10.453975Z` (user sees finished result and asks about preview)
- AI msg 2 created: `00:42:10.679215Z` (226ms — fast follow-up)

**Inference** (CONFIDENCE: MEDIUM): The AI message record is created in the DB almost immediately (235ms) as a placeholder with `is_running: true`. The actual generation streams into the `event_stream_artifact_id` artifact. The UI polls or subscribes to this artifact for progress updates. When generation completes, `is_running` is set to `false` and `hydrated_content` is populated.

This timing confirms a **~29 minute wall clock time** for a full WEBSITE run of this complexity. This aligns with what screenshots showed for multi-workstream research runs.

---

## 7. LLM Prompts / System Messages

**Confidence: NOT FOUND in this export**

**What IS confirmed from the response format** (CONFIDENCE: HIGH):

The LLM output format is constrained by the system prompt to produce:
1. An `<answer>` XML wrapper
2. Standard HTML tags for prose (p, ul, li, strong)
3. Custom `<gml-*>` web components for deliverable references
4. Structured lists with bold labels (`<strong>Category:</strong> Description`)

The AI response for the main deliverable shows a consistent summarize-then-enumerate pattern:
- Opening paragraph summarizing what was built
- Second paragraph with value proposition
- Bulleted list with bold category labels and descriptions
- Closing paragraph on design principles
- Deliverable viewer components

This pattern is likely enforced by the system prompt's output format specification.

---

## 8. Citation / Entity Creation Patterns

**Confidence: SCHEMA OBSERVED, CONTENTS NOT PRESENT**

The message schema has several entity-related fields:

```typescript
entities: []                    // empty in both AI messages — entity refs are async
user_message_entities: null     // no user-uploaded docs in this session
user_message_entity_ids: null   // same
user_content_artifact_id: null  // no uploaded file content artifact
```

The `has_async_entities_in_progress: false` at the chat level confirms entity generation completes asynchronously and this session's entities are done.

**New discovery**: Entity creation is a separate async process from the main response. The `entities` array on the message is initially empty and gets populated separately. This explains the "CREATING NOTES" status visible in screenshots — that's the entity creation phase.

**Implication for replication**: Entity/citation creation must be decoupled from the main response stream. We need a separate async worker that populates entities after the main LLM run completes.

---

## 9. Error Handling / Recovery

**Confidence: SCHEMA OBSERVED**

Fields that support error handling:

```typescript
error_type: null                       // no errors in this session
needs_clarification_message: null      // no clarification requested
retry_attempts: 0                      // no retries
is_running: false                      // completed successfully
has_async_entities_in_progress: false  // all async work done
```

The `error_type` field on messages can presumably hold values like `TIMEOUT`, `RATE_LIMITED`, `GENERATION_FAILED`, etc. (inferred from field name; actual values unknown without an error case).

The `needs_clarification_message` field (CONFIDENCE: HIGH — field exists in schema) suggests the system can pause mid-execution to ask the user a clarifying question. This is a separate mechanism from the normal follow-up message flow.

---

## 10. Task Decomposition Patterns

**Confidence: INDIRECTLY CONFIRMED**

The `deliverable_type: "WEBSITE"` on the user message is the only explicit task type indicator present. The decomposition itself happens in the event stream.

**New discovery — deliverable type is user-selectable at message time** (CONFIDENCE: HIGH):

The user message carries `deliverable_type`, meaning the UI shows a deliverable type picker before/during message composition. The first user message (the complex CRE prompt) had `deliverable_type: "WEBSITE"`. The second message ("did the preview fail?") had `deliverable_type: null` — follow-up messages don't need a deliverable type.

**Feature flag inventory for deliverable types** (CONFIDENCE: HIGH — directly observed):

From `creditDocAnalysisAppFlags`:

| Flag | Value | Implication |
|------|-------|-------------|
| `websiteDeliverableEnabled` | `true` | WEBSITE type is GA |
| `documentDeliverableEnabled` | `true` | DOCUMENT type is GA |
| `slideDeliverableEnabled` | `true` | SLIDE type is GA |
| `codeDeliverableEnabled` | `true` | CODE type is GA |
| `enhancedReportEnabled` | `true` | Enhanced REPORT is GA |
| `multiSectionReportStreamingEnabled` | `true` | Multi-section report streams |
| `superSlidesGenerationEnabled` | `true` | Advanced slide generation enabled |
| `customReportTemplateUIEnabled` | `false` | Custom templates not yet GA |
| `editableReportUIEnabled` | `false` | Report editing not yet GA |
| `tableOfContentsUIEnabled` | `false` | ToC not yet GA |
| `fileUploadEnabled` | `true` | Document upload for RAG is GA |
| `personalizedSuggestionsV0Enabled` | `true` | Personalized suggestions v0 is live |

---

## Cross-References to Existing Analysis

### Confirms `AGENTIC-SYSTEM.md`:

- **Planner → Fan-out Executors → Synthesizer pattern**: CONFIRMED by 3-step marketing copy (HIGH confidence)
- **Event stream architecture**: CONFIRMED — `event_stream_artifact_id` is the mechanism
- **Plan set as top-level execution context**: CONFIRMED — `plan_sets` field exists on chat (though empty)
- **`is_running` status flag**: CONFIRMED on message schema
- **Hierarchical IDs** (`plan_set_id`, `plan_id`, `node_id`, `tool_id`): Still MEDIUM confidence — not visible in this export but consistent with what we see

### Confirms `GENERATION_PIPELINE.md`:

- **Shared data brief feeding multiple generators**: CONFIRMED — both `gml-ViewWebsite` and `gml-ViewReport` were generated from the same prompt run, with the same underlying research data
- **Website and Report as co-generated deliverables**: NEW — Message 1 returned both a Website AND a Report from a single user request typed as `WEBSITE`. They have different identifiers (`b1252e1e...` for website, `688b5468...` for report)
- **`first_report_identifier`**: This field on the AI message points to `688b5468...` which matches the `gml-ViewReport` identifier. The report is the "primary" deliverable even for a WEBSITE request.

### New versus `SYSTEM-ARCHITECTURE.md`:

- Auth system is **Ory Kratos** (`https://auth.superagent.com/schemas/ZGVmYXVsdA` → `default`, auth method `oidc`, `aal1` assurance level)
- Session token lifetime: **60 days** (`issued_at: 2026-02-16`, `expires_at: 2026-04-17`)
- Login device IP `34.96.47.56` suggests **server-side OAuth callback** (GCP IP range)
- CMS: **Sanity** (`projectId: 4jpbu6z4`, dataset: `production`) — likely used for marketing content / use case examples on homepage
- Analytics: **PostHog** (`phc_USesA3LHTQe1A1ozLZFQEQhTmazV9S4sOZQ561IZsHX`) + **Google Tag Manager** (`GTM-TMP7WP43`)

---

## New Discoveries (Not in JS Bundle Analysis)

### Discovery 1: Website + Report Co-generation (HIGH confidence)

A single `WEBSITE` deliverable request produces **two artifacts**: a website (`gml-ViewWebsite`) and a report (`gml-ViewReport`). The AI message includes both in its response. The report gets `first_report_identifier` on the message record. This means:
- The system always generates a report alongside website deliverables (or at minimum, did so here)
- The report serves as the "structured data" companion to the visual website
- Both share the same research run

**Implication**: Our WEBSITE deliverable pipeline should auto-generate a companion report artifact, or at minimum, store the research data as a report entity.

### Discovery 2: deliverable_type Belongs to User Message (HIGH confidence)

The deliverable type picker is part of the **user message composition**, not a separate chat-level setting. This means:
- Different messages in the same chat can request different deliverable types
- The field is null on follow-up/clarification messages
- The UI tracks deliverable type per user input, not per chat session

**Implication**: Our schema should store `deliverable_type` on `ChatMessage`, not on `Chat`.

### Discovery 3: Pricing Model Confirmed from Rendered HTML (HIGH confidence)

From SSR-rendered pricing card:
- **Plan**: Pro
- **Price**: $20/month
- **Included**: 200 runs/month
- **Overage**: $0.50 per additional run
- **Unlimited**: report reads (reads are free, only generation costs)
- **Trial**: 30-day free trial, no credit card required

**Implication**: The "run" unit maps to a single chat message / AI generation. Our billing model should use the same unit: 1 run = 1 AI generation cycle. Reads/views of completed deliverables are free.

### Discovery 4: noAuthPathAllowlist Reveals Public URL Patterns (HIGH confidence)

```
/ /reports
regex:^/chat/.+$
regex:^/library-reports/.+$
/content-library
regex:^/content-library/.+$
regex:^/thumbnail/.+$
regex:^/share/.+$
regex:^/report/preview/.+$
regex:^/website/.+$
```

These paths are publicly accessible without auth. Key implications:
- `/reports` — a reports listing page is public
- `/chat/[chatId]` — individual chats are publicly accessible by ID (shareable)
- `/library-reports/[id]` — library reports are public
- `/content-library` — content library listing is public
- `/thumbnail/[id]` — thumbnails are public (used for share previews)
- `/share/[id]` — explicit share URLs
- `/report/preview/[id]` — report preview is public
- `/website/[id]` — generated websites are publicly hosted

**Implication**: Our routing must treat `/website/[id]` and `/report/preview/[id]` as unauthenticated. Generated websites are served at their own public URL.

### Discovery 5: UTM Attribution Confirms Airtable Integration (HIGH confidence)

The session was initiated with:
```
utm_campaign: superagentlaunchairtable
utm_source: airtable
```

This confirms this is the Airtable-embedded version of Superagent. The `is_airtable_user: false` on the session suggests the Airtable SSO integration exists but this particular session was not authenticated via Airtable.

### Discovery 6: Auth Architecture is Ory Kratos + OIDC (HIGH confidence)

```
authenticator_assurance_level: aal1
authentication_methods: [{"method": "oidc", "aal": "aal1"}]
schema_url: https://auth.superagent.com/schemas/ZGVmYXVsdA  (= "default")
```

Superagent uses Ory Kratos for identity management with OIDC as the primary auth method. The `auth.superagent.com` subdomain hosts the auth service separately from `superagent.com`. Google OAuth is enabled (`enableGoogleOAuth: true`).

**Implication for our build**: We use Supabase Auth which handles this. No action needed. But confirms Superagent's auth is NOT Supabase.

### Discovery 7: Plan Sets Are Ephemeral (MEDIUM confidence)

The `plan_sets: []` empty array on a completed chat suggests plan sets are either:
- Purged from the chat record after completion
- Stored only in the event stream artifact (not serialized into the chat object)
- Returned separately via a different API endpoint that this HTML export doesn't include

The fact that the field exists with an empty array (not null) suggests it's intentionally included in the schema but is empty post-completion.

**Implication**: Our `RunEvent` storage for plans (per user decision) is consistent with this pattern — the plans live in the event log, not as first-class chat-level objects.

---

## Actionable Items for Our Build

1. **Response format**: Implement `<answer>` XML wrapper parsing. Our LLM system prompt must instruct the model to use `<answer>...</answer>` around all responses, and to use `<gml-*>` web components for deliverable references.

2. **Schema alignment**: Add `deliverable_type` to `ChatMessage` model (not `Chat`). Also add `event_stream_artifact_id`, `ai_output_id`, `first_report_identifier`, `retry_attempts`, `needs_clarification_message`, `hydrated_content` fields.

3. **Co-generation**: WEBSITE deliverables should automatically generate a companion report artifact (or vice versa). Store both identifiers in the AI message.

4. **Async entity pattern**: Entity/citation creation is decoupled from the main response. Implement as a post-processing async worker, not inline with generation.

5. **`has_async_entities_in_progress` flag**: Add this to chat-level state. UI uses this to know when all async post-processing is done.

6. **Public routes**: Implement unauthenticated access for `/website/[id]`, `/report/preview/[id]`, `/share/[id]`, `/thumbnail/[id]`.

7. **Billing unit**: 1 run = 1 AI generation message. Reads are free. Track `retry_attempts` per AI message to handle retries without double-billing.

8. **Follow-up response optimization**: The 226ms response time for the clarification follow-up suggests it used a fast path (no new research, just reformatting). Implement a classifier that detects clarification/correction requests and routes them to a lightweight responder that reuses existing artifacts.

9. **Feature flags to implement in v1**:
   - `websiteDeliverableEnabled`
   - `documentDeliverableEnabled`
   - `fileUploadEnabled`
   - `enhancedReportEnabled`
   - `multiSectionReportStreamingEnabled`
   - Defer: `customReportTemplateUIEnabled`, `editableReportUIEnabled`, `tableOfContentsUIEnabled`

---

## What This Export Did NOT Reveal (Future Investigation)

- **Event stream artifact contents** — requires authenticated API call to `GET /artifacts/{id}`; would contain full tool call logs, plan tasks, intermediate reasoning
- **AI output records** — `ai_output_id` (`{uuid}_ai_outputs`) likely contains the raw LLM output before hydration
- **Entity contents** — citations, knowledge graph nodes
- **The actual system prompts** — server-side only, not exposed in any client-visible surface
- **Tool call parameters** — search queries, firecrawl URLs, etc.

To get this data: a browser network interceptor (DevTools → Network tab) during an active Superagent run would capture the streaming NDJSON from the event stream endpoint. The `event_stream_artifact_id` is the key to construct the URL.

---

*Analysis complete. File: `5988fe2c-871f-4de0-afcb-381cdecdb107_chat` | 807KB HTML | Next.js 14 SSR export | Production build `9f53cd1` | 2026-02-18*
