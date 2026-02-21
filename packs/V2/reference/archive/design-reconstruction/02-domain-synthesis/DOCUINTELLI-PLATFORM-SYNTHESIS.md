# DocuIntelli Platform Synthesis

**Document Type**: Platform-Product Bridge Reference
**Version**: 1.0
**Date**: 2026-02-20
**Status**: AUTHORITATIVE — Engineering implementation guide
**Audience**: Backend engineers, frontend engineers, domain module implementors
**Sources**: DOCUINTELLI-SKILLS-EXTRACT, PLATFORM-ARCHITECTURE-SYNTHESIS, BACKEND-SOURCE-SCAN, BACKEND-PATTERNS

---

## 1. Executive Summary

What DocuIntelli demands of the NYQST platform in five non-negotiable requirements:

1. **Multi-agent parallel orchestration with Send() fan-out** — The 5-phase workflow requires parallel framework application (Phase 5: run all selected frameworks simultaneously). This is the same Send() fan-out the research orchestrator uses for parallel task execution. DocuIntelli is not harder than research; it is the same primitive applied to a different domain.

2. **Document ingestion as a first-class primitive, not an afterthought** — DocuIntelli processes corpora of 54 distinct document types (PDFs, emails, spreadsheets, scanned images). BL-008 must be fully realized before DocuIntelli Phase 1 (Observation Engine) can operate. OCR, email threading, and reference extraction are not optional features.

3. **A knowledge base of 136 domain-encoded rules** — 54 document types, 16 analytical frameworks, 17 mental models, 10 use cases, and 30+ dimensions are not computed at runtime — they are the platform's knowledge substrate. These must be stored as configuration artifacts and loaded into agent context at analysis time.

4. **Interactive human-in-the-loop refinement across all five phases** — DocuIntelli is not a batch pipeline; it is a cognitive partner. Users confirm framework selections, name dimension poles, override anomaly classifications, and re-trigger scoring. Every phase is a checkpoint. LangGraph interrupt patterns (already designed in BL-009 / Agent Management) are required throughout.

5. **A new class of visualization GML tags** — Radar charts, dimensional scatter plots, parallel coordinates, heatmaps, and reference graphs cannot be expressed with the current 18-tag GML system. A DocuIntelli UI extension to GML is required as a new set of `gml-corpus-*` tags rendered by Plotly.js via the existing rehype-to-JSX pipeline.

---

## 2. Capability to Primitive Mapping Table

All 11 DocuIntelli capabilities mapped to NYQST platform primitives, existing backlog items, and gaps.

| DocuIntelli Capability | Platform Primitive | Existing BL Item | Gap? | Priority |
|------------------------|-------------------|-----------------|------|----------|
| Observation Engine (Phase 1): classify documents without bias | Document Management (Primitive 4) + LLM Integration (Primitive 7) | BL-008 (document ingestion) | Partial — BL-008 covers upload/storage; OCR and email threading not implemented | CRITICAL |
| Observation Engine: extract references, parties, identifiers | MCP Tool Layer (Primitive 3) + Context Engineering (Primitive 6) | BL-002 (MCP tools), BL-003 (standalone tools) | Gap — reference extraction tool not yet defined | HIGH |
| Observation Engine: corpus statistics (distribution, temporal, closure) | Agentic Runtime (Primitive 1) + Billing/Metering (Primitive 10) | BL-005 (agent memory/state) | Gap — corpus statistician is new logic, no analog in research module | HIGH |
| Framework Selection Engine (Phase 2): recommend frameworks from corpus profile | LLM Integration (Primitive 7) + Context Engineering (Primitive 6) | BL-017 (LLM reasoning), BL-007 (context engineering) | Gap — framework selector prompt + decision table is domain-specific new content | HIGH |
| Framework Selection: multi-select, compatibility check | Agentic Runtime (Primitive 1) | BL-016 (multi-agent loops) | Gap — compatibility matrix is new knowledge artifact; no BL item | MEDIUM |
| Dimension Discovery Engine (Phase 3): find axes documents vary on | Agentic Runtime (Primitive 1) + LLM Integration (Primitive 7) | BL-016, BL-017 | Gap — emergent dimension discovery requires unsupervised comparison; new BL-025 needed | HIGH |
| Dimension Discovery: pairwise comparison, clustering | MCP Tool Layer (Primitive 3) | BL-003 (standalone tools) | Gap — pairwise comparison tool + K-means clustering not present | HIGH |
| Use-Case Weighting Engine (Phase 4): apply dimension weights for purpose | Context Engineering (Primitive 6) + LLM Integration (Primitive 7) | BL-007, BL-017 | Gap — 10 use cases + weighting matrix are new knowledge artifacts | MEDIUM |
| Use-Case: novel use case derivation from Q&A | Agentic Runtime (Primitive 1) + Agent Management (Primitive 9) | BL-016, BL-009 | Gap — interactive Q&A derivation; uses existing interrupt patterns but needs new prompts | MEDIUM |
| Scoring and Clustering Engine (Phase 5): score documents on weighted dimensions | MCP Tool Layer (Primitive 3) + Agentic Runtime (Primitive 1) | BL-003 (standalone tools), BL-001 (LangGraph) | Gap — scoring rule engine per dimension is new logic; clustering tool not present | HIGH |
| Multi-Framework Fan-out: run frameworks A through N in parallel | Agentic Runtime (Primitive 1) — Send() fan-out | BL-001 (LangGraph Send()) | Partial — Send() gap being closed for research module; same primitive applies | CRITICAL |
| Mental Model Tool Library: 17 reasoning patterns on demand | LLM Integration (Primitive 7) + MCP Tool Layer (Primitive 3) | BL-017, BL-002 | Gap — mental model prompt library is new knowledge; no BL item (new BL-024 needed) | MEDIUM |
| Cross-Framework Reconciliation: compare + resolve conflicting framework results | Agentic Runtime (Primitive 1) + LLM Integration (Primitive 7) | BL-016 (multi-agent loops) | Gap — reconciler agent is new; no analog in research module (new BL-023 needed) | HIGH |
| Document Type Classification: recognize 54 types, extract key fields | LLM Integration (Primitive 7) + Document Management (Primitive 4) | BL-008, BL-017 | Gap — 54-type taxonomy + key field extractor + watch-for patterns are new knowledge artifacts | CRITICAL |
| Watch-For Pattern Matching: detect known anomaly patterns per document type | MCP Tool Layer (Primitive 3) | BL-003 (standalone tools) | Gap — 150+ watch-for patterns need searchable store + matcher (new BL-026 needed) | HIGH |
| Gap Analysis Engine: identify missing documents vs. expected process flows | LLM Integration (Primitive 7) + Provenance (Primitive 5) | BL-012 (provenance), BL-015 (reports) | Gap — process template library (AP cycle, contract lifecycle, etc.) is new knowledge (new BL-027 needed) | HIGH |
| Anomaly Detection: find documents that don't fit | MCP Tool Layer (Primitive 3) + LLM Integration (Primitive 7) | BL-003, BL-017 | Gap — isolation forest or rule-based anomaly scorer; frequency baselining per corpus (new BL-028 needed) | HIGH |
| Corpus Profile: aggregate stats as analysis input | Provenance (Primitive 5) + Document Management (Primitive 4) | BL-012 (provenance), BL-010 (data schema) | Gap — CorpusProfile entity type needed; not in current 12-type entity system | HIGH |
| Dimension Scoring + Visualization | GENUI (Primitive 2) + MCP Tool Layer (Primitive 3) | BL-011 (GENUI), BL-003 | Gap — radar charts, scatter plots, parallel coordinates require new GML tags + Plotly schemas (new BL-029 needed) | MEDIUM |
| Streaming Phase 1 observations to UI | Reactive State and Streaming (Primitive 8) | BL-004 (streaming), BL-013 (streaming frontend) | LOW gap — existing SSE infrastructure carries new event types with no architecture change | LOW |
| Per-corpus analysis state across long sessions | Context Engineering (Primitive 6) + Agentic Runtime (Primitive 1) | BL-005 (agent state), BL-006 (async sessions) | Partial — ResearchState pattern extends to DocuIntelliState; same checkpointing | LOW |
| Report/export of analysis findings | GENUI (Primitive 2) + Provenance (Primitive 5) | BL-015 (report generation), BL-012 | LOW gap — existing report pipeline carries DocuIntelli output; needs new GML sections | LOW |
| Billing per corpus or per document analyzed | Billing and Metering (Primitive 10) | BL-021 (billing), BL-012 | LOW gap — Run-level cost_cents tracking already present; per-corpus billing is a configuration change | LOW |
| Auth, multi-tenant isolation, JWT/API key | Layer 3 Enterprise Shell | Fully implemented — 11 API routers, Tenant/User/APIKey models | None | DONE |

**New BL items required (not covered by current backlog):**

| New Item | Capability | Description |
|----------|-----------|-------------|
| BL-023 | Cross-Framework Reconciliation | Multi-perspective reasoning: run frameworks in parallel, compare results, resolve conflicts |
| BL-024 | Mental Model Prompt Library | 17 reasoning tools with domain-specific instantiation, guided Q&A application |
| BL-025 | Dimension Discovery Agent | Unsupervised/LLM-guided emergent dimension discovery; pairwise document comparison |
| BL-026 | Pattern Library and Matcher | 150+ watch-for patterns per document type; searchable store, pattern matching execution |
| BL-027 | Process Template Engine | Standard process flows (AP cycle, contract lifecycle, etc.); gap specification format |
| BL-028 | Anomaly Detection Engine | Per-corpus frequency baselining; isolation forest or LOF; rule-based fraud indicators |
| BL-029 | Dimensional Visualization Engine | Radar charts, scatter plots, parallel coordinates as new GML tags; Plotly.js rendering |

---

## 3. Domain Module Architecture

DocuIntelli is the SECOND domain module (after the Research Module) but is the FIRST to test Document Management (Primitive 4) at full depth. The Research Module proves all 10 primitives in shallow form; DocuIntelli proves Document Management and Dimension Reasoning at production depth.

### Layer 1 Primitives Exercised by DocuIntelli

| Primitive | Research Module Usage | DocuIntelli Usage | Delta |
|-----------|----------------------|-------------------|-------|
| Agentic Runtime | 3-node StateGraph, Send() for parallel tasks | 5-phase StateGraph, Send() for parallel framework application | Deeper fan-out; interactive interrupt per phase |
| GENUI | GML report + website generation | Corpus profile cards, dimension heatmaps, anomaly lists, gap reports | New GML tag family required |
| MCP Tool Layer | 4 tools (search, list, get, compare) | 40+ tools (OCR, extractor, scorer, clusterer, pattern matcher, gap analyzer) | 10x tool surface |
| Document Management | Upload + store for RAG retrieval | Full corpus ingestion: OCR, email parsing, reference extraction, type classification | Full realization of BL-008 |
| Provenance and Citation | Entity references in reports | Per-observation provenance (how we knew this about a document) | Same pattern, higher volume |
| Context Engineering | DataBrief (financial_data, market_data) | CorpusDataBrief (corpus_profile, selected_frameworks, discovered_dimensions) | Same pattern, different schema |
| LLM Integration | with_structured_output() for planning + synthesis | with_structured_output() for ALL 5 phases (CorpusProfile, FrameworkSet, DimensionSet, WeightSet, AnalysisOutput) | Higher structured output density |
| Reactive State and Streaming | 22 event types; plan/task updates | Same infrastructure; add CORPUS_PHASE_UPDATE, FRAMEWORK_SELECTED, DIMENSION_DISCOVERED event types | New event types only |
| Agent Management | Policy templates, ApprovalRequest model | Interactive interrupts at phase transitions (user confirms frameworks, validates dimensions) | Same mechanism; more interrupt points |
| Billing and Metering | Per-run cost_cents | Per-corpus cost_cents (corpus = billing unit, not run) | Configuration change only |

### Agents Required (LangGraph Nodes)

| Agent | Role | Research Analog | New or Extend? |
|-------|------|----------------|----------------|
| `observation_engine_node` | Phase 1: observe all documents, produce CorpusProfile | `planner_node` (produces PlanSet) | NEW — different purpose, same pattern |
| `document_classifier_agent` | Sub-agent: classify each doc into 54 types | `research_executor` (handles one task) | NEW — dispatched via Send() from observation_engine |
| `reference_extractor_agent` | Sub-agent: extract cross-document links | `research_executor` | NEW — dispatched via Send() |
| `metadata_extractor_agent` | Sub-agent: extract dates, parties, identifiers | `research_executor` | NEW — dispatched via Send() |
| `corpus_statistician_node` | Aggregate observation outputs into CorpusProfile | `fan_in_aggregation_node` | EXTEND — same fan-in pattern |
| `framework_selector_node` | Phase 2: recommend frameworks from CorpusProfile | `meta_reasoning_node` (gap analysis) | NEW — different reasoning; human interrupt before output |
| `dimension_discoverer_node` | Phase 3: find axes documents vary on | `synthesis_node` (integrates findings) | NEW — requires unsupervised comparison logic |
| `use_case_weighting_node` | Phase 4: apply dimension weights for purpose | No direct analog | NEW — human selects use case; agent applies weights |
| `framework_executor_agent` | Phase 5: apply one framework to corpus | `research_executor` | EXTEND — same Send() pattern, different tool set |
| `scoring_agent` | Phase 5: score documents on weighted dimensions | No direct analog | NEW |
| `gap_analyst_agent` | Phase 5: identify missing documents | No direct analog | NEW |
| `anomaly_detector_agent` | Phase 5: identify documents that don't fit | No direct analog | NEW |
| `cross_framework_reconciler_node` | Phase 5: compare + synthesize framework results | `synthesis_node` | EXTEND — same synthesis pattern, multi-source input |
| `analysis_report_node` | Produce final analysis deliverable | `report_generation_node` | EXTEND — same GML streaming pipeline, new content |

### Tools Required (MCP / Standalone)

| Tool | Type | Research Analog | New or Extend? |
|------|------|----------------|----------------|
| `ocr_extraction_tool` | MCP | None | NEW |
| `email_thread_parser_tool` | MCP | None | NEW |
| `document_type_classifier_tool` | MCP | None | NEW — calls LLM with 54-type taxonomy |
| `reference_pattern_extractor_tool` | MCP | None | NEW |
| `temporal_sequencer_tool` | MCP | None | NEW |
| `framework_matcher_tool` | MCP | `search_documents` (returns relevant sources) | NEW — different logic, same interface pattern |
| `framework_compatibility_tool` | MCP | None | NEW |
| `pairwise_document_comparator_tool` | Standalone | `compare_manifests` | EXTEND — add semantic comparison |
| `dimension_scorer_tool` | Standalone | None | NEW |
| `k_means_clustering_tool` | Standalone | None | NEW |
| `anomaly_scorer_tool` | Standalone | None | NEW |
| `gap_specification_tool` | MCP | None | NEW — loads process template, computes expected docs |
| `watch_for_pattern_matcher_tool` | MCP | None | NEW |
| `weight_calculator_tool` | MCP | None | NEW |
| `mental_model_applier_tool` | MCP | None | NEW — selects model, returns structured questions |
| `search_documents` | MCP | REUSE | Reference search for cross-document link resolution |
| `get_document_info` | MCP | REUSE | Retrieve document content for observation |
| `compare_manifests` | MCP | REUSE | Corpus version diffing |

### UI Components Required (GenUI / GML Tags)

| Component | Existing GML Tag | New Tag Required |
|-----------|-----------------|-----------------|
| Corpus profile summary card | `gml-card` (extend) | `gml-corpus-profile` |
| Document type distribution histogram | `gml-chartcontainer` (Plotly bar) | Config only — reuse existing |
| Dimensional scatter plot | None | `gml-corpus-scatter` |
| Dimensional radar chart | None | `gml-corpus-radar` |
| Parallel coordinates view | None | `gml-corpus-parallel-coords` |
| Reference graph visualization | None | `gml-corpus-reference-graph` |
| Framework selector cards | `gml-card` (extend) | `gml-framework-selector` |
| Framework conflict warning | `gml-callout` | Config only |
| Dimension builder widget | None | `gml-dimension-builder` |
| Dimension axis heatmap | None | `gml-corpus-heatmap` |
| Use case selector | `gml-card` (extend) | `gml-use-case-selector` |
| Gap report table | `gml-table` (extend) | `gml-gap-report` |
| Anomaly list | `gml-table` (extend) | `gml-anomaly-list` |
| Annotation markup overlay | None | `gml-document-overlay` |
| Mental model selector | `gml-card` (extend) | `gml-mental-model-selector` |
| Cluster view | None | `gml-cluster-view` |
| Phase progress indicator | None | `gml-analysis-phase-tracker` |

All new GML tags render via the existing rehype-to-JSX pipeline. New tags require new React component registrations in `ReportRenderer`. Plotly.js already present; new chart types are configuration only.

### Data Models Required (Artifact Entity Types)

The current platform has a 12-type entity taxonomy. DocuIntelli requires 7 new entity types (see Section 5 for full definitions).

| New Entity Type | Description | Stored As |
|----------------|-------------|----------|
| `OBSERVATION` | Phase 1 output for one document | Artifact (JSON) |
| `CORPUS_PROFILE` | Aggregated Phase 1 statistics for a corpus | Artifact (JSON) |
| `FRAMEWORK_RESULT` | Output of applying one framework to the corpus | Artifact (JSON) |
| `DIMENSION_SCORE` | Per-document scores on all discovered dimensions | Artifact (JSON) |
| `ANALYSIS_FINDING` | Gap, anomaly, or recommendation with confidence | Artifact (JSON) |
| `CORPUS_ANALYSIS` | Full Phase 1-5 output (profile + results + findings) | Artifact (JSON) |
| `DOCUMENT_CLUSTER` | Group of documents with similar dimensional profiles | Artifact (JSON) |

---

## 4. Agent Design for DocuIntelli

### DocuIntelliState (LangGraph State)

Extends `ResearchState` with a parallel structure for document analysis.

```python
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Annotated
import operator

@dataclass
class DocuIntelliState:
    # Inherited from ResearchState pattern
    run_id: str
    session_id: str
    tenant_id: str
    user_id: str

    # Input
    corpus_manifest_id: str           # Pointer to ingested document set
    use_case: Optional[str] = None   # audit | dispute | fraud | ... (user selects Phase 4)
    requested_frameworks: Optional[List[str]] = None  # User overrides

    # Phase 1: Observation outputs
    document_observations: Annotated[List[dict], operator.add] = field(default_factory=list)
    corpus_profile: Optional[dict] = None   # CorpusProfile once Phase 1 completes

    # Phase 2: Framework selection
    candidate_frameworks: List[str] = field(default_factory=list)
    selected_frameworks: List[str] = field(default_factory=list)   # After user confirmation
    framework_compatibility_warnings: List[str] = field(default_factory=list)

    # Phase 3: Dimension discovery
    discovered_dimensions: List[dict] = field(default_factory=list)
    validated_dimensions: List[dict] = field(default_factory=list)  # After user validation

    # Phase 4: Weighting
    dimension_weights: Dict[str, float] = field(default_factory=dict)

    # Phase 5: Analysis outputs (fan-out results)
    framework_results: Annotated[List[dict], operator.add] = field(default_factory=list)
    document_scores: Dict[str, Dict[str, float]] = field(default_factory=dict)  # doc_id -> {dim: score}
    clusters: Annotated[List[dict], operator.add] = field(default_factory=list)
    gaps: Annotated[List[dict], operator.add] = field(default_factory=list)
    anomalies: Annotated[List[dict], operator.add] = field(default_factory=list)

    # Synthesis
    corpus_data_brief: Optional[dict] = None  # DocuIntelli analog of DataBrief
    analysis_artifact_id: Optional[str] = None

    # Control
    current_phase: str = "observe"   # observe | select | discover | weight | apply | synthesize
    phase_approved: bool = False      # Human confirmed current phase output
    error: Optional[str] = None
```

### LangGraph Graph Definition

```python
from langgraph.graph import StateGraph, END
from langgraph.constants import Send

def build_docuintelli_graph() -> StateGraph:
    graph = StateGraph(DocuIntelliState)

    # Phase 1: Parallel document observation
    graph.add_node("observation_engine_node", observation_engine_node)
    graph.add_node("document_classifier_agent", document_classifier_agent)
    graph.add_node("reference_extractor_agent", reference_extractor_agent)
    graph.add_node("metadata_extractor_agent", metadata_extractor_agent)
    graph.add_node("corpus_statistician_node", corpus_statistician_node)

    # Phase 2: Framework selection (with human interrupt)
    graph.add_node("framework_selector_node", framework_selector_node)
    graph.add_node("framework_confirmation_interrupt", framework_confirmation_interrupt)

    # Phase 3: Dimension discovery (with human interrupt)
    graph.add_node("dimension_discoverer_node", dimension_discoverer_node)
    graph.add_node("dimension_validation_interrupt", dimension_validation_interrupt)

    # Phase 4: Use-case weighting
    graph.add_node("use_case_weighting_node", use_case_weighting_node)

    # Phase 5: Parallel framework application (Send() fan-out)
    graph.add_node("framework_executor_agent", framework_executor_agent)
    graph.add_node("scoring_agent", scoring_agent)
    graph.add_node("gap_analyst_agent", gap_analyst_agent)
    graph.add_node("anomaly_detector_agent", anomaly_detector_agent)
    graph.add_node("cross_framework_reconciler_node", cross_framework_reconciler_node)

    # Synthesis and output
    graph.add_node("analysis_report_node", analysis_report_node)

    # Edges
    graph.set_entry_point("observation_engine_node")

    # Phase 1 fan-out: one agent per document (or per batch)
    graph.add_conditional_edges(
        "observation_engine_node",
        dispatch_observation_agents,  # returns list of Send() for each document
        {"document_classifier_agent": "document_classifier_agent",
         "reference_extractor_agent": "reference_extractor_agent",
         "metadata_extractor_agent": "metadata_extractor_agent"}
    )

    # Phase 1 fan-in
    graph.add_edge("document_classifier_agent", "corpus_statistician_node")
    graph.add_edge("reference_extractor_agent", "corpus_statistician_node")
    graph.add_edge("metadata_extractor_agent", "corpus_statistician_node")

    # Phase 2 (with interrupt for human confirmation)
    graph.add_edge("corpus_statistician_node", "framework_selector_node")
    graph.add_edge("framework_selector_node", "framework_confirmation_interrupt")
    graph.add_edge("framework_confirmation_interrupt", "dimension_discoverer_node")

    # Phase 3 (with interrupt for dimension validation)
    graph.add_edge("dimension_discoverer_node", "dimension_validation_interrupt")
    graph.add_edge("dimension_validation_interrupt", "use_case_weighting_node")

    # Phase 4
    graph.add_edge("use_case_weighting_node", "framework_executor_agent")  # via Send() fan-out

    # Phase 5 fan-out: one agent per selected framework
    graph.add_conditional_edges(
        "use_case_weighting_node",
        dispatch_framework_executors,  # returns Send("framework_executor_agent", {framework, state})
        {"framework_executor_agent": "framework_executor_agent"}
    )

    # Phase 5 parallel analysis agents (also fan-out)
    graph.add_conditional_edges(
        "use_case_weighting_node",
        dispatch_analysis_agents,  # returns Send() for scoring, gap, anomaly agents
        {"scoring_agent": "scoring_agent",
         "gap_analyst_agent": "gap_analyst_agent",
         "anomaly_detector_agent": "anomaly_detector_agent"}
    )

    # Phase 5 fan-in and reconciliation
    graph.add_edge("framework_executor_agent", "cross_framework_reconciler_node")
    graph.add_edge("scoring_agent", "cross_framework_reconciler_node")
    graph.add_edge("gap_analyst_agent", "cross_framework_reconciler_node")
    graph.add_edge("anomaly_detector_agent", "cross_framework_reconciler_node")

    graph.add_edge("cross_framework_reconciler_node", "analysis_report_node")
    graph.add_edge("analysis_report_node", END)

    return graph.compile(checkpointer=get_checkpointer())
```

### Fan-out Pattern: Same Send() Mechanism as Research Orchestrator

Phase 1 document observation fan-out:
```python
def dispatch_observation_agents(state: DocuIntelliState) -> List[Send]:
    """
    For each document in the corpus manifest, dispatch a parallel classifier.
    Same pattern as research module's dispatch_node dispatching research_executor tasks.
    """
    documents = load_corpus_manifest(state.corpus_manifest_id)
    sends = []
    for doc in documents:
        sends.append(Send("document_classifier_agent", {**state.__dict__, "target_document": doc}))
        sends.append(Send("reference_extractor_agent", {**state.__dict__, "target_document": doc}))
        sends.append(Send("metadata_extractor_agent", {**state.__dict__, "target_document": doc}))
    return sends
```

Phase 5 framework application fan-out:
```python
def dispatch_framework_executors(state: DocuIntelliState) -> List[Send]:
    """
    For each selected framework, dispatch a parallel executor.
    Exact same Send() pattern as research task fan-out.
    """
    return [
        Send("framework_executor_agent", {**state.__dict__, "framework_id": fw_id})
        for fw_id in state.selected_frameworks
    ]
```

---

## 5. New Entity Types Required

The current 12-type entity taxonomy (confirmed in BL-012 / Provenance design) must be extended with 7 DocuIntelli-specific types. These are stored as Artifacts (content-addressed, SHA-256 PK) and tracked via the existing Tags system.

### OBSERVATION
```python
class DocumentObservation(BaseModel):
    entity_type: str = "OBSERVATION"
    artifact_id: str           # Points to original document Artifact
    corpus_manifest_id: str    # Which corpus this observation belongs to

    # Raw observation (Phase 1 output — no interpretation)
    form: Dict[str, Any]       # format, structure, quality indicators
    content_summary: str       # What it literally says (truncated)
    identifiers: Dict[str, Any]  # PO numbers, invoice IDs, dates found
    parties: List[str]         # Named parties and their roles
    references: List[str]      # Document IDs this doc references
    marks: List[str]           # Stamps, signatures, corrections, annotations
    directionality: str        # "inbound" | "outbound" | "internal"
    file_format: str           # "pdf" | "email" | "spreadsheet" | "image"
    creation_date: Optional[date]
    modification_date: Optional[date]
    estimated_document_type: Optional[str]   # Tentative — not committed
    type_confidence: float     # 0.0-1.0
```

### CORPUS_PROFILE
```python
class CorpusProfile(BaseModel):
    entity_type: str = "CORPUS_PROFILE"
    corpus_manifest_id: str

    # Aggregate statistics
    document_count: int
    document_type_distribution: Dict[str, int]   # type -> count
    temporal_span: Optional[Tuple[date, date]]
    format_distribution: Dict[str, int]          # "pdf": 340, "email": 89
    reference_density: float      # avg references per document
    reference_closure: float      # % of referenced docs present in corpus
    duplication_rate: float       # % near-duplicate documents
    annotation_density: float     # avg annotation markers per document
    party_count: int
    unique_parties: List[str]
    average_document_age_days: float
    documents_per_party: Dict[str, int]

    # Derived signals for framework selection
    high_reference_density: bool  # > 0.5 references/doc
    low_reference_closure: bool   # < 0.6 closure rate
    heavy_annotation: bool        # > 3 marks/doc average
    multi_party: bool             # > 5 unique parties
    long_time_span_days: int      # temporal_span in days
```

### FRAMEWORK_RESULT
```python
class FrameworkResult(BaseModel):
    entity_type: str = "FRAMEWORK_RESULT"
    corpus_manifest_id: str
    framework_id: str   # "transactional" | "relational" | "evidentiary" | ...

    core_question: str               # What this framework asked
    findings: List[str]              # What it found
    blind_spots_triggered: List[str] # Which blind spots applied
    document_count_analyzed: int
    high_relevance_documents: List[str]  # artifact_ids most relevant to this framework
    confidence: float                # 0.0-1.0
    conflicts_with: List[str]        # framework_ids this result conflicts with
```

### DIMENSION_SCORE
```python
class DimensionScore(BaseModel):
    entity_type: str = "DIMENSION_SCORE"
    corpus_manifest_id: str

    # One entry per document per dimension
    scores: Dict[str, Dict[str, float]]   # doc_artifact_id -> {dimension_name: score}
    dimensions_applied: List[str]
    dimension_weights: Dict[str, float]   # use-case weights applied
    weighted_scores: Dict[str, float]     # doc_artifact_id -> weighted aggregate
    use_case: str
```

### ANALYSIS_FINDING
```python
class AnalysisFinding(BaseModel):
    entity_type: str = "ANALYSIS_FINDING"
    corpus_manifest_id: str
    finding_type: str   # "gap" | "anomaly" | "cluster" | "recommendation"

    title: str
    description: str
    severity: str   # "critical" | "high" | "medium" | "low" | "informational"
    confidence: float
    supporting_document_ids: List[str]   # artifact_ids as evidence
    framework_source: Optional[str]      # Which framework produced this
    mental_model_applied: Optional[str]  # Which mental model surfaced this
    recommended_action: Optional[str]
```

### CORPUS_ANALYSIS (Root Analysis Document)
```python
class CorpusAnalysis(BaseModel):
    entity_type: str = "CORPUS_ANALYSIS"
    corpus_manifest_id: str
    use_case: str
    run_id: str

    # References to other entities
    corpus_profile_id: str           # CORPUS_PROFILE artifact_id
    selected_framework_ids: List[str]
    framework_result_ids: List[str]  # FRAMEWORK_RESULT artifact_ids
    dimension_score_id: str          # DIMENSION_SCORE artifact_id
    finding_ids: List[str]           # ANALYSIS_FINDING artifact_ids

    # Synthesis
    executive_summary: str
    key_findings: List[str]          # Top 5-10 findings across all phases
    data_gaps: List[str]             # What analysis couldn't determine
    recommendations: List[str]
    confidence_overall: float
```

### DOCUMENT_CLUSTER
```python
class DocumentCluster(BaseModel):
    entity_type: str = "DOCUMENT_CLUSTER"
    corpus_manifest_id: str

    label: str                   # Auto-generated or user-named
    member_document_ids: List[str]
    centroid_dimensions: Dict[str, float]  # avg score per dimension
    defining_characteristics: List[str]    # What makes this cluster distinct
    suggested_interpretation: str          # LLM-generated explanation
```

---

## 6. Shared DataBrief Pattern

The Research Module's `DataBrief` and DocuIntelli's `CorpusDataBrief` are the SAME architectural pattern. Both are synthesis artifacts created mid-graph and passed to all downstream deliverable generators.

### Research DataBrief
```python
class DataBrief(BaseModel):
    financial_data: Dict[str, Any]
    market_data: Dict[str, Any]
    company_metadata: Dict[str, Any]
    swot_summary: Optional[str]
    risk_factors: List[str]
    primary_sources: List[Entity]
    data_gaps: List[str]
```

### DocuIntelli CorpusDataBrief (same pattern, different content)
```python
class CorpusDataBrief(BaseModel):
    """
    Produced by cross_framework_reconciler_node.
    Consumed by analysis_report_node (same as DataBrief → report_generation_node).
    Schema mirrors DataBrief but carries corpus intelligence instead of financial data.
    """
    # Corpus identity
    corpus_manifest_id: str
    document_count: int
    use_case: str

    # Phase 1 findings
    corpus_profile: CorpusProfile
    document_type_distribution: Dict[str, int]

    # Phase 2 findings
    selected_frameworks: List[str]
    framework_results: List[FrameworkResult]
    framework_conflicts: List[str]

    # Phase 3 findings
    discovered_dimensions: List[dict]
    validated_dimensions: List[dict]

    # Phase 4 findings
    dimension_weights: Dict[str, float]

    # Phase 5 findings
    top_gaps: List[AnalysisFinding]
    top_anomalies: List[AnalysisFinding]
    top_clusters: List[DocumentCluster]
    recommendations: List[str]

    # Research module analogs
    primary_sources: List[str]       # artifact_ids of key documents (analog: primary_sources)
    data_gaps: List[str]             # What was underdetermined (EXACT same field as DataBrief)
    confidence_overall: float
    collected_at: str                # ISO timestamp

    class Config:
        extra = "allow"              # Same pattern as DataBrief
```

### Why This Pattern Matters

1. The `analysis_report_node` receives `CorpusDataBrief` exactly as `report_generation_node` receives `DataBrief`. The streaming pipeline (node_report_preview_start / delta / done events) is identical.
2. The `CorpusDataBrief` is stored as an Artifact (same as `DataBrief` stored as entity_type="PLAN") for provenance and reuse.
3. Different use cases on the same corpus produce different `CorpusDataBrief` instances with different `dimension_weights`. This is the "same corpus, different insights" capability. The corpus_manifest_id stays constant; the use_case changes; a new DataBrief is produced.
4. The DataBrief pattern enables caching: if a corpus_profile exists and frameworks haven't changed, Phases 1-2 can be skipped on reanalysis with a new use case.

---

## 7. Reuse Assessment

### High Reuse (inherit without modification)

| Capability | Platform Component | Reuse Estimate |
|-----------|-------------------|---------------|
| SSE streaming infrastructure | PG LISTEN/NOTIFY + NDJSON envelope | 100% — add new event types only |
| JWT + API key authentication | `core/security.py`, `api/middleware/auth.py` | 100% |
| Multi-tenant isolation | `Tenant`, `RequestContext`, `get_tenant_id()` | 100% |
| Artifact storage (S3/local) | `substrate/artifact_service.py` | 100% — new entity types only |
| Manifest tree management | `substrate/manifest_service.py` | 100% |
| Pointer management | `substrate/pointer_service.py` | 100% |
| Run lifecycle and ledger | `runs/run_service.py`, `runs/ledger_service.py` | 100% |
| Billing per-run cost tracking | `cost_cents` on Run model | 95% — billing unit changes to corpus |
| Tags system | `tag_service.py` | 100% |
| LangGraph checkpointing | `db/checkpointer.py` | 100% |
| Async session management | `db/engine.py` | 100% |

### Medium Reuse (extend, not replace)

| Capability | Platform Component | Reuse Estimate | What Changes |
|-----------|-------------------|---------------|-------------|
| LangGraph orchestration | `ResearchAssistantGraph` | 60% — same patterns | New StateGraph with 14 nodes vs. 3; same Send() mechanism |
| MCP Tool Layer | `mcp/server.py`, tool convention | 80% | New 40+ tool registrations; same `{domain}.{resource}.{action}` naming |
| Context Engineering / DataBrief | DataBrief pattern | 70% — same structure | New CorpusDataBrief schema; different field content |
| Streaming events | `RunEventType` enum | 70% — extend enum | Add CORPUS_PHASE_UPDATE, FRAMEWORK_SELECTED, DIMENSION_DISCOVERED, CORPUS_OBSERVATION |
| Provenance / entity system | 12-type entity taxonomy | 60% — extend taxonomy | Add 7 new entity types; same Artifact storage mechanism |
| Agent Management / interrupts | `ApprovalRequest`, interrupt patterns | 80% | Same interrupt mechanism; 4+ new interrupt points per analysis |
| RAG / semantic search | `rag_service.py`, OpenSearch | 50% | Cross-document reference search reuses search infra; doc typing is different |

### Low Reuse (significant new work)

| Capability | Reason | Estimated New Work |
|-----------|--------|-------------------|
| GENUI / GML tags | New gml-corpus-* tag family; 10+ new React components | 60% new work |
| Document ingestion | OCR, email threading not yet implemented in BL-008 | 70% new work |
| Research tools (4 tools) | Different tool purposes; 40+ new tools needed | 90% new work |
| Frontend corpus explorer UI | No corpus explorer analog in Research Module UI | 80% new work |

### Zero Reuse (entirely new capability)

| Capability | Why Zero |
|-----------|---------|
| Framework reasoning engine | 16 frameworks with selection heuristics, compatibility rules, blind spots — entirely new domain knowledge |
| Mental model application | 17 reasoning tools with guided Q&A — no analog in research module |
| Dimension discovery | Unsupervised/LLM-guided emergent dimension finding — no analog |
| Watch-for pattern library | 150+ domain-specific anomaly patterns — new knowledge store |
| Process template engine | AP cycle, contract lifecycle, etc. — new knowledge store |
| Anomaly detection engine | Per-corpus frequency baselining, isolation forest — new ML capability |
| Dimensional visualization | Radar charts, parallel coordinates — new GML + Plotly schemas |
| Corpus comparison | Side-by-side corpus analysis — no analog |

### Summary Percentages

- High reuse: ~35% of total platform surface (all infrastructure)
- Medium reuse: ~30% of platform surface (orchestration, streaming, provenance)
- Low reuse: ~20% of platform surface (ingestion, UI, tools)
- Zero reuse: ~15% of platform surface (domain reasoning, knowledge stores, advanced viz)

**Net: DocuIntelli can be built on the platform without reimplementing infrastructure. The work is concentrated in domain logic, not plumbing.**

---

## 8. Implementation Roadmap

The research module completion unlocks DocuIntelli construction. Build order follows dependency on platform primitive maturity.

### Phase A — Free (Inherited from Research Module, No Additional Work)

These capabilities exist the moment the Research Module is complete and can be directly instantiated for DocuIntelli:

| Item | What DocuIntelli Gets for Free |
|------|-------------------------------|
| LangGraph StateGraph skeleton | DocuIntelliState dataclass + base graph structure |
| Send() parallel fan-out | Phase 1 document fan-out + Phase 5 framework fan-out |
| SSE streaming infrastructure | All CORPUS_PHASE_UPDATE events stream immediately |
| Artifact storage | Store all new entity types (OBSERVATION, CORPUS_PROFILE, etc.) |
| JWT + multi-tenant auth | Full enterprise auth for corpus access |
| Billing per run | Per-corpus billing via cost_cents on Run |
| Provenance framework | Track how each observation was derived |
| Run lifecycle | Full run state machine for long-running corpus analysis |
| DataBrief pattern | CorpusDataBrief follows same pattern |
| GML streaming report | Analysis report streams via existing node_report_preview_* events |

**Effort**: 0 sprint points — these are inherited

### Phase B — Extension (Document-Specific LangGraph Nodes and Tools)

Build after Research Module complete. These extend the platform in predictable ways using established patterns.

| Item | Sprint Points (estimate) | Dependency |
|------|--------------------------|-----------|
| BL-008 full realization: OCR, email threading, reference extraction | 8 SP | Research Module must be done |
| DocuIntelliState + base DocuIntelli graph (5-phase skeleton) | 5 SP | BL-001 (Send()) |
| observation_engine_node + 3 sub-agents (classifier, reference, metadata) | 8 SP | BL-008 |
| corpus_statistician_node (fan-in, CorpusProfile production) | 5 SP | observation agents |
| framework_selector_node + corpus profile → framework mapping | 5 SP | corpus_statistician |
| Human interrupt at Phase 2 (confirm frameworks) | 3 SP | BL-009 (interrupts) |
| dimension_discoverer_node + pairwise comparison | 8 SP | BL-025 |
| Human interrupt at Phase 3 (validate dimensions) | 3 SP | BL-009 |
| use_case_weighting_node + weight matrix | 5 SP | BL-027 (process templates) |
| framework_executor_agent + Phase 5 fan-out | 8 SP | BL-001 (Send()) |
| scoring_agent + dimension scorer tool | 5 SP | BL-003 |
| cross_framework_reconciler_node | 8 SP | BL-023 |
| CorpusDataBrief production + analysis_report_node | 5 SP | reconciler |
| New streaming event types (CORPUS_PHASE_UPDATE, etc.) | 2 SP | BL-004 |
| New entity types in taxonomy (7 types) | 3 SP | BL-012 |

**Phase B total**: ~82 SP, estimated 5-6 weeks

### Phase C — New (Framework Reasoning Engine, Mental Models, Advanced Visualization)

These are net-new capabilities with no platform analog. Build after Phase B validated.

| Item | Sprint Points (estimate) | Why It's Hard |
|------|--------------------------|--------------|
| BL-026: Watch-for pattern library (150+ patterns, searchable) | 8 SP | Knowledge engineering + search |
| BL-027: Process template engine (AP cycle, contract lifecycle) | 8 SP | Knowledge engineering |
| BL-024: Mental model prompt library (17 models) | 5 SP | Prompt engineering |
| BL-028: Anomaly detection engine (isolation forest + rules) | 10 SP | ML capability |
| gap_analyst_agent + gap severity scorer | 8 SP | Needs BL-027 |
| anomaly_detector_agent + pattern matcher | 8 SP | Needs BL-026, BL-028 |
| BL-029: New GML tags for corpus visualization | 13 SP | UI engineering |
| gml-corpus-profile, gml-corpus-scatter, gml-corpus-radar new components | 10 SP | React + Plotly schemas |
| gml-framework-selector, gml-dimension-builder, gml-use-case-selector components | 8 SP | React + interaction design |
| gml-gap-report, gml-anomaly-list, gml-cluster-view components | 5 SP | React |
| Corpus comparison agent (BL-030) | 8 SP | Needs all Phase B complete |
| Knowledge store seeding (54 doc types, 16 frameworks, 10 use cases, 30 dimensions) | 5 SP | Data entry + validation |

**Phase C total**: ~96 SP, estimated 6-7 weeks

### Total DocuIntelli Timeline

- Phase A: 0 weeks (inherited)
- Phase B: 5-6 weeks
- Phase C: 6-7 weeks
- **Total: 11-13 weeks after Research Module completion**
- Research Module: 7 weeks
- **End-to-end from now: 18-20 weeks to full DocuIntelli v1**

---

## 9. Risk Analysis

### Risk 1: Document Ingestion Depth (BL-008) Is Underspecified

**What it is**: BL-008 currently covers upload + storage for RAG retrieval (PDF chunking via Docling). DocuIntelli requires significantly more: OCR for scanned images, email thread parsing (MIME, attachment extraction, thread reconstruction), spreadsheet structural analysis, and reference pattern extraction across document types.

**Why it matters**: The Observation Engine (Phase 1) cannot function without complete document ingestion. If BL-008 scope is not expanded before Phase B begins, the classifier, reference extractor, and metadata extractor agents have nothing to operate on. This is a sequential blocker — not something that can be worked around in parallel.

**Mitigation**: Define BL-008 full scope before Research Module sprint 3. Implement OCR (Tesseract/AWS Textract) and email threading (Python `mailparser` / `email` stdlib) as explicit deliverables of BL-008, not deferred to DocuIntelli Phase B. Allocate 8 additional SP to BL-008 immediately.

---

### Risk 2: Knowledge Engineering Underestimated

**What it is**: The 54 document types, 16 frameworks, 17 mental models, 10 use cases, 30+ dimensions, 150+ watch-for patterns, and process templates are not code problems — they are knowledge engineering problems. Each entry requires definition, validation, instantiation examples, and integration testing. The DOCUINTELLI-SKILLS-EXTRACT provides the source material; converting it to queryable, prompt-injectable knowledge artifacts is non-trivial work.

**Why it matters**: Phase C cannot begin until the knowledge store is seeded. Framework selection requires the framework compatibility matrix. Anomaly detection requires the watch-for pattern library. Gap analysis requires process templates. These are gating dependencies for the most novel capabilities in the platform.

**Mitigation**: Begin knowledge store engineering in parallel with Phase B (not after). Allocate one dedicated engineer to convert DOCUINTELLI-SKILLS-EXTRACT definitions into Pydantic models and seed data. Target completion of all knowledge artifacts by end of Phase B week 3 so Phase C tooling has data to consume. Estimate: 10 SP of knowledge engineering work, partially parallelizable.

---

### Risk 3: Interactive Analysis UX Has No Design Precedent in the Platform

**What it is**: The research module is a flow-through pipeline: user submits query, platform produces deliverable. DocuIntelli is fundamentally interactive: the platform presents a corpus profile and asks "which frameworks apply?"; the user selects and confirms; the platform proposes dimensions and asks "does this axis matter?"; the user validates; the platform weights and asks "which use case?"; the user selects. This multi-checkpoint, human-in-the-loop UX is architecturally supported (LangGraph interrupts exist) but has never been designed or implemented in the frontend.

**Why it matters**: The LangGraph interrupt pattern is proven for approval flows (BL-009 Agent Management), but the DocuIntelli checkpoints are different: they are interactive editors (dimension builder widget, framework selector, use case picker) not just approve/deny decisions. Building `gml-dimension-builder`, `gml-framework-selector`, and `gml-use-case-selector` as interactive GML components that participate in the interrupt-resume cycle is new frontend territory. Underestimating this is the most likely cause of schedule overrun.

**Mitigation**: Design the interrupt-resume protocol for each of the three Phase checkpoints (framework confirmation, dimension validation, use case selection) before Phase B begins. Define the SSE event shape for "interrupt: user action required" and the POST endpoint shape for "resume: user decision submitted". Prototype `gml-framework-selector` as a React component in Phase B week 2 (earliest checkpoint hit) rather than deferring all UI to Phase C. Identify this as the highest-risk item for frontend sprint planning.
