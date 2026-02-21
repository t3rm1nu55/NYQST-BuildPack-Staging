---
document_id: DOCUINTELLI-GAPS-ADDENDUM
version: 1
date: 2026-02-20
author: claude-haiku-4-5
role: Gap Analysis Merger
inputs:
  - COMPREHENSIVE-GAP-ANALYSIS.md (GAP-001 through GAP-041)
  - DOCUINTELLI-SKILLS-EXTRACT.md Section 10 (BL mapping and cross-reference)
  - IMPLEMENTATION-PLAN v3 (14 sections, 4 waves, 80 SP baseline)
status: INTEGRATION COMPLETE — Adds 8 new gaps (GAP-042–049) extending comprehensive analysis
---

# DocuIntelli Gaps Addendum — Platform Capability Extensions

---

## Executive Summary

The **DOCUINTELLI-SKILLS-EXTRACT.md** identified eight platform capabilities NOT covered by the current baseline (BL-001 through BL-022):

1. **Multi-framework reasoning** — run competing frameworks in parallel, resolve conflicts
2. **Mental model application layer** — guide LLM through 16 reasoning patterns
3. **Dimension discovery system** — find structure *from* data (unsupervised)
4. **Pattern library + corpus matcher** — 150+ watch-for anomalies, searchable
5. **Process templates** — formalized AP cycle, contract lifecycle, etc.
6. **Dimension builder UI** — interactive pole-naming and validation
7. **Multi-dimensional visualization** — scatter plots, radar charts, parallel coordinates
8. **Corpus comparison agent** — analyze two corpora side-by-side

These **8 gaps** require **8 new backlog items** (proposed **BL-023 through BL-030**), each representing a Platform Primitive (Layer 1) extension needed *specifically* for DocuIntelli module v1, not for the Research Module baseline.

**Integration Strategy:**
- **Wave 0 / W1**: BL-023 (Multi-perspective reasoning), BL-024 (Reasoning tool library) — enables framework reconciliation
- **Wave 1 / W1**: BL-025 (Dimension discovery agent), BL-026 (Pattern library + matcher) — core domain logic
- **Wave 2 / W1–W2**: BL-027 (Process templates), BL-028 (Dimension builder), BL-029 (Visualization) — UX and reporting
- **Wave 2 / W2**: BL-030 (Corpus comparison) — comparative analysis capability

**Effort estimate**: ~20–24 SP across the 8 items, adding 1.5–2 weeks to the 7-week baseline (assume a 5–6 week critical path remains by optimizing non-critical paths).

---

## Gap Registry Extension: GAP-042 through GAP-049

---

### GAP-042 — Multi-Framework Reconciliation Engine Not Specified

**ID**: GAP-042
**Title**: Multi-Framework Reconciliation Engine
**Severity**: **CRITICAL** (Core DocuIntelli differentiator; gates framework plural capability)
**Category**: Design Gap → Platform Primitive Extension

**Description**:

DocuIntelli's value proposition is "method-agnostic" reasoning: run *multiple* analysis frameworks (e.g., financial framework, risk framework, operational framework) on the same corpus, compare results, surface conflicts, build consensus. The DOCUINTELLI-SKILLS-EXTRACT lists this as Skill #7 (Multi-Framework Reconciliation):

- Consensus builder agent (synthesize multi-framework findings)
- Framework application tool (run all selected frameworks in parallel)
- Conflict detector (Framework A says X, Framework B says Y)
- Confidence weighter (which framework is credible for this corpus?)

**Current state**: The baseline BL-001 through BL-022 envision a *single* framework application per run. BL-007 (Context Engineering) can switch between contexts, but there is no design for *parallel* framework application, result deduplication across frameworks, or conflict detection.

**Required state**: A "Multi-Framework Reconciliation" primitive that:
- Accepts a list of selected frameworks as input (e.g., `[financial_framework_v1, risk_framework_v2, operational_framework_v1]`)
- Spawns parallel agents (one per framework) to apply each framework independently
- Collects results: per-framework findings, confidence scores, edge cases
- Runs a conflict detector: identifies where frameworks agree/disagree
- Emits consensus view: merged findings, unresolved conflicts flagged
- Stores all versions in the CorpusAnalysis result (versioned by framework)

**Affected BL items**:
- **BL-007** (Context Engineering) — now must support framework switching + reconciliation context
- **BL-016** (Multi-agent loops) — now must include parallel framework application agents
- **BL-017** (LLM integration) — now must guide consensus synthesis
- **New: BL-023** (Multi-Framework Reconciliation Engine)

**Platform primitive required**: Layer 1: Multi-agent collaboration orchestration (extends BL-016)

**Effort estimate**: **M** (Medium) — 5 SP
- 2 SP: Framework reconciliation schema (Pydantic `FrameworkResult`, `ConflictRecord`, `ConsensusView`)
- 1.5 SP: Parallel framework application agent + dispatch logic
- 1 SP: Conflict detector + weighting algorithm
- 0.5 SP: Tests + documentation

**Data schema implications**:
```
FrameworkResult
  - framework_id: str
  - findings: dict[str, Any]
  - confidence_scores: dict[str, float]
  - edge_cases: list[str]
  - timestamp: datetime

ConflictRecord
  - finding_key: str
  - framework_a: str, value_a: Any, confidence_a: float
  - framework_b: str, value_b: Any, confidence_b: float
  - resolution_hint: str (manual annotation)

ConsensusView
  - merged_findings: dict[str, Any]
  - unresolved_conflicts: list[ConflictRecord]
  - consensus_confidence: float
  - next_steps: list[str]
```

**Current code gaps**:
- No parallel agent dispatch mechanism in orchestrator (BL-001 fan-out partial but not for agents)
- No framework registry or framework-to-agent mapping
- No conflict scoring or consensus synthesis algorithm

**Wave**: **W0 / W1** — Required before domain modules can use multiple frameworks (PropSygnal, RegSygnal both require 3+ frameworks)

**Owner recommendation**: Backend track lead (BL-016, BL-017 owners) + research scientist

---

### GAP-043 — Reasoning Tool Library (Mental Models) Not Implemented

**ID**: GAP-043
**Title**: Reasoning Tool Library — Mental Model Application
**Severity**: **CRITICAL** (Core platform capability for guided reasoning)
**Category**: Implementation Gap → Platform Primitive Extension

**Description**:

DocuIntelli lists 16 mental models (Skill #3, e.g., "Invert the Question," "Identify Assumptions," "Find the Constraint," etc.). These are reasoning tools — structured prompts and orchestration patterns that guide the LLM through multi-step thinking. The DOCUINTELLI-SKILLS-EXTRACT specifies:

**Tool Requirements**:
- Mental model application tool (given corpus context + mental model, apply it)
- Structured thinking coach agent (guide multi-turn reasoning)
- Reasoning step validator (is this reasoning sound?)
- Insight extractor (distill findings from reasoning outputs)

**Current state**: BL-017 (LLM Integration) covers LangChain + ChatOpenAI integration but does not cover structured reasoning patterns. The baseline assumes LLM calls are *direct* (ask question, get answer). There is no library of reasoning patterns, no application framework, and no validation of reasoning steps.

**Required state**: A reasoning tool library where:
- Each of 16 mental models has a Pydantic `MentalModel` definition
- Each MentalModel specifies: inversion question, step sequence, validation rules, when to apply
- An agent can *apply* a mental model to a corpus (run the question sequence, validate answers, extract insights)
- Results are versioned and traceable (which mental model produced this finding?)

Example:
```
MentalModel: InvertTheQuestion
  - name: "Invert the Question"
  - description: "Flip the query to find blind spots"
  - inversion_question: "What would make this [corpus property] FALSE instead of TRUE?"
  - question_sequence: [
      "Current state: [measure current value]",
      "Inverted premise: [assume opposite]",
      "Evidence for inverted: [find supporting docs]",
      "Synthesis: [reconcile contradiction]"
    ]
  - validation: "Do the supporting docs actually contradict the current finding?"
  - applications: ["financial_due_diligence", "risk_assessment"]
```

**Affected BL items**:
- **BL-017** (LLM Integration) — now includes mental model library + application framework
- **BL-016** (Multi-agent loops) — reasoning agents apply models
- **New: BL-024** (Reasoning Tool Library)

**Platform primitive required**: Layer 1: LLM reasoning patterns (extends BL-017)

**Effort estimate**: **M** (Medium) — 6 SP
- 2 SP: 16 mental models definition + schema (Pydantic `MentalModel`)
- 2 SP: Mental model application agent (orchestrator that steps through question sequence)
- 1 SP: Reasoning validator (checks steps are sound)
- 1 SP: Tests + documentation

**Data schema implications**:
```
MentalModel
  - id: str (slug, e.g., "invert_question")
  - name: str
  - description: str
  - category: str (sense-making | constraint-finding | assumption-checking | etc.)
  - inversion_question: str
  - question_sequence: list[str]
  - validation_rules: list[dict] (condition → assertion)
  - applicable_when: list[str] (use case slugs)
  - when_to_combine: list[str] (compatible mental models)

MentalModelApplication
  - mental_model_id: str
  - corpus_id: str
  - answers: dict[str, str] (question → answer)
  - validation_results: dict[str, bool] (rule_id → passed?)
  - extracted_insight: str
  - confidence: float
  - timestamp: datetime
```

**Current code gaps**:
- No mental model registry or storage
- No structured reasoning orchestrator
- No reasoning step validation framework

**Wave**: **W0 / W1** — Required before BL-016 multi-agent loops can be useful (agents need reasoning tools)

**Owner recommendation**: Backend track lead + research scientist (reasoning algorithm design)

---

### GAP-044 — Dimension Discovery Agent (Unsupervised Learning) Not Specified

**ID**: GAP-044
**Title**: Dimension Discovery Agent — Domain-Emergent Dimensions
**Severity**: **HIGH** (Core capability; gates interactive discovery)
**Category**: Design Gap → Platform Primitive Extension

**Description**:

DocuIntelli's Phase 3 ("Discover Dimensions") discovers dimensions *from* the corpus data, rather than using a hardcoded dimension list. The DOCUINTELLI-SKILLS-EXTRACT lists:

**Skill #5 — Dimension Scoring & Visualization:**
- Dimension scorer agent (score each doc on each dimension)
- Weight applier agent (apply use-case weights)
- Quality analyst agent (synthesize multi-dimension profile)

But this assumes dimensions are *known*. The harder capability is **Phase 3 Discover**:
- Clustering agent (what groups naturally form in this corpus?)
- Pole identifier (within cluster, what are the extremes? e.g., "high_complexity ↔ low_complexity")
- Dimension namer (LLM generates human-readable pole names)
- Dimension validator (user confirms: "yes, this is a real differentiator" or "no, this is noise")

**Current state**: BL-016 (Multi-agent loops) covers agent orchestration but does not specify unsupervised dimension discovery. The baseline assumes dimensions are pre-defined (e.g., "completeness," "currency," "accuracy").

**Required state**: A dimension discovery agent that:
- Takes a corpus (set of document observations)
- Applies unsupervised learning (clustering, PCA, or LLM-based feature extraction) to find structure
- Identifies poles (high/low, early/late, complete/sparse, etc.)
- Names poles with LLM + human validation
- Returns a discovered dimension set

**Affected BL items**:
- **BL-016** (Multi-agent loops) — includes dimension discovery agent
- **BL-007** (Context Engineering) — dimension discovery requires understanding corpus context
- **New: BL-025** (Dimension Discovery Agent)

**Platform primitive required**: Layer 1: Unsupervised learning orchestration (new agent type)

**Effort estimate**: **L** (Large) — 7 SP
- 2 SP: Clustering + pole extraction algorithm (scikit-learn unsupervised learning)
- 2 SP: Dimension namer LLM prompt + validation flow
- 2 SP: Dimension discovery agent orchestrator + state management
- 1 SP: Tests + documentation

**Data schema implications**:
```
DiscoveredDimension
  - id: str (generated at discovery time)
  - low_pole_name: str (e.g., "simple")
  - high_pole_name: str (e.g., "complex")
  - low_pole_description: str
  - high_pole_description: str
  - domain_emergent: bool (True if discovered, False if hardcoded)
  - clustering_method: str (e.g., "kmeans", "hierarchical", "lda")
  - silhouette_score: float (clustering quality 0-1)
  - validation_status: str (unvalidated | user_confirmed | user_rejected)
  - created_at: datetime

DimensionDiscoverySession
  - corpus_id: str
  - use_case_id: str (context for dimension relevance)
  - clustering_features: list[str] (which features were used)
  - discovered_dimensions: list[DiscoveredDimension]
  - user_feedback: dict[str, str] (dimension_id → confirm/reject/rename)
  - finalized_dimensions: list[DiscoveredDimension] (post-validation)
```

**Current code gaps**:
- No unsupervised learning integration (would need scikit-learn, add to dependencies)
- No dimension discovery agent
- No validation/feedback loop for user refinement

**Wave**: **W1** — After baseline BL-016 implemented; enables Phase 3 of DocuIntelli workflow

**Owner recommendation**: Research scientist (unsupervised learning) + backend track lead

---

### GAP-045 — Watch-For Pattern Library and Matcher Not Specified

**ID**: GAP-045
**Title**: Watch-For Pattern Library + Corpus Matcher
**Severity**: **HIGH** (Core DocuIntelli capability; gates anomaly detection)
**Category**: Design Gap → Platform Primitive Extension

**Description**:

DocuIntelli tracks 150+ watch-for patterns across 54 document types (e.g., "duplicate invoice number within 30 days," "unsigned signature block," "expired insurance certificate"). The DOCUINTELLI-SKILLS-EXTRACT lists:

**Skill #11 — Pattern Recognition & Anomaly Detection:**
- Pattern learner agent (what's normal in this corpus?)
- Anomaly scorer agent (how unusual is this?)
- Anomaly explainer agent (why is this unusual?)
- Rule-based anomaly checker (fraud rules, control violation detection)

**Current state**: The baseline has no pattern library, no anomaly detection, and no watch-for rules. BL-009 (ReportRenderer) renders findings but does not *generate* anomaly findings.

**Required state**: A pattern library system with:
- 150+ watch-for patterns indexed by (document_type, pattern_category, severity)
- Patterns stored as Pydantic models (rule type, detection logic, remediation suggestion)
- Pattern matcher: given a document, check it against all applicable patterns
- Anomaly scorer: aggregate pattern matches into anomaly score
- Pattern search: tenants can discover patterns relevant to their use case

Examples:
```
WatchForPattern:
  - pattern_id: "invoice_duplicate_30day"
  - document_types: ["invoice", "purchase_order_receipt"]
  - description: "Invoice number appears twice within 30 days"
  - severity: "high"
  - detection_logic: "SQL | {select count(*) from documents where invoice_number = X and doc_type = 'invoice' and created_date within 30 days of this doc}"
  - remediation: "Verify with vendor; check for duplicate payment processing"

WatchForPattern:
  - pattern_id: "contract_expiration_alert"
  - document_types: ["contract", "insurance_certificate"]
  - description: "Document expiration date within 30 days"
  - severity: "critical"
  - detection_logic: "LLM | given doc, extract expiration_date and compare to today"
  - remediation: "Renew or request extension"
```

**Affected BL items**:
- **BL-003** (Standalone tools) — pattern matcher can run standalone
- **BL-009** (ReportRenderer) — findings include anomalies detected by pattern matcher
- **New: BL-026** (Pattern Library + Matcher)

**Platform primitive required**: Layer 1: Pattern library + rule engine (new subsystem)

**Effort estimate**: **L** (Large) — 6 SP
- 2 SP: 150+ pattern definitions + Pydantic schema
- 1.5 SP: Pattern matcher (rule evaluation engine: SQL, LLM, regex)
- 1 SP: Pattern search + filtering interface
- 1 SP: Anomaly aggregator + scorer
- 0.5 SP: Tests + documentation

**Data schema implications**:
```
WatchForPattern
  - id: str (UUID)
  - pattern_id: str (human-readable slug, e.g., "invoice_duplicate_30day")
  - document_types: list[str]
  - pattern_category: str (duplicate | expiration | unsigned | missing_field | formatting_error | etc.)
  - severity: str (critical | high | medium | low)
  - description: str
  - detection_method: str (sql | llm | regex | custom)
  - detection_logic: dict (method-specific params)
  - remediation_suggestion: str
  - created_by: str (NYQST internal | tenant | framework_v1)
  - created_at: datetime

AnomalyDetectionResult
  - document_id: str
  - pattern_id: str
  - matched: bool
  - evidence: str (e.g., "found duplicate invoice #12345 from 5 days ago")
  - severity: str
  - remediation_suggestion: str
  - detected_at: datetime

DocumentAnomalySummary
  - document_id: str
  - critical_anomalies: list[AnomalyDetectionResult]
  - high_anomalies: list[AnomalyDetectionResult]
  - anomaly_score: float (0-1)
```

**Current code gaps**:
- No pattern library storage
- No pattern matcher implementation
- No anomaly scoring algorithm

**Wave**: **W1** — After BL-003 foundation; feeds into BL-009 findings

**Owner recommendation**: Backend track lead (pattern engine) + research scientist (scoring algorithm)

---

### GAP-046 — Process Template Engine Not Specified

**ID**: GAP-046
**Title**: Process Template Engine — Formalized Process Flows
**Severity**: **HIGH** (Blocks gap analysis capability)
**Category**: Design Gap → Platform Primitive Extension

**Description**:

DocuIntelli's Gap Analysis Engine (Skill #9) requires "process templates" — formalized process flows like "AP Cycle," "Contract Lifecycle," "Loan Origination." These templates define what documents *should* exist at each stage. The DOCUINTELLI-SKILLS-EXTRACT lists:

**Skill #9 — Gap Analysis Engine:**
- Expectations mapper agent (given corpus type/use case/process, what documents expected?)
- Gap detector agent (compare expected vs. actual)
- Gap severity scorer agent (how critical is each gap?)
- Process template tool (standard flows: AP cycle, contract lifecycle, etc.)

**Current state**: There is no process template storage, no gap detection logic, no process model. This is entirely absent from the baseline.

**Required state**: A process template system with:
- 8–10 quick-start process templates (AP cycle, contract lifecycle, loan origination, payroll, procurement, etc.)
- Each template specifies stages, document types per stage, handoff rules, control points
- Given a corpus + process template, the gap analyzer compares actual documents to expected flow
- Gaps are scored by severity (missing critical control vs. missing archive doc)
- Gap report suggests remediation (create missing doc, investigate lost doc, etc.)

Example:
```
ProcessTemplate: APCycle
  - id: "ap_cycle_v1"
  - name: "Accounts Payable Cycle"
  - stages: [
      {
        stage_id: "po_creation",
        name: "Purchase Order Creation",
        expected_docs: ["purchase_order"],
        control_points: ["PO approved by manager"],
        handoff_to: "receipt_matching"
      },
      {
        stage_id: "receipt_matching",
        name: "Goods Receipt & Matching",
        expected_docs: ["goods_receipt", "packing_list"],
        control_points: ["Receipt verified against PO", "Qty/Price validated"],
        handoff_to: "invoice_matching"
      },
      {
        stage_id: "invoice_matching",
        name: "3-Way Invoice Matching",
        expected_docs: ["invoice"],
        control_points: ["Invoice amount within tolerance", "Invoice date within 30 days of receipt"],
        handoff_to: "payment"
      }
    ]
  - critical_control_points: ["PO approved", "Receipt verified", "3-way match"]
  - average_cycle_time_days: 15
```

**Affected BL items**:
- **BL-009** (ReportRenderer) — gap analysis findings rendered as deliverable
- **BL-016** (Multi-agent loops) — gap detection agent
- **New: BL-027** (Process Template Engine)

**Platform primitive required**: Layer 1: Process modeling + gap detection (new subsystem)

**Effort estimate**: **M** (Medium) — 5 SP
- 2 SP: 8–10 process template definitions + Pydantic schema
- 1.5 SP: Gap detection agent + gap scoring algorithm
- 1 SP: Gap reporter + recommendations
- 0.5 SP: Tests + documentation

**Data schema implications**:
```
ProcessStage
  - stage_id: str
  - name: str
  - expected_document_types: list[str]
  - control_points: list[str]
  - handoff_to: str (next stage)
  - expected_parties: list[str]
  - average_duration_days: int

ProcessTemplate
  - id: str
  - name: str
  - domain: str (accounting | procurement | hr | contracts | etc.)
  - stages: list[ProcessStage]
  - critical_control_points: list[str] (must be present)
  - average_cycle_time_days: int
  - typical_document_count: int
  - created_by: str (NYQST | domain_expert)
  - version: str

IdentifiedGap
  - gap_id: str (UUID)
  - stage_id: str
  - expected_doc_type: str
  - status: str (missing_creation | missing_evidence | lost_hidden)
  - severity: str (critical | high | medium | low)
  - evidence: str (e.g., "PO expected but 3 invoices from this vendor have no matching PO")
  - remediation_suggestion: str
  - found_at: datetime
```

**Current code gaps**:
- No process template storage
- No gap detection algorithm
- No control point validation

**Wave**: **W1** — Enables Phase 1 observations to map to process flows

**Owner recommendation**: Product lead (process design) + backend track lead

---

### GAP-047 — Dimension Builder UI (Interactive Pole Naming) Not Specified

**ID**: GAP-047
**Title**: Dimension Builder Widget — Interactive Pole Validation
**Severity**: **HIGH** (Core UX for discovery phase)
**Category**: Design Gap → Frontend Component

**Description**:

DocuIntelli's Phase 3 ("Discover Dimensions") produces a discovered dimension set (from GAP-044). The user must then *validate* these dimensions interactively: confirm pole names make sense, adjust thresholds, group related dimensions, etc. The DOCUINTELLI-SKILLS-EXTRACT lists:

**Skill #10 — Dimension Scoring & Visualization:**
- UI Requirements: "Interactive dimension pole-naming and clustering validation"

**Current state**: BL-011 (UI + GENUI) covers generic UI components but does not specify a "dimension builder" widget. There is no interactive pole naming, no clustering visualization, no feedback loop for users to refine discovered dimensions.

**Required state**: A dimension builder widget that:
- Displays discovered dimensions as (low_pole ↔ high_pole) pairs with current names
- Allows inline editing of pole names + descriptions
- Shows document cluster extremes (most extreme low example, most extreme high example)
- Visual clustering view: scatterplot or dendrogram of documents across the dimension
- Validation feedback: user confirms "yes this is a real differentiator" or "no, merge with another dimension"
- Returns refined dimension set to the analysis pipeline

**Affected BL items**:
- **BL-011** (UI + GENUI) — new component
- **BL-025** (Dimension Discovery Agent) — consumes user feedback
- **New: BL-028** (Dimension Builder Widget)

**Platform primitive required**: Layer 1: Interactive dimension discovery UI (new component)

**Effort estimate**: **M** (Medium) — 5 SP
- 1.5 SP: Dimension builder React component (pole name editor, validation UI)
- 1.5 SP: Clustering visualization (D3/Plotly cluster scatter)
- 1 SP: Feedback capture + event emission (user confirmed X, rejected Y, renamed Z)
- 1 SP: Tests + documentation

**Data schema implications** (frontend + backend):
```typescript
// Frontend state
DiscoveredDimensionUI {
  id: string;
  lowPoleName: string;       // editable
  highPoleName: string;      // editable
  lowPoleDescription: string; // editable
  highPoleDescription: string; // editable
  confidenceScore: number;
  exampleLow: DocumentPreview;  // most extreme low doc
  exampleHigh: DocumentPreview; // most extreme high doc
  validationStatus: 'unvalidated' | 'confirmed' | 'rejected' | 'merged_into';
  mergedIntoId?: string;
}

DimensionValidationFeedback {
  dimensionId: string;
  action: 'confirm' | 'reject' | 'rename' | 'merge';
  newPoleName?: string;
  mergeTargetId?: string;
  timestamp: datetime;
}
```

**Current code gaps**:
- No dimension builder component in frontend
- No clustering visualization (would need D3.js or Plotly.js)
- No feedback loop integration

**Wave**: **W1** — Depends on BL-025 dimension discovery; enables Phase 3 user interaction

**Owner recommendation**: Frontend track lead (BL-011 owner)

---

### GAP-048 — Multi-Dimensional Visualization Engine Not Specified

**ID**: GAP-048
**Title**: Multi-Dimensional Visualization Engine
**Severity**: **HIGH** (Core differentiator; gates findings presentation)
**Category**: Design Gap → Frontend Component

**Description**:

DocuIntelli's final deliverable is a multi-dimensional profile of the corpus: "documents × dimensions" heatmap, radar charts for individual documents, parallel coordinates for clustering. The DOCUINTELLI-SKILLS-EXTRACT lists:

**Skill #10 — Dimension Scoring & Visualization:**
- UI Requirements:
  - Dimensional heatmap (documents × dimensions, colored by score)
  - Radar chart (multi-dimension profile for one document)
  - Parallel coordinates (visualize multi-dimensional clustering)
  - Dimension explanation tooltip (why did this doc get this score?)

**Current state**: BL-009 (ReportRenderer) renders static GML markup (text + charts). But standard charting libraries (Recharts, Plotly) are designed for 2D+ data, not high-dimensional (10+ dimensions) data. Parallel coordinates, heatmaps, and radar charts require specialized visualization libraries.

**Required state**: A visualization engine that:
- Renders dimensional heatmap: document_id × dimension_name → score (color-coded)
- Renders radar chart for one document (polar plot, one axis per dimension)
- Renders parallel coordinates: one vertical axis per dimension, lines connect document points
- Hover tooltips explain score: "Document X scored 0.8 on Complexity because [evidence]"
- Interactive filtering: click dimension axis to filter documents
- Export: render as PNG, SVG, or embed in GML report

**Affected BL items**:
- **BL-009** (ReportRenderer) — renders visualization
- **BL-011** (UI + GENUI) — visualization component
- **BL-029** (Visualization Engine) — new item
- Impacts BL-013 (streaming frontend) — stream visualization updates as scores complete

**Platform primitive required**: Layer 1: High-dimensional visualization (new library integration)

**Effort estimate**: **L** (Large) — 7 SP
- 1 SP: Dimensional heatmap component (Plotly.js parallel coordinates + custom styling)
- 1 SP: Radar chart component (Plotly.js polar scatter)
- 1 SP: Parallel coordinates visualization (Plotly.js or custom D3)
- 2 SP: Score explanation tooltips + interaction logic
- 1 SP: GML integration (embed visualization in report rendering)
- 1 SP: Tests + documentation

**Library additions**:
- **plotly.js** (already in BL-009, reuse for high-dimensional viz)
- **parallel-coordinates-d3** or custom D3 module (if Plotly insufficient)

**Current code gaps**:
- No parallel coordinates visualization
- No high-dimensional heatmap component
- No score explanation system

**Wave**: **W2** — After BL-009 ReportRenderer + dimension scoring complete; enables Phase 5 reporting

**Owner recommendation**: Frontend track lead + visualization specialist

---

### GAP-049 — Corpus Comparison Agent Not Specified

**ID**: GAP-049
**Title**: Corpus Comparison Agent — Side-by-Side Analysis
**Severity**: **MEDIUM** (Nice-to-have; gates comparative analysis)
**Category**: Design Gap → Platform Primitive Extension

**Description**:

DocuIntelli's final skill is "Corpus Comparison" (Skill #12 in the extract):

> "Analyze two corpora side-by-side, compare profiles, anomalies."

Example use case: tenant uploads 2024 vendor contracts and 2023 vendor contracts; they want to understand what's changed (new clauses, removed protections, risk deltas).

**Current state**: The baseline analysis pipeline (BL-001 through BL-022, plus BL-023 through BL-028) analyzes *one* corpus at a time. There is no multi-corpus analysis, no comparison agent, no delta reporting.

**Required state**: A corpus comparison agent that:
- Takes two corpora (CorpusAnalysis results for corpus A and corpus B)
- Compares profiles (doc count, temporal span, party distribution)
- Compares dimension scores (per-document and aggregate)
- Identifies gaps unique to A or unique to B (control missing in 2024 contracts)
- Identifies anomalies unique to A or unique to B (fraud pattern emerged)
- Generates delta report (what's new, what's gone, what's changed)

**Affected BL items**:
- **BL-016** (Multi-agent loops) — comparison is an agent workflow
- **BL-017** (LLM integration) — LLM synthesizes delta narrative
- **New: BL-030** (Corpus Comparison Agent)

**Platform primitive required**: Layer 1: Comparative analysis orchestration (new agent)

**Effort estimate**: **M** (Medium) — 4 SP
- 1 SP: Corpus delta schema (Pydantic `CorpusDelta`)
- 1.5 SP: Comparison agent logic (profile diff, dimension diff, gap diff, anomaly diff)
- 1 SP: Delta report generation + GML rendering
- 0.5 SP: Tests + documentation

**Data schema implications**:
```
CorpusDelta
  - corpus_a_id: str
  - corpus_b_id: str
  - profile_delta: dict (count_delta, parties_delta, temporal_span_delta)
  - dimension_deltas: list[DimensionDelta]
  - gap_analysis_delta: list[GapDelta]
  - anomaly_delta: list[AnomalyDelta]
  - narrative_summary: str (LLM-generated)
  - recommendations: list[str]
  - created_at: datetime

DimensionDelta
  - dimension_id: str
  - corpus_a_avg_score: float
  - corpus_b_avg_score: float
  - score_delta: float
  - interpretation: str (e.g., "Corpus B documents are significantly more complex")

GapDelta
  - process_stage: str
  - gap_in_corpus_a: bool
  - gap_in_corpus_b: bool
  - interpretation: str
```

**Current code gaps**:
- No corpus comparison agent
- No delta scoring / interpretation

**Wave**: **W2** — Post-single-corpus analysis; nice-to-have for v1

**Owner recommendation**: Backend track lead (BL-016 owner)

---

## Summary Table: New Gaps (GAP-042 through GAP-049)

| GAP | Title | Severity | Category | New BL Item | Effort | Wave | Blocks |
|-----|-------|----------|----------|-------------|--------|------|--------|
| 042 | Multi-Framework Reconciliation | CRITICAL | Design | BL-023 | M (5 SP) | W0/W1 | Domain modules |
| 043 | Reasoning Tool Library | CRITICAL | Implementation | BL-024 | M (6 SP) | W0/W1 | BL-016, BL-017 |
| 044 | Dimension Discovery Agent | HIGH | Design | BL-025 | L (7 SP) | W1 | Phase 3 workflow |
| 045 | Watch-For Pattern Library | HIGH | Design | BL-026 | L (6 SP) | W1 | BL-009 findings |
| 046 | Process Template Engine | HIGH | Design | BL-027 | M (5 SP) | W1 | Gap analysis |
| 047 | Dimension Builder Widget | HIGH | Design | BL-028 | M (5 SP) | W1 | Phase 3 UX |
| 048 | Multi-Dim Visualization | HIGH | Design | BL-029 | L (7 SP) | W2 | BL-009 rendering |
| 049 | Corpus Comparison Agent | MEDIUM | Design | BL-030 | M (4 SP) | W2 | Comparative analysis |

**Total new effort**: 45 SP across 8 items

---

## Impact on Implementation Plan

### Current Baseline
- **BL-001 through BL-022**: 80 SP (Research Module foundation)
- **Waves**: 4 waves, 7 weeks, 5 parallel tracks
- **Critical path**: BL-022 → BL-001 → BL-002 → BL-004/BL-005/BL-009 (3–4 weeks)

### With DocuIntelli Extensions (BL-023 through BL-030)

**New effort**: 45 SP added
**New timeline** (worst case, if sequential): 80 + 45 = 125 SP → 8–9 weeks
**Optimized timeline** (parallel tracks): 80 + ~20 SP on critical path (framework reconciliation + reasoning library) → 7–8 weeks

**Wave Redistribution**:

| Wave | Current BL | New BL | Total SP | Focus | Weeks |
|------|-----------|--------|----------|-------|-------|
| P0 | (fixes) | (none) | 5–10 | CI/CD, bug fixes, specs | 0.5 |
| W0 | BL-001 through BL-007 | BL-023 (prep), BL-024 (prep) | 40 + 10 | Foundation + reasoning prep | 1.5 |
| W1 | BL-008 through BL-016 | BL-025, BL-026, BL-027, BL-028 | 35 + 23 | Domain logic + phase 3 UX | 2.5 |
| W2 | BL-017 through BL-022 | BL-029, BL-030 | 20 + 11 | Reporting + comparative | 2 |
| W3 | (polish, enterprise) | (none) | (deferred) | v1.1, v1.5 items | — |

**Realistic timeline**: 7.5 weeks (vs. 7 weeks baseline) — add 1 week, but domain module (DocuIntelli) is now *ready* to launch at end of W2 instead of requiring separate implementation phase.

### Dependency Chains

**Critical path for DocuIntelli**:
1. **P0**: Fix GAP-022, GAP-023 (race conditions)
2. **W0**: BL-001 (orchestrator), BL-023 (multi-framework reconciliation prep)
3. **W0/W1**: BL-024 (reasoning tool library), BL-025 (dimension discovery)
4. **W1**: BL-026 (pattern library), BL-027 (process templates), BL-028 (dimension builder)
5. **W2**: BL-029 (visualization), BL-030 (comparison)

**Non-critical path** (can parallelize):
- BL-003 (web research) independent of BL-023-030
- BL-008 through BL-022 (basic platform) independent except where noted

---

## Priority Matrix: Effort vs. Domain Enablement

**Effort Score** (1=trivial, 5=major):
- BL-023: 4 (critical orchestration)
- BL-024: 4 (guides all reasoning)
- BL-025: 5 (enables phase 3, requires ML)
- BL-026: 5 (150+ patterns, large dataset)
- BL-027: 4 (template design + matching)
- BL-028: 4 (interactive component)
- BL-029: 5 (complex visualization)
- BL-030: 3 (agent wrapper on existing logic)

**Domain Enablement** (1=nice-to-have, 5=gating):
- BL-023: 5 (multi-framework is differentiator)
- BL-024: 5 (reasoning is core capability)
- BL-025: 4 (discovery is phase 3)
- BL-026: 5 (anomalies are findings)
- BL-027: 4 (gaps are findings)
- BL-028: 4 (UX for discovery)
- BL-029: 4 (findings presentation)
- BL-030: 2 (comparative is nice-to-have)

**Recommended execution order**:
1. **Wave 0**: BL-023, BL-024 (highest enablement, start early)
2. **Wave 1**: BL-025, BL-026, BL-027, BL-028 (core domain logic)
3. **Wave 2**: BL-029, BL-030 (presentation layer)

---

## Schema Implications: New Pydantic/TypeScript Types

### Core Entities

```python
# Backend (Pydantic)

class Framework(BaseModel):
    id: str  # slug
    category: str  # sense_making | risk | operational
    name: str
    description: str
    core_question: str
    assumptions: list[str]
    best_for: list[str]  # use case slugs
    blind_spots: list[str]
    compatible_frameworks: list[str]  # framework IDs
    version: str

class MentalModel(BaseModel):
    id: str
    name: str
    description: str
    category: str
    inversion_question: str
    question_sequence: list[str]
    validation_rules: list[dict]
    applicable_when: list[str]  # use case slugs
    version: str

class WatchForPattern(BaseModel):
    id: UUID
    pattern_id: str
    document_types: list[str]
    category: str  # duplicate | expiration | missing | formatting
    severity: str  # critical | high | medium | low
    description: str
    detection_method: str  # sql | llm | regex
    detection_logic: dict
    remediation_suggestion: str

class ProcessTemplate(BaseModel):
    id: str
    name: str
    domain: str
    stages: list[ProcessStage]
    critical_control_points: list[str]
    version: str

class DiscoveredDimension(BaseModel):
    id: UUID
    low_pole_name: str
    high_pole_name: str
    domain_emergent: bool
    clustering_method: str
    silhouette_score: float
    validation_status: str  # unvalidated | confirmed | rejected

class FrameworkResult(BaseModel):
    framework_id: str
    corpus_id: str
    findings: dict[str, Any]
    confidence_scores: dict[str, float]
    timestamp: datetime

class ConsensusView(BaseModel):
    merged_findings: dict[str, Any]
    unresolved_conflicts: list[ConflictRecord]
    consensus_confidence: float

class CorpusDelta(BaseModel):
    corpus_a_id: str
    corpus_b_id: str
    profile_delta: dict
    dimension_deltas: list[DimensionDelta]
    narrative_summary: str
```

### Frontend (TypeScript)

```typescript
// Framework reconciliation state
interface FrameworkResult {
  frameworkId: string;
  findings: Record<string, unknown>;
  confidenceScores: Record<string, number>;
  timestamp: Date;
}

interface ConsensusView {
  mergedFindings: Record<string, unknown>;
  unresolvedConflicts: ConflictRecord[];
  consensusConfidence: number;
}

// Dimension discovery
interface DiscoveredDimensionUI {
  id: string;
  lowPoleName: string;
  highPoleName: string;
  confidenceScore: number;
  validationStatus: 'unvalidated' | 'confirmed' | 'rejected';
}

// Visualization state
interface DimensionalHeatmapData {
  documents: DocumentId[];
  dimensions: DimensionId[];
  scores: number[][];  // [doc_idx][dim_idx]
}

interface ParallelCoordinatesData {
  axes: Array<{ name: string; min: number; max: number }>;
  lines: Array<{ documentId: string; values: number[] }>;
}

interface RadarChartData {
  axes: string[];  // dimension names
  values: number[];
}
```

---

## Implementation Checklist for DocuIntelli Gaps

### P0 (Pre-Wave 0)
- [ ] Fix GAP-022 (RunEvent sequence TOCTOU race)
- [ ] Fix GAP-023 (arq worker registry initialization)
- [ ] Spec GAP-017 (NDM v1 JSON schema)
- [ ] Spec GAP-014 (LangGraph → SSE event contract)

### W0
- [ ] **BL-023**: Multi-framework reconciliation engine
  - [ ] Framework registry schema
  - [ ] Parallel framework application logic
  - [ ] Conflict detector
  - [ ] Consensus synthesizer

- [ ] **BL-024**: Reasoning tool library (partial)
  - [ ] Define 16 mental models
  - [ ] Mental model application agent (prototype)
  - [ ] Validation framework

### W1
- [ ] **BL-025**: Dimension discovery agent
  - [ ] Clustering algorithm integration (scikit-learn)
  - [ ] Pole identification + naming
  - [ ] Discovery session state management

- [ ] **BL-026**: Watch-for pattern library
  - [ ] 150+ pattern definitions (data load)
  - [ ] Pattern matcher (SQL + LLM + regex engines)
  - [ ] Anomaly aggregator

- [ ] **BL-027**: Process template engine
  - [ ] 8–10 template definitions (data load)
  - [ ] Gap detection algorithm
  - [ ] Gap severity scorer

- [ ] **BL-028**: Dimension builder widget
  - [ ] React component (pole editor, validation)
  - [ ] Clustering visualization
  - [ ] Feedback capture + integration

### W2
- [ ] **BL-029**: Multi-dimensional visualization
  - [ ] Heatmap component
  - [ ] Radar chart component
  - [ ] Parallel coordinates
  - [ ] GML integration

- [ ] **BL-030**: Corpus comparison agent
  - [ ] Delta schema + scorer
  - [ ] Comparison agent logic
  - [ ] Delta report generation

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Dimension discovery (BL-025) requires ML expertise | HIGH | Hire research scientist in W0; prototype with kmeans first |
| 150+ pattern definitions (BL-026) is data heavy | MEDIUM | Crowdsource from domain experts; start with 30 patterns, expand |
| Visualization library (BL-029) may have learning curve | MEDIUM | Prototype with Plotly.js + D3; allocate 1 week spike |
| Multi-framework reasoning (BL-023) complex orchestration | HIGH | Prototype with 2 frameworks first; scale to 16 in v1.5 |
| Total effort (45 SP) overruns | HIGH | Defer BL-030 (corpus comparison) to v1.1 if needed |

---

## Conclusion

The 8 DocuIntelli gaps (GAP-042 through GAP-049) represent **core platform capabilities** that must be built as part of the Layer 1 foundation, not as separate domain module scaffolding. These gaps extend the baseline by ~45 SP across 8 BL items, adding 1–1.5 weeks to the critical path but enabling DocuIntelli v1 to launch as a complete "cognitive partner for document intelligence" system.

**Key decisions needed**:
1. **BL-023 / BL-024 critical path**: Confirm framework reconciliation + reasoning library in Wave 0 vs. Wave 1 (recommend W0 for early de-risking)
2. **BL-025 ML spike**: Allocate research scientist 1 week in W0 for unsupervised learning prototype
3. **BL-026 pattern data**: Confirm 150+ patterns are available or if starting with 30 + user-defined patterns
4. **BL-030 deferral**: If schedule pressure, move corpus comparison to v1.1 (medium priority)

---

**Document prepared**: 2026-02-20
**Status**: Ready for architecture review + wave planning
**Next steps**: Integrate gaps into GIT-ISSUES structure; assign BL-023 through BL-030 to sprint planning
