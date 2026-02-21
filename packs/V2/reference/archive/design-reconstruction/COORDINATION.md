# Design Reconstruction — Multi-Agent Coordination

## Objective
Reconstruct the complete design knowledge from 798 scattered artifacts across 4 repositories into a professional, actionable knowledge base. Extract reusable code, methods, schemas, patterns, and architectural decisions.

## Wave Architecture

### Wave 1: Inventory & Signal Extraction (Haiku x 8)
Fast scan of every file section. Each agent produces structured JSON:
- File manifest with topics, decisions, schemas, code signals
- Cross-references to other files
- Quality/completeness score

### Wave 2: Deep Content Mining (Haiku x 12)
Per-domain deep reads. Each agent reads 3-5 files and extracts:
- Complete decision inventory
- Schema definitions (Pydantic, TypeScript, SQL)
- Code patterns and reusable methods
- Architecture diagrams (textual)
- Open questions and gaps

### Wave 3: Domain Synthesis (Sonnet x 6)
One sonnet per domain area:
1. Agentic Runtime & Orchestration
2. GenUI & Rendering Pipeline
3. Streaming & Events & SSE
4. Billing & Metering
5. Entity/Citation/Document Management
6. Frontend Architecture & State

### Wave 4: Hypothesis Testing (Haiku x 8)
Generate and validate hypotheses about:
- Design intent reconstruction
- Missing integration points
- Contradictions between docs
- Code-doc alignment gaps

### Wave 5: Gap Assessment (Sonnet x 3)
- What's specified but not built
- What's built but not specified
- What's contradicted between sources

### Wave 6: Master Assembly (Opus x 1)
Final review, quality gate, master index creation

## Output Structure
```
00-inventory/     — Per-section manifests (Wave 1)
01-extracts/      — Per-domain deep extracts (Wave 2)
02-domain-synthesis/ — Domain analysis docs (Wave 3)
03-patterns/      — Reusable code/pattern catalogs (Wave 3-4)
04-gaps/          — Gap analysis + hypothesis results (Wave 4-5)
05-master/        — Master index, JSON, final analysis (Wave 6)
```

## File Counts by Source
- AirTable-SuperAgent: 586 files (extracted JS, docs, reports, chat export)
- Downloads (genui/cleanroom): 35 files
- NYQST-MCP research: 121 files
- Dev repo docs: 56 files

## Timeline
- Nov 2025: Initial Superagent captures
- Jan 28-29: Main extraction session (88 files)
- Feb 1: MCP infrastructure research (64 files)
- Feb 16: Big analysis session (575 files — plans, analysis, extracted)
- Feb 18-19: Decision register, consistency audit, implementation plan
- Feb 20: This reconstruction
