# DocuIntelli Skills Extract

**Product:** DocuIntelli (Cognitive ERP for regulated enterprise)
**Value:** $200k/yr commercial platform
**Source:** Seven skill files (SKILL.md, frameworks.md, mental-models.md, dimensions.md, document-types.md, use-cases.md, quick-starts.md)
**Purpose:** Define what the platform must analyze, compute, and deliver

---

## 1. Product Identity

### What DocuIntelli IS

DocuIntelli is a **document intelligence and corpus analysis platform** that enables regulated enterprises to:

1. **Analyze unknown document sets without methodological bias** — Observe first, interpret second
2. **Discover structure in unstructured collections** — What's there before deciding what it means
3. **Apply analytical frameworks systematically** — Multiple lenses, explicit selection, revisable conclusions
4. **Weight analysis for purpose** — Same corpus, different insights depending on use case
5. **Evaluate documents on quality dimensions** — Completeness, formality, authority, currency, etc.
6. **Identify gaps, anomalies, and risks** — What should be there but isn't; what's there but doesn't fit

### Core Principle

**Observe before interpreting. The method should not determine the findings.**

This principle rejects:
- Premature categorization
- Single-framework-fits-all analysis
- Description of what *should* be there instead of what *is*
- Ignoring gaps and anomalies
- Treating annotations as noise

### Workflow Architecture

DocuIntelli implements a **5-phase discovery workflow**:

1. **Observe** — Record what is present (form, content, identifiers, parties, references, marks)
2. **Select Frameworks** — Identify which analytical lenses may apply based on profile
3. **Discover Dimensions** — Identify axes along which documents vary
4. **Weight for Use Case** — Determine what matters given the purpose
5. **Apply** — Score, cluster, map, identify gaps and anomalies

---

## 2. Document Type Registry

### Complete Taxonomy

DocuIntelli recognizes **7 categories** with **54 document types** total. Each type has:
- **Function** — What it does
- **Key fields** — What to extract
- **Watch for** — Common issues/anomalies

#### Pre-Transaction Documents (6 types)

| Document | Function | Key Fields | Watch For |
|----------|----------|-----------|-----------|
| Request for Quote (RFQ) | Solicits pricing | Items, quantities, specs, deadline | Response deadline, scope ambiguity |
| Request for Proposal (RFP) | Solicits comprehensive proposals | Requirements, evaluation criteria, timeline | Evaluation criteria that determine winner |
| Quote / Proposal | Vendor offers terms | Prices, validity period, conditions, exclusions | Validity expiration, hidden exclusions |
| Requisition | Internal purchase request | Requester, items, justification, budget code | Missing approvals, budget availability |
| Credit Application | Requests trade credit | Financials, references, requested terms | Credit limit, payment terms |
| Budget Approval | Authorizes spending | Amount, period, cost center, approver | Whether this covers actual spend |

#### Agreement Documents (8 types)

| Document | Function | Key Fields | Watch For |
|----------|----------|-----------|-----------|
| Contract / Agreement | Binding terms | Parties, obligations, term, price, remedies, signatures | Unsigned copies, missing exhibits |
| Master Service Agreement (MSA) | Framework for future orders | Terms, SOW process, liability caps, termination | Which terms flow down to orders |
| Statement of Work (SOW) | Specific engagement under MSA | Scope, deliverables, timeline, price, acceptance criteria | Ambiguous acceptance criteria |
| Purchase Order (PO) | Buyer's commitment | PO number, items, quantities, prices, delivery, terms | PO number format (for matching) |
| Sales Order | Seller's record of commitment | SO number, customer, items, ship date | Linkage to PO |
| Order Acknowledgment | Seller confirms acceptance | PO reference, confirmed terms, exceptions, ship date | Exceptions to original order |
| Change Order | Amendment to order/contract | Original reference, changes, reason, approvals | Whether both parties signed |
| Letter of Intent (LOI) | Pre-contractual intent | Proposed terms, binding vs. non-binding provisions | What's actually binding |

#### Fulfillment Documents (7 types)

| Document | Function | Key Fields | Watch For |
|----------|----------|-----------|-----------|
| Packing Slip | Lists shipment contents | Items, quantities, PO/SO reference | Discrepancies from order |
| Bill of Lading (BOL) | Carrier receipt | Shipper, consignee, description, weight, terms | Condition notes, freight terms |
| Delivery Receipt | Proof of delivery | Date, recipient signature, condition notes | Damage notations, partial delivery |
| Goods Receipt Note (GRN) | Buyer records receipt | PO reference, items received, variances, date | Quantity/quality variances |
| Service Entry Sheet | Records service delivery | SOW reference, hours/milestones, period | Approval signatures |
| Certificate of Completion | Confirms work finished | Project/SOW reference, completion criteria, sign-off | Punch list items, conditions |
| Inspection Report | Quality verification | Items inspected, criteria, pass/fail, defects | Rejection rates, recurring defects |

#### Billing Documents (6 types)

| Document | Function | Key Fields | Watch For |
|----------|----------|-----------|-----------|
| Invoice | Demand for payment | Invoice number, items, amounts, taxes, terms, due date | PO reference (for matching), tax accuracy |
| Pro Forma Invoice | Preliminary invoice | Same as invoice, marked "pro forma" | Confusion with actual invoice |
| Credit Memo | Reduces amount owed | Original invoice reference, reason, amount | Whether credit was applied |
| Debit Memo | Increases amount owed | Reference, reason, amount | Disputed debits |
| Statement of Account | Summary of open items | All open invoices, payments, credits, balance | Aging, disputed items |
| Disputed Invoice Notice | Formal challenge | Invoice reference, dispute reason, proposed resolution | Resolution status |

#### Payment Documents (6 types)

| Document | Function | Key Fields | Watch For |
|----------|----------|-----------|-----------|
| Remittance Advice | Payer indicates what is being paid | Invoice references, amounts, payment method | Partial payments, deductions |
| Payment Confirmation | Proof payment was made | Date, amount, reference, parties, method | Whether it cleared |
| Bank Statement | Record of account activity | Transactions, dates, balances | Unidentified transactions |
| Check Copy | Image of issued check | Payee, amount, date, check number | Whether it was cashed |
| Wire Transfer Confirmation | Proof of wire | Date, amount, sender, recipient, reference | Reference number for matching |
| Receipt | Acknowledgment of payment | Amount, date, payer, reference | Whether it's official |

#### Master Data Documents (6 types)

| Document | Function | Key Fields | Watch For |
|----------|----------|-----------|-----------|
| Vendor Master Record | Vendor information | Name, address, tax ID, bank details, terms, contacts | Stale information, duplicate vendors |
| Customer Master Record | Customer information | Name, address, credit limit, terms, contacts | Credit limit accuracy |
| Item / Product Master | Product information | SKU, description, price, unit, tax code | Price version, discontinued items |
| Price List / Rate Card | Published pricing | Items, prices, effective dates, volume breaks | Effective dates, superseded versions |
| Chart of Accounts | Accounting structure | Account codes, descriptions, hierarchy | Mapping accuracy |
| Cost Center List | Organizational cost allocation | Codes, descriptions, owners | Active vs. inactive |

#### Compliance and Control Documents (8 types)

| Document | Function | Key Fields | Watch For |
|----------|----------|-----------|-----------|
| W-9 / W-8 (US) | Tax identification | Name, tax ID, certification, signature | Expiration, accuracy |
| Tax Exemption Certificate | Claims tax exemption | Jurisdiction, exemption type, expiry | Expired certificates |
| Insurance Certificate | Proof of coverage | Policy number, coverage types, limits, expiry | Coverage gaps, expired policies |
| Audit Report | Findings from examination | Scope, findings, recommendations, management response | Open findings, repeat issues |
| Policy Document | States organizational rules | Applicability, requirements, exceptions, effective date | Whether it's current |
| Procedure Document | Step-by-step instructions | Process steps, roles, approvals, exceptions | Gap between procedure and practice |
| Approval Record | Evidence of authorization | What, who, when, authority basis | Whether approver had authority |
| Delegation of Authority | Assigns approval rights | Delegator, delegate, scope, limits, period | Expiration, scope limits |

#### Communication Documents (6 types)

| Document | Function | Key Fields | Watch For |
|----------|----------|-----------|-----------|
| Email Thread | Unstructured communication | Parties, dates, subject, content, attachments | Buried decisions, attached documents |
| Meeting Notes / Minutes | Record of discussion | Date, attendees, topics, decisions, action items | Decisions not documented elsewhere |
| Memo | Formal internal communication | From, to, date, subject, content | Whether it was actually distributed |
| Letter | Formal external communication | Parties, date, subject, content, signature | Whether it was sent, method of delivery |
| Notice | Formal notification | Type, effective date, recipient, content, delivery proof | Delivery confirmation |
| Dispute Letter | Formal objection | Reference, issue, requested resolution, deadline | Response deadline, escalation path |

### Recognition Strategy

For each corpus:
1. Count documents by type (builds profile)
2. Match unfamiliar documents against key fields and watch-for patterns
3. Use framework selection guidance to route to analysis lenses
4. Gap analysis: given a process, what documents would you expect?

---

## 3. Analytical Frameworks

DocuIntelli implements **13 analytical frameworks** grouped into 3 categories.

### Document Function Frameworks (8 frameworks)

These answer: **What is this document doing?**

#### 1. Transactional
- **Core question:** What exchanges occurred?
- **Assumes:** Commercial activity = bounded exchanges with parties, consideration, timing
- **Best for:** Invoice processing, payment reconciliation, order fulfillment
- **Blind spots:** Ongoing relationships, informal agreements, context spanning transactions
- **Look for:** Amounts, dates, counterparties, settlement indicators

#### 2. Relational
- **Core question:** What ongoing connections exist?
- **Assumes:** Parties have history and future; documents are snapshots of relationship state
- **Best for:** Vendor management, customer analysis, partnership evaluation
- **Blind spots:** One-off transactions, arm's-length dealings, compliance-only documents
- **Look for:** Shared parties across documents, cross-references, common identifiers

#### 3. Evidentiary
- **Core question:** What can be proved?
- **Assumes:** Someone may need to prove something later
- **Best for:** Audit preparation, dispute analysis, compliance verification
- **Blind spots:** Coordinating documents, informal agreements
- **Look for:** Signatures, stamps, authorization chains, execution proof

#### 4. Performative
- **Core question:** What do documents make happen?
- **Assumes:** Certain documents have constitutive power (signing creates obligations)
- **Best for:** Contract analysis, authorization workflows, formal approvals
- **Blind spots:** Documents filed but never read, routinely ignored performatives
- **Look for:** Signatures, formal structures, legal language, effect creation

#### 5. Coordinative
- **Core question:** How do parties align?
- **Assumes:** Multiple parties need to act together; documents reduce ambiguity
- **Best for:** Project documentation, specifications, inter-company agreements
- **Blind spots:** Single-party documents, coordination via other channels
- **Look for:** Shared references, explicit alignment, collective understanding

#### 6. Archival
- **Core question:** What is preserved?
- **Assumes:** Past matters; future actors may need to understand what happened
- **Best for:** Records management, retention policy analysis, historical reconstruction
- **Blind spots:** Documents actively in use, distinction between "archived" and "abandoned"
- **Look for:** Retention criteria, preservation markers, historical significance

#### 7. Operational
- **Core question:** What guides action?
- **Assumes:** People read and follow documents; documented = practiced
- **Best for:** Process analysis, training material review, compliance with internal policy
- **Blind spots:** Gap between documented and actual practice, shadow processes
- **Look for:** Instructions, procedures, policies, checklists, directives

#### 8. Communicative
- **Core question:** What messages were sent?
- **Assumes:** Communication happened; document captures some of what was communicated
- **Best for:** Email analysis, correspondence review, stakeholder communication patterns
- **Blind spots:** What was said but not written, what was written but not read
- **Look for:** Parties, topics, flow, information content, tone

### Process Frameworks (4 frameworks)

These answer: **What stage is this? How does work flow?**

#### 9. Lifecycle
- **Core question:** What stage is this?
- **Documents mark states:** Initiated → In progress → Approved → Completed → Closed
- **Each type corresponds to a stage**
- **Look for:** Status indicators, dates, approval signatures, completion markers

#### 10. Workflow
- **Core question:** Who does what when?
- **Documents move between roles**
- **Each handoff = a workflow step**
- **Corpus reveals actual (vs. documented) workflow**
- **Look for:** Author/recipient patterns, routing, queue markers, timestamps

#### 11. Exception
- **Core question:** What went wrong?
- **Some documents exist because normal process failed**
- **Disputes, corrections, escalations, amendments = exception artifacts**
- **Look for:** Correction indicators, dispute correspondence, amendment trails, escalations

#### 12. Control
- **Core question:** What prevents error or fraud?
- **Some documents exist to enforce controls**
- **Segregation of duties, approval thresholds, reconciliation checkpoints**
- **Look for:** Approval signatures by role, dual-authorization, reconciliation docs, audit trails

### Structural Frameworks (4 frameworks)

These answer: **What governs what? How do things connect?**

#### 13. Hierarchical
- **Core question:** What governs what?
- **Master agreements govern orders; policies govern procedures**
- **Precedence and authority relationships**
- **Look for:** References to parent documents, incorporation by reference, "subject to" language

#### 14. Network
- **Core question:** What connects to what?
- **Parties, transactions, documents form a graph**
- **Clusters, hubs, bridges reveal relationships**
- **Look for:** Shared parties, cross-references, common identifiers

#### 15. Temporal
- **Core question:** What sequence occurred?
- **Chronology matters; earlier documents may explain later ones**
- **Sequence reveals causation**
- **Look for:** Dates, version numbers, "in response to" references, amendment sequences

#### 16. Categorical
- **Core question:** What groups exist?
- **Documents cluster by type, transaction type, party type**
- **Categories may be explicit or emergent**
- **Look for:** Type indicators, common formats, naming conventions, explicit categorization

### Framework Selection Decision Table

| If you observe... | Try framework... |
|-------------------|------------------|
| High reference density, low closure | Transactional |
| Long time spans, recurring parties | Relational |
| Heavy annotations, stamps, signatures | Evidentiary / Performative |
| Multiple versions, amendment trails | Coordinative / Hierarchical |
| Checklists, procedures, policies | Operational |

**Critical:** Multiple frameworks may apply. Don't commit to one.

---

## 4. Mental Models

Reasoning tools that apply across document analysis domains. Use to **think about what you're seeing**.

### 1. Inversion
**Instead of:** What is this corpus for?
**Ask:**
- What would be missing if something important were hidden?
- What would look different if this were fraudulent?
- What would an adversary exploit?
- If I wanted to deceive someone using this corpus, how would I do it?

**Application:** Fraud detection, due diligence, gap analysis

### 2. Second-Order Effects
**Ask:**
- If this document is wrong, what downstream documents are affected?
- If this document is missing, what can't be completed?
- If this document is changed, who must be notified?
- What breaks if this single point fails?

**Application:** Risk assessment, dependency mapping, impact analysis

### 3. Map vs. Territory
**Remember:** The corpus is a map of commercial activity, not the activity itself.
**Ask:**
- What territory is this map describing?
- Where does the map distort, omit, or embellish?
- What happens in the territory that never makes it onto the map?
- Who drew this map, and what did they want you to see?

**Application:** Understanding gap between documentation and reality

### 4. Incentives
**Ask:**
- Who created this document and why?
- Who benefits from it existing? From it being accurate? From it being vague?
- What behavior does this document encourage or discourage?
- Who would be harmed if this document were accurate?

**Application:** Understanding provenance, detecting bias, anticipating behavior

### 5. Redundancy and Backup
**Ask:**
- If this document were lost, could the information be reconstructed?
- What other documents contain overlapping information?
- Is redundancy intentional (control) or accidental (mess)?
- What's the single point of failure?

**Application:** Assessing resilience, identifying critical documents

### 6. Margin of Safety
**Ask:**
- How much error can the process tolerate before failure?
- Where are the tight tolerances? The loose ones?
- What documents exist because someone got burned before?
- What looks like bureaucracy but is actually a scar?

**Application:** Understanding process fragility, identifying risk controls

### 7. Chesterton's Fence
**Before concluding a document is useless:**
- Why was it created?
- What problem was it solving?
- Has that problem disappeared, or just become invisible?
- Who would object if it were removed?

**Application:** Avoiding premature simplification, respecting institutional memory

### 8. Occam's Razor
**The simplest explanation is usually correct:**
- Messy corpus → messy process, not conspiracy
- Missing documents → never created or lost, not hidden
- Inconsistent formats → organic growth, not deliberate obfuscation

**But:** Monitor for patterns that simplicity doesn't explain.

**Application:** Avoiding over-interpretation, staying grounded

### 9. Hanlon's Razor
**Attribute to incompetence before malice:**
- Discrepancies are usually errors, not fraud
- Missing approvals are usually oversight, not conspiracy
- Duplicate payments are usually system errors, not embezzlement

**But:** Track patterns. One error = noise. Ten errors in same direction = signal.

**Application:** Calibrating fraud detection, avoiding false positives

### 10. Availability Bias (Counter)
**Warning:** What's present is easy to analyze. What's absent is easy to ignore.
**Actively ask:**
- What should be here and isn't?
- What documents would I expect in a complete set?
- What's the dog that didn't bark?

**Application:** Gap analysis, completeness assessment

### 11. Survivorship Bias (Counter)
**Warning:** The corpus contains documents that were kept.
**Ask:**
- What was discarded, overwritten, or never formalized?
- Why did these documents survive and others didn't?
- Do survivors represent the population, or just the survivors?

**Application:** Understanding selection effects, avoiding false conclusions

### 12. Base Rates
**Before flagging an anomaly:**
- How common is this pattern in the corpus?
- What's "normal" here?
- Is this actually unusual, or does it just feel unusual?

**A "suspicious" pattern may match 40% of all documents. Calibrate to the corpus, not to expectation.**

**Application:** Anomaly detection, avoiding false positives

### 13. Feedback Loops
**Ask:**
- Do documents reference each other in ways that create cycles?
- Does an invoice trigger a payment that triggers a receipt that closes the PO?
- Where are loops open (pending) vs. closed (complete)?
- What happens when a loop doesn't close?

**Application:** Process analysis, identifying stuck transactions

### 14. Leverage Points
**Ask:**
- Where would a small change have large effects?
- Which document, if wrong, cascades into many problems?
- Which document, if fixed, resolves many issues?
- What's the highest-value intervention?

**Application:** Prioritization, root cause analysis

### 15. Boundary Conditions
**Ask:**
- What happens at the edges?
- Very large transactions, very old documents, very new vendors
- First transaction with a party, last transaction before termination
- Edge cases reveal what the process assumes

**Application:** Stress testing, finding hidden assumptions

### 16. Proximate vs. Root Cause
**Ask:**
- This document shows a symptom—what's the disease?
- The invoice is wrong—why? Data entry? System? Vendor? Fraud?
- How many layers back can you trace?

**Application:** Root cause analysis, avoiding surface-level fixes

### 17. Reversibility
**Ask:**
- Can this be undone?
- If this document is wrong, how hard is it to correct?
- What's the cost of reversal vs. the cost of being wrong?

**Application:** Risk assessment, prioritizing accuracy checks

---

## 5. Quality Dimensions

Dimensions are ways documents vary. DocuIntelli discovers which apply to a given corpus by **observing the documents themselves**.

### Common Dimensions (10)

These appear frequently and should be checked for relevance:

| Dimension | Low End | High End |
|-----------|---------|----------|
| **Completeness** | Fragment, partial, references missing content | Self-contained, complete, all information present |
| **Formality** | Draft, informal, notes, sketches | Executed, official, on letterhead, signed |
| **Authority** | Advisory, informational, suggestive | Binding, enforceable, creates obligations |
| **Specificity** | General policy, broad guidance | Specific transaction, named parties, exact amounts |
| **Temporality** | Point-in-time snapshot | Ongoing, evergreen, continuously updated |
| **Directionality** | Inbound (received) | Outbound (sent) | Internal (never left) |
| **Contestation** | Settled, accepted, uncontested | Disputed, challenged, under negotiation |
| **Confidentiality** | Public, shareable | Restricted, need-to-know | Secret, encrypted |
| **Originality** | Copy, duplicate, printout | Original, authoritative source |
| **Currency** | Superseded, expired, historical | Current, active, governing |

### Domain-Emergent Dimensions

These appear only in certain contexts. Discovered by asking: **what distinctions do the documents themselves make?**

#### Commercial/Financial
| Dimension | Low End | High End |
|-----------|---------|----------|
| **Price commitment** | Indicative | Locked |
| **Amount certainty** | Projected | Final |
| **Authorization state** | Pending | Authorized |
| **Budget state** | Allocated | Consumed |

#### Fulfillment/Logistics
| Dimension | Low End | High End |
|-----------|---------|----------|
| **Fulfillment state** | Ordered → In transit → Received |
| **Payment state** | Billed | Settled |
| **Delivery state** | Committed | Complete |

#### Legal/Contractual
| Dimension | Low End | High End |
|-----------|---------|----------|
| **Execution state** | Negotiating | Signed |
| **Version state** | Original | Amended (n times) |
| **Contract state** | In force | Expired/Terminated |
| **Compliance state** | Performing | In breach |

#### Process/Workflow
| Dimension | Low End | High End |
|-----------|---------|----------|
| **Process state** | Open | Closed |
| **Exception status** | Normal | Escalated |
| **Attempt count** | Initial | Retry (n) |

#### Quality/Verification
| Dimension | Low End | High End |
|-----------|---------|----------|
| **Review state** | Draft | Approved |
| **Validation state** | Unchecked | Verified |
| **Matching state** | Unreconciled | Matched |

### Discovering New Dimensions

**Method:**
1. Pick two documents that feel different
2. Ask: what makes them different?
3. Name that difference as a dimension
4. Check if other documents vary on the same axis
5. If yes, you've found a dimension

**Signs you've found a real dimension:**
- Documents cluster at the poles, not just in the middle
- The dimension affects how documents are used or routed
- People in the domain would recognize the distinction

### Using Dimensions in Analysis

1. **Scoring** — Assign each document a score on each relevant dimension (binary, ordinal, categorical, or continuous)
2. **Clustering** — Documents with similar scores form clusters (often = document types, process stages, org units, time periods)
3. **Gap Analysis** — If you expect documents at certain dimensional coordinates and they're missing = incomplete corpus, broken process, or deliberate omission
4. **Anomaly Detection** — Unusual dimensional profiles may be errors, fraud, legitimate exceptions, or evidence of process change

---

## 6. Use Case Catalog

Why you're analyzing this determines what matters. DocuIntelli supports **10 primary use cases**.

### 1. Audit
**Question:** Was the process followed correctly?

**Weight heavily:**
- Completeness (trace full transaction?)
- Authorization (are approvals present and valid?)
- Formality (executed documents present?)
- Annotation (do stamps/signatures confirm processing?)

**Weight lightly:**
- Relationship context (auditors care about transactions, not relationships)
- Communication (unless it shows decisions)

### 2. Dispute Resolution
**Question:** What was agreed, by whom, and when?

**Weight heavily:**
- Authority (who could bind the parties?)
- Temporality (what was agreed when?)
- Formality (executed vs. draft)
- Contestation (what's disputed?)

**Weight lightly:**
- Operational efficiency (doesn't matter if it was slow)
- Format consistency (messy is fine if it's authentic)

### 3. Fraud Detection
**Question:** Is something wrong here?

**Weight heavily:**
- Reference closure (missing documents may be hidden)
- Annotation patterns (unusual marks may indicate tampering)
- Temporal anomalies (backdating, out-of-sequence)
- Amount patterns (round numbers, just-under-threshold)

**Weight lightly:**
- Formality (fraudsters often have perfect paperwork)
- Completeness (absence is the signal, not presence)

### 4. Process Improvement
**Question:** Where is the waste?

**Weight heavily:**
- Temporality (how long between steps?)
- Exception status (how often do things go wrong?)
- Duplication (documents created twice?)
- Annotation (do corrections indicate errors?)

**Weight lightly:**
- Authority (doesn't matter who approved, matters how long it took)
- Evidentiary value (efficiency trumps proof)

### 5. Knowledge Transfer
**Question:** What would a new person need to know?

**Weight heavily:**
- Currency (what's still relevant?)
- Specificity (policies vs. actual transactions)
- Exception patterns (where do things get weird?)
- Relationship context (who matters?)

**Weight lightly:**
- Completeness (new person needs highlights, not everything)
- Formality (informal notes may be more valuable than policies)

### 6. System Migration
**Question:** What data must move?

**Weight heavily:**
- Format consistency (can it be parsed?)
- Reference patterns (how do documents link?)
- Completeness (what fields are populated?)
- Currency (is historical data needed?)

**Weight lightly:**
- Authority (doesn't matter who signed, matters what data exists)
- Evidentiary value (system doesn't care about proof)

### 7. Due Diligence
**Question:** What does this corpus reveal about the business?

**Weight heavily:**
- Relationship patterns (concentration, dependency)
- Exception frequency (how often do things go wrong?)
- Completeness (gaps may indicate hidden problems)
- Currency (are agreements still in force?)

**Weight lightly:**
- Operational efficiency (unless it's the acquisition thesis)
- Format consistency (mess is information)

### 8. Automation Design
**Question:** What can be systematized?

**Weight heavily:**
- Format consistency (can it be extracted?)
- Pattern regularity (same process every time?)
- Exception frequency and type (what breaks?)
- Reference patterns (can documents be linked automatically?)

**Weight lightly:**
- Authority (system doesn't care who signed)
- Historical context (automation works on current state)

### 9. Compliance Verification
**Question:** Are requirements being met?

**Weight heavily:**
- Completeness (are required documents present?)
- Formality (do documents meet form requirements?)
- Temporality (were deadlines met?)
- Authorization (are required approvals present?)

**Weight lightly:**
- Efficiency (compliance doesn't care about speed)
- Relationship context (requirements are transactional)

### 10. Reconstruction
**Question:** What happened?

**Weight heavily:**
- Temporality (sequence is everything)
- Communication (emails show what people knew when)
- Annotation (marks show what happened to documents)
- Reference patterns (what triggered what?)

**Weight lightly:**
- Format consistency (authenticity matters, not neatness)
- Operational efficiency (doesn't matter if it was slow)

### Weighting Matrix

| Dimension | Audit | Dispute | Fraud | Process | Knowledge | Migration | Due Diligence | Automation | Compliance | Reconstruction |
|-----------|-------|---------|-------|---------|-----------|-----------|---------------|------------|------------|----------------|
| Completeness | ●●● | ●●● | ●● | ●● | ● | ●●● | ●●● | ●●● | ●●● | ●●● |
| Formality | ●●● | ●●● | ● | ● | ● | ● | ●● | ●● | ●●● | ●● |
| Authority | ●●● | ●●● | ●● | ● | ●● | ● | ●●● | ● | ●●● | ●● |
| Temporality | ●● | ●●● | ●●● | ●●● | ●● | ●● | ●● | ●● | ●●● | ●●● |
| Reference closure | ●●● | ●● | ●●● | ●● | ●● | ●●● | ●●● | ●●● | ●●● | ●●● |
| Annotation density | ●●● | ●● | ●●● | ●●● | ●● | ● | ●● | ● | ●● | ●●● |
| Format consistency | ● | ● | ●● | ●● | ● | ●●● | ● | ●●● | ●● | ● |
| Exception patterns | ●● | ●● | ●●● | ●●● | ●●● | ●● | ●●● | ●●● | ●● | ●●● |

**Legend:** ●●● = Critical | ●● = Important | ● = Secondary

---

## 7. Quick-Start Patterns

Entry points for the 8 most common corpus types.

### Pattern 1: Invoice Corpus
**Trigger:** "I have invoices and related stuff"
**Likely corpus:** AP documents—invoices, POs, receipts, payments, emails

| Phase | Focus |
|-------|-------|
| Observe | Document type distribution; date range; sample reference patterns (do invoices cite POs?); format variation |
| Framework | Transactional (primary) + Lifecycle (secondary) |
| Dimensions | Fulfillment state (Ordered → Received → Invoiced → Paid); Matching state (Matched vs. Unmatched); Payment state (Open → Partially paid → Closed); Exception status (Normal vs. Disputed vs. On hold) |
| What to look for | Missing POs; unmatched receipts; duplicate invoices; aging; amount anomalies (round numbers, just-under-threshold) |
| Common gaps | Three-way match sets usually incomplete; payment remittance doesn't link cleanly; email approvals not in folder |

### Pattern 2: Contract Corpus
**Trigger:** "I have contracts and amendments"
**Likely corpus:** Legal agreements—master agreements, amendments, SOWs, change orders, correspondence

| Phase | Focus |
|-------|-------|
| Observe | Master agreement count; amendments per master; distinct counterparties; date range; execution status (signed vs. draft vs. expired) |
| Framework | Hierarchical (primary) + Relational (secondary) |
| Dimensions | Execution state (Draft → Under review → Executed); Currency (Active → Expired → Terminated); Version state (Original → Amendment 1 → ...); Authority (Who signed? Did they have authority?) |
| What to look for | Unsigned copies filed as executed; amendments without clear reference; conflicting terms; expired agreements still relied on; missing exhibits |
| Common gaps | Original signed copies missing; amendment chains incomplete; SOWs not grouped with MSA; signature authority documentation rare |

### Pattern 3: Shared Drive Dump
**Trigger:** "I have a dump from a shared drive"
**Likely corpus:** Mixed—operational, drafts, templates, duplicates, abandoned work

| Phase | Focus |
|-------|-------|
| Observe | Folder structure (what organization attempted?); file types; naming patterns (consistent or chaotic?); date patterns (active or abandoned?); duplication |
| Framework | Categorical (primary) + Operational (secondary) |
| Dimensions | Relevance (Core to purpose vs. tangential vs. contamination); Currency (Active vs. stale vs. abandoned); Formality (Final vs. draft vs. working copy); Ownership (Clear owner vs. orphaned) |
| What to look for | Multiple versions of same document (which is authoritative?); drafts filed alongside finals; templates mixed with completed; contamination; orphaned folders |
| Common gaps | No clear "source of truth"; version history lost; no context for why documents exist; links between related documents missing |

### Pattern 4: Email Corpus
**Trigger:** "I have emails about a deal"
**Likely corpus:** Email threads with attachments—negotiations, approvals, decisions, coordination

| Phase | Focus |
|-------|-------|
| Observe | Thread structure; distinct participants; attachments; date range; tone (collaborative vs. adversarial vs. formal?) |
| Framework | Communicative (primary) + Coordinative (secondary) |
| Dimensions | Decision authority (Who could say yes?); Information flow (Who knew what when?); Commitment state (Discussing → Proposed → Agreed); Completeness (Full thread vs. fragments) |
| What to look for | The actual decision point (often buried mid-thread); commitments in email not documented elsewhere; attachments containing real terms; who was CC'd; what was said vs. what was done |
| Common gaps | Thread fragments (replies without original); missing attachments; parallel conversations; phone calls referenced but not documented |

### Pattern 5: ERP Extract
**Trigger:** "I have an ERP extract"
**Likely corpus:** Structured data—tables, transactions, master records, audit logs

| Phase | Focus |
|-------|-------|
| Observe | Tables present; field completeness; referential integrity (do foreign keys resolve?); date range; volume |
| Framework | Transactional (primary) + Lifecycle (secondary) |
| Dimensions | Record state (Open → In progress → Closed); Data quality (Complete → Partial → Stub); Linkage (Linked vs. orphaned); Currency (Current vs. historical) |
| What to look for | Orphan records (no parent, no children); stuck states (open for abnormally long); broken references (FK points to nothing); data quality issues (required fields empty); duplicate records |
| Common gaps | Audit trail often separate; attachments/documents linked but not included; workflow history in separate system; master data may be stale |

### Pattern 6: Audit Workpapers
**Trigger:** "I have audit workpapers"
**Likely corpus:** Prior audit documentation—testing results, samples, findings, management responses

| Phase | Focus |
|-------|-------|
| Observe | Audit scope; testing approach (sample-based vs. full population?); finding count/severity; audit period |
| Framework | Evidentiary (primary) + Control (secondary) |
| Dimensions | Finding status (Open → Remediated → Closed); Severity (Critical → High → Medium → Low); Control type (Preventive → Detective → Corrective); Testing result (Pass → Fail → Exception) |
| What to look for | Repeat findings (same issue, multiple audits); open findings (not yet remediated); sample coverage (what wasn't tested?); management response adequacy |
| Common gaps | Underlying evidence may not be attached; remediation evidence for closed findings; context for why controls exist; changes since last audit |

### Pattern 7: Vendor Files
**Trigger:** "I have vendor files"
**Likely corpus:** Vendor documentation—onboarding forms, contracts, insurance, tax forms, performance records

| Phase | Focus |
|-------|-------|
| Observe | Vendors represented; document types; completeness per vendor; currency (are documents up to date?) |
| Framework | Relational (primary) + Compliance (secondary) |
| Dimensions | Onboarding state (Prospect → Active → Inactive → Terminated); Compliance state (Complete → Gaps → Expired); Relationship depth (Transactional → Strategic); Risk level (Low → Medium → High) |
| What to look for | Missing required documents (W-9, insurance, etc.); expired documents (insurance, tax forms); vendors without contracts; duplicate vendors |
| Common gaps | Performance history rarely documented; contract amendments not with file; payment history in different system; risk assessments often missing |

### Pattern 8: Unstructured Commercial Dump
**Trigger:** "Analyze these documents"  (no pre-categorization)
**Likely corpus:** Unknown—could be anything

| Phase | Focus |
|-------|-------|
| Observe | Form (format, structure, quality); Content (what it literally says); Identifiers (numbers, dates, references); Parties (who is named, in what role?); References (what other docs does it point to?); Marks (stamps, signatures, corrections); Volume and temporal span; Format distribution; Reference density; Reference closure; Duplication and annotation rates |
| Framework | **Don't decide yet.** Identify candidates based on profile, try multiple, compare |
| Dimensions | Discover which dimensions actually differentiate the corpus; what distinctions do documents themselves make? |
| What to look for | See Phase 1 above for full checklist |
| Common gaps | Everything—this is discovery mode |

---

## 8. Schema Implications

What Pydantic/TypeScript types these skill files imply for the platform.

### Document Type Schema

```python
class DocumentType:
    """Recognize and classify a document in a corpus."""

    id: str  # e.g., "invoice", "purchase_order"
    category: str  # pre-transaction, agreement, fulfillment, billing, payment, master_data, compliance, communication
    function: str  # What does this document do?
    key_fields: List[str]  # What to extract
    watch_for: List[str]  # Common issues/anomalies
    framework_affinities: List[str]  # Which frameworks reveal this document's purpose?
    typical_parties: List[str]  # Who typically creates/receives
    typical_dimensions: List[str]  # Which dimensions usually apply
```

### Dimension Schema

```python
class Dimension:
    """A way documents vary."""

    name: str  # e.g., "completeness", "formality"
    low_end: str  # Descriptive pole
    high_end: str  # Descriptive pole
    scale: str  # "binary" | "ordinal" | "categorical" | "continuous"
    domain_emergent: bool  # Is this universal or corpus-specific?
    applicable_when: Optional[str]  # Conditions for relevance
    watch_for_gaps: List[str]  # What to notice if documents are missing
```

### Framework Schema

```python
class Framework:
    """An analytical lens for interpreting documents."""

    id: str  # e.g., "transactional", "relational"
    category: str  # document_function, process, structural
    core_question: str  # What does this lens ask?
    assumptions: List[str]  # What does it assume?
    best_for: List[str]  # Use case affiliations
    blind_spots: List[str]  # What it can't see
    look_for: List[str]  # Document features this lens reveals
    compatible_frameworks: List[str]  # Which frameworks work together?
```

### Mental Model Schema

```python
class MentalModel:
    """A reasoning tool for analysis."""

    name: str  # e.g., "inversion", "second-order effects"
    invert_question: Optional[str]  # What to ask instead of the obvious?
    questions: List[str]  # Specific questions to ask
    applications: List[str]  # What can this reveal?
    bias_it_counters: Optional[str]  # Which cognitive bias does this fight?
    when_to_use: str  # Conditions for application
```

### Corpus Profile Schema

```python
class CorpusProfile:
    """First-phase observation output."""

    document_count: int
    document_type_distribution: Dict[str, int]
    temporal_span: Tuple[date, date]
    format_distribution: Dict[str, int]  # e.g., "PDF": 450, "Email": 89
    reference_density: float  # How many docs reference others
    reference_closure: float  # What % of referenced docs are present
    duplication_rate: float  # Duplicate/near-duplicate ratio
    annotation_density: float  # Stamps, signatures, marks
    party_count: int
    unique_parties: List[str]
    average_document_age_days: float
    documents_per_party: Dict[str, int]
```

### Analysis Output Schema

```python
class CorpusAnalysis:
    """Result of full 5-phase analysis."""

    profile: CorpusProfile
    observed_documents: List[DocumentObservation]  # Per-doc observations
    selected_frameworks: List[Framework]
    discovered_dimensions: List[DimensionScoring]
    use_case: str  # Why are we analyzing this?
    dimension_weights: Dict[str, float]  # For this use case
    document_scores: Dict[str, Dict[str, Any]]  # doc_id -> {dimension: score}
    clusters: List[DocumentCluster]  # Groups with similar profiles
    gaps: List[GapAnalysis]  # What should be there but isn't
    anomalies: List[Anomaly]  # What's there but doesn't fit
    recommendations: List[str]  # Actions based on findings
    confidence_scores: Dict[str, float]  # Per-finding confidence
```

### Document Observation Schema

```python
class DocumentObservation:
    """Phase 1 raw observation of a single document."""

    id: str
    form: Dict[str, Any]  # format, structure, quality
    content: str  # What it literally says
    identifiers: Dict[str, Any]  # numbers, dates, references
    parties: List[str]  # Who is named, in what role
    references: List[str]  # What other docs it points to
    marks: List[str]  # Stamps, signatures, annotations, corrections
    directionality: str  # inbound | outbound | internal
    file_format: str  # PDF, email, spreadsheet, etc.
    creation_date: Optional[date]
    modification_date: Optional[date]
    estimated_document_type: Optional[str]  # Tentative classification
```

### Use Case Schema

```python
class UseCase:
    """Analysis purpose and weighting guide."""

    name: str  # e.g., "Audit", "Fraud Detection"
    core_question: str  # What are we trying to answer?
    required_information: List[str]  # What must we know
    dimension_weights: Dict[str, int]  # Weight (1-3 dots)
    best_frameworks: List[str]  # Which frameworks apply
    mental_models: List[str]  # Which reasoning tools apply
    typical_deliverables: List[str]  # What do stakeholders need
```

---

## 9. Platform Requirements

What platform primitives (agents, tools, UI, data) each DocuIntelli capability requires.

### 1. Observation Engine (Phase 1)
**Capability:** Analyze unknown document collections without bias

**Agent Requirements:**
- Document classification agent (initial type guessing, not committing)
- Reference extraction agent (identify cross-document links)
- Metadata extraction agent (dates, parties, identifiers)
- Annotation detection agent (marks, signatures, corrections)
- Corpus statistician agent (volume, distribution, temporal patterns)

**Tool Requirements:**
- OCR/PDF extraction tool (for scanned documents)
- Email parser tool (thread structure, attachments, participants)
- Document type detection tool (form-based, not hardcoded)
- Reference pattern matcher (extract links between documents)
- Temporal analysis tool (date extraction, sequencing)

**Data Requirements:**
- Raw document storage with versioning
- Metadata lake (extracted facts about each document)
- Metadata index (queryable observations)
- Corpus statistics cache (fast profile generation)

**UI Requirements:**
- Document preview panel (show raw form, extracted content)
- Histogram view (document type distribution, temporal distribution)
- Reference graph visualization (cross-document links)
- Annotation markup overlay (show detected marks, signatures)
- Corpus profile summary card (quick facts)

### 2. Framework Selection Engine (Phase 2)
**Capability:** Identify which analytical lenses may apply based on corpus profile

**Agent Requirements:**
- Framework recommender agent (maps corpus profile to applicable frameworks)
- Document-framework mapper (specific documents vs. frameworks)
- Framework compatibility checker (which frameworks work together)

**Tool Requirements:**
- Framework matcher tool (heuristic: if high reference density + low closure → try transactional)
- Framework dependency tool (what assumes what)
- Multi-framework conflict detector (framework A vs. Framework B on same doc)

**Data Requirements:**
- Framework definitions (core question, assumptions, blind spots, look-for patterns)
- Framework selection decision table
- Framework compatibility matrix

**UI Requirements:**
- Framework selector (checkboxes, multi-select)
- Framework description cards (core question, best-for, blind-spots)
- Framework conflict warning UI (if contradictory frameworks selected)
- Framework-to-corpus alignment heatmap

### 3. Dimension Discovery Engine (Phase 3)
**Capability:** Identify axes along which documents vary

**Agent Requirements:**
- Dimension discoverer agent (examine documents, find poles)
- Domain-emergent dimension detector (ask "what distinctions do documents make?")
- Dimension validator (does it cluster docs? Do domain experts recognize it?)

**Tool Requirements:**
- Pairwise document comparison tool (what makes doc A different from doc B?)
- Dimension scorer tool (assign documents scores on discovered dimensions)
- Clustering tool (documents with similar scores)
- Dimension relevance validator (does this dimension affect usage/routing?)

**Data Requirements:**
- Common dimensions catalog (with examples)
- Domain-emergent dimensions (commercial/fulfillment/legal/process/quality)
- Dimension discovery rules/heuristics

**UI Requirements:**
- Dimension picker (select common dimensions)
- Dimension builder (create new dimension: name both poles, validate)
- Dimension axis visualization (scatter plot or heatmap of documents on 2-3 dimensions)
- Dimension validation panel (how many docs cluster? Do people recognize it?)

### 4. Use-Case Weighting Engine (Phase 4)
**Capability:** Weight analysis for purpose

**Agent Requirements:**
- Use-case recommender agent (suggest primary use case from context)
- Weighting applier agent (apply dimension weights based on use case)
- Novel use case derivation agent (if new use case, derive weights from questions)

**Tool Requirements:**
- Use-case matcher tool (given query, suggest applicable use case)
- Weight calculator tool (given use case, return dimension weights)
- Novel use case builder tool (5 questions → derived weights)

**Data Requirements:**
- Use case definitions (10 provided: audit, dispute, fraud, etc.)
- Weighting matrix (all dimensions × all use cases)
- Novel use case derivation heuristics

**UI Requirements:**
- Use case selector (dropdown or cards)
- Use case description panel (core question, what you need, weights)
- Weight visualization (weights as bars/dots)
- Custom use case builder (guided Q&A for new use cases)

### 5. Scoring & Clustering Engine (Phase 5: Apply)
**Capability:** Score documents, cluster, map to frameworks, identify gaps/anomalies

**Agent Requirements:**
- Document scorer agent (score each doc on each weighted dimension)
- Clustering agent (group similar documents)
- Gap analyst agent (what should be there? Identify missing)
- Anomaly detector agent (what doesn't fit? Identify unusual)

**Tool Requirements:**
- Scoring tool (apply dimension weights, produce per-doc scores)
- K-means or density clustering (group documents)
- Gap analysis tool (given process expectations, find missing document types)
- Anomaly scorer (standard deviation, isolation forest, or domain rules)

**Data Requirements:**
- Per-document dimension scores (computed during Phase 5)
- Clustering results (document groups)
- Gap specification (what documents should exist for this process)
- Anomaly thresholds (what's unusual in this corpus)

**UI Requirements:**
- Dimensional scatter plots (documents plotted on discovered dimensions)
- Cluster view (cards for each cluster, member documents)
- Gap report (expected docs missing, visual checklist)
- Anomaly list (sorted by anomaly score, explanations)

### 6. Mental Model Tool Library
**Capability:** Apply reasoning tools across all phases

**Agent Requirements:**
- Inversion agent (what would be missing if X were hidden?)
- Second-order effects agent (trace cascading impacts)
- Incentives agent (who benefits from this document? How?)
- Feedback loop detector (closed loops vs. stuck transactions)
- Leverage points analyzer (where are high-impact interventions?)

**Tool Requirements:**
- Mental model prompt library (16 models, specific questions for each)
- Counter-bias tools (survive survivorship bias, availability bias, base rate)
- Dependency tracing tool (map impact chains)

**Data Requirements:**
- Mental model definitions
- Application heuristics (when to use each)
- Domain-specific instantiations (fraud red flags, process risks, etc.)

**UI Requirements:**
- Mental model selector (list of 16, one-click application)
- Mental model output panel (questions asked, answers prompted)
- Inversion mode toggle (flip analysis questions)

### 7. Cross-Framework Integration
**Capability:** Apply multiple frameworks simultaneously, compare results

**Agent Requirements:**
- Multi-framework reconciler agent (run framework A and framework B, compare conclusions)
- Framework conflict resolver (when frameworks disagree, what's the resolution?)
- Consensus builder agent (synthesize multi-framework findings)

**Tool Requirements:**
- Framework application tool (run all selected frameworks in parallel)
- Conflict detector (framework A says X, framework B says Y)
- Confidence weighter (which framework is more credible for this corpus?)

**Data Requirements:**
- Framework compatibility scores (how well do they work together?)
- Multi-framework result storage (one result per framework per document)

**UI Requirements:**
- Framework tabs or split-view (see results per framework)
- Conflict warning UI (where frameworks disagree)
- Consensus view (merged findings)

### 8. Document Type Extraction & Matching
**Capability:** Recognize and classify documents

**Agent Requirements:**
- Document classifier agent (given doc, classify into 54 types)
- Key field extractor agent (per type, extract required fields)
- Watch-for pattern detector (find known issues)
- Type-framework mapper (show which frameworks apply to this type)

**Tool Requirements:**
- OCR/vision tool (read document images)
- Layout analyzer (detect forms, tables, signatures)
- Key field recognizer (extract PO number, invoice date, etc.)
- Pattern matcher (detect watch-for anomalies)

**Data Requirements:**
- 54 document type definitions (function, key fields, watch for, framework affinities)
- Key field patterns (what does a valid PO number look like?)
- Watch-for patterns (duplicate invoice detection, expired insurance, etc.)

**UI Requirements:**
- Document type card (show inferred type, confidence, key fields)
- Type-mismatch warning (if user disagreed, flag it)
- Key field extraction table (show extracted values)
- Watch-for alerts (highlight detected anomalies)

### 9. Gap Analysis Engine
**Capability:** Identify what should be there but isn't

**Agent Requirements:**
- Expectations mapper agent (given corpus type/use case/process, what documents expected?)
- Gap detector agent (compare expected vs. actual)
- Gap severity scorer agent (how critical is each gap?)

**Tool Requirements:**
- Process template tool (standard flowes: AP cycle, contract lifecycle, etc.)
- Gap severity calculator (missing critical control ≠ missing archive)
- Root cause tool (is gap missing creation, or lost/hidden?)

**Data Requirements:**
- Process templates (standard document flows)
- Gap criticality rules (per use case, per process type)

**UI Requirements:**
- Expected vs. actual table (document type, expected, actual, gap)
- Gap severity indicator (color code: critical, high, medium, low)
- Root cause hypothesis (missing creation vs. lost vs. hidden)
- Remediation suggestion (what to do next)

### 10. Dimension Scoring & Visualization
**Capability:** Quantify document quality across dimensions

**Agent Requirements:**
- Dimension scorer agent (score each doc on each dimension)
- Weight applier agent (apply use-case weights)
- Quality analyst agent (synthesize multi-dimension profile)

**Tool Requirements:**
- Scoring rule engine (per dimension, how to score)
- Weighted aggregator (combine scores using weights)
- Visualization tool (render high-dimensional data)

**Data Requirements:**
- Scoring rules (per dimension, how to determine score)
- Weight sets (per use case)
- Score storage (document_id × dimension → score)

**UI Requirements:**
- Dimensional heatmap (documents × dimensions, colored by score)
- Radar chart (multi-dimension profile for one document)
- Parallel coordinates (visualize multi-dimensional clustering)
- Dimension explanation tooltip (why did this doc get this score?)

### 11. Pattern Recognition & Anomaly Detection
**Capability:** Find what doesn't fit

**Agent Requirements:**
- Pattern learner agent (what's normal in this corpus?)
- Anomaly scorer agent (how unusual is this?)
- Anomaly explainer agent (why is this unusual?)

**Tool Requirements:**
- Frequency analyzer (what's common? What's rare?)
- Isolation forest or LOF tool (density-based anomaly detection)
- Rule-based anomaly checker (fraud rules, control violation detection)
- Explanation generator (why is this anomalous?)

**Data Requirements:**
- Baseline patterns (what's normal here)
- Anomaly rules (fraud indicators, control failures, etc.)

**UI Requirements:**
- Anomaly list (sorted by anomaly score)
- Anomaly distribution chart (how many anomalies? Severity)
- Anomaly detail card (what's anomalous, why, suggested action)
- Whitelist/dismiss (mark as legitimate exception)

---

## 10. Cross-Reference to NYQST Platform

### BL Items Mapped

DocuIntelli capabilities map to **NYQST platform BL items** as follows:

| BL Item | Purpose | DocuIntelli Dependency |
|---------|---------|------------------------|
| BL-001 | LangGraph orchestration | **Requires**: Phase execution orchestrator (5-phase workflow) |
| BL-002 | MCP tool framework | **Requires**: Tool definitions for all 40+ tools above |
| BL-003 | Standalone tools | **Requires**: OCR, reference extraction, dimension scorer standalone |
| BL-004 | Streaming | **Requires**: Streaming Phase 1 observations (large corpora) |
| BL-005 | Agent memory/state | **Requires**: Per-corpus analysis state (profile, scores, findings) |
| BL-006 | Async sessions | **Requires**: Long-running analysis (parallel agents per corpus) |
| BL-007 | Context engineering | **Requires**: Multi-framework reasoning (context switching between frameworks) |
| BL-008 | Document ingestion | **Requires**: Multi-format document intake (PDF, email, spreadsheet, image, etc.) |
| BL-009 | Semantic search | **Requires**: Reference pattern search (find docs linking to target) |
| BL-010 | Data schema | **Requires**: Schema for corpus profile, document observation, analysis output |
| BL-011 | UI + GENUI | **Requires**: 8 major UI components (profile, dimension builder, anomaly list, etc.) |
| BL-012 | Provenance | **Requires**: Track Phase 1 observations (how we knew this) |
| BL-013 | Streaming frontend | **Requires**: Real-time Phase 1 observation updates to UI |
| BL-014 | Caching | **Requires**: Cache corpus profiles, dimension scores (reuse for different use cases) |
| BL-015 | Report generation | **Requires**: Gap/anomaly/findings report export |
| BL-016 | Multi-agent loops | **Requires**: Phase 2-3-4-5 loops (agents recommend frameworks, dimensions, weights) |
| BL-017 | LLM integration | **Requires**: Framework selection, mental model application, explanation generation |
| BL-018 | Control flow | **Requires**: Phase sequencing (can skip phase? What triggers next phase?) |
| BL-019 | Error handling | **Requires**: Corpus too large? Framework selection ambiguous? Dimension validation failed? |
| BL-020 | Deployment | **Requires**: Containerized analysis service |
| BL-021 | Billing | **Requires**: Charge per corpus analyzed or per document scored |
| BL-022 | Frontend framework | **Requires**: React components for corpus explorer UI |

### Gap Analysis

**Gaps = DocuIntelli capabilities NOT covered by current BL items:**

1. **Multi-Framework Reconciliation** — No BL item for running framework A and framework B in parallel, comparing results, resolving conflicts. **New:** Needs BL-023 (Multi-perspective reasoning)

2. **Mental Model Application Engine** — 16 mental models require guided reasoning. Not covered by generic LLM integration. **New:** Needs BL-024 (Reasoning tool library)

3. **Domain-Emergent Dimension Discovery** — Discovering dimensions *from corpus* (vs. hardcoded list) requires unsupervised learning or human-guided iteration. **New:** Needs BL-025 (Dimension discovery agent)

4. **Watch-For Pattern Library** — 54 document types × their watch-for anomalies (150+ patterns) need searchable database + pattern matching. **New:** Needs BL-026 (Pattern library + matcher)

5. **Gap Specification Templates** — Process flows (AP cycle, contract lifecycle, etc.) need formalized representation. **New:** Needs BL-027 (Process template engine)

6. **Dimension Validation UI** — Interactive dimension pole-naming and clustering validation. Not covered by static UI components. **New:** Needs BL-028 (Dimension builder widget)

7. **Multi-Dimension Visualization** — Scatterplots, radar charts, parallel coordinates for high-dimensional data. Standard charting insufficient. **New:** Needs BL-029 (Dimensional visualization engine)

8. **Corpus Comparison** — Analyze two corpora side-by-side, compare profiles, anomalies. **New:** Needs BL-030 (Corpus comparison agent)

### Implications for v1 Scoping

**DocuIntelli as first domain module** would require:

1. **Base platform (BL-001 through BL-022)** — No reduction possible
2. **New BL items for DocuIntelli-specific capabilities (BL-023 through BL-030)** — 8 new items
3. **Tool library** — 40+ tools (subset extracted above)
4. **Data schema** — 8 entity types (Dimension, Framework, MentalModel, UseCase, CorpusProfile, DocumentObservation, DocumentType, Analysis)
5. **UI component set** — 20+ components (profile view, dimension builder, anomaly list, framework selector, etc.)

**Total estimated effort:** 14-16 week development path (platform primitives + DocuIntelli module).

---

## 11. Schema Entity Summary (Pydantic/TypeScript)

### Core Entities

```
DocumentType (54 instances)
  - id, category, function, key_fields, watch_for
  - framework_affinities, typical_parties, typical_dimensions

Dimension (30+ instances)
  - name, low_end, high_end, scale, domain_emergent
  - applicable_when, watch_for_gaps

Framework (16 instances)
  - id, category, core_question, assumptions, best_for, blind_spots
  - look_for, compatible_frameworks

MentalModel (16 instances)
  - name, invert_question, questions, applications, bias_it_counters
  - when_to_use

UseCase (10 instances)
  - name, core_question, required_information, dimension_weights
  - best_frameworks, mental_models, typical_deliverables

CorpusProfile (1 per corpus)
  - document_count, document_type_distribution, temporal_span, format_distribution
  - reference_density, reference_closure, duplication_rate, annotation_density
  - party_count, unique_parties, average_document_age_days, documents_per_party

DocumentObservation (n per corpus)
  - id, form, content, identifiers, parties, references, marks
  - directionality, file_format, creation_date, modification_date, estimated_document_type

CorpusAnalysis (1 per corpus per use case)
  - profile, observed_documents, selected_frameworks, discovered_dimensions
  - use_case, dimension_weights, document_scores, clusters, gaps, anomalies
  - recommendations, confidence_scores
```

---

## 12. Conclusion: What DocuIntelli Demands of the Platform

### Knowledge Engineering
- **54 document types** with properties, watch-for patterns, framework affinities
- **30+ dimensions** (common + domain-specific) with scoring rules
- **16 frameworks** with selection heuristics and compatibility rules
- **16 mental models** with instantiation patterns
- **10 use cases** with weighting matrices and deliverable templates
- **8 quick-start patterns** for common corpus types

### Agent Orchestration
- **5-phase workflow** executed in sequence (Observe → Select → Discover → Weight → Apply)
- **Multi-agent collaboration** (classifier, reference extractor, recommender, scorer, anomaly detector)
- **Interactive loops** (user provides feedback, agent refines dimension, re-scores)
- **Parallel agents** (run multiple frameworks simultaneously, reconcile results)

### Data Architecture
- **Corpus abstraction** (profile, observations, scores, findings)
- **Metadata lake** (extracted facts queryable by dimension, framework, use case)
- **Result versioning** (same corpus, different use cases = different analyses)

### UI Innovation
- **Dimensional visualization** (scatterplots, heatmaps, radar charts for high-dimensional data)
- **Interactive discovery** (user builds dimensions, builder validates)
- **Multi-perspective reasoning** (see results per framework, spot conflicts)
- **Guided analysis** (Phase 1 → Phase 2 → ... with checkpoints)

### Critical Dependencies
- **Observation Engine** (Phases 1-2) on BL-008 (document ingestion) + BL-007 (context engineering)
- **Dimension Discovery** (Phase 3) on BL-016 (multi-agent loops) + new BL-025
- **Framework Selection** (Phase 2) on BL-017 (LLM reasoning) + new BL-024
- **Scoring/Clustering** (Phase 5) on BL-003 (standalone tools) + new BL-029 (visualization)

### Product Differentiation
DocuIntelli is **NOT** a generic document classifier. It is:
- **Method-agnostic** (observes before interpreting)
- **Purpose-driven** (same corpus, different weights per use case)
- **Framework-plural** (multiple lenses, user selects)
- **Gap-aware** (explicitly identifies what's missing)
- **Anomaly-rich** (what doesn't fit is the signal)
- **Interactive** (user refines discoveries, agent validates)

This is a **cognitive partner for document intelligence**, not an automation engine.

