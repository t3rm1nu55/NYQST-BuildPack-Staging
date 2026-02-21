# GML tag specification (v0)

GML is a lightweight, XML-ish markup that the model can emit inside a report draft to request structured rendering.

Design constraints:
- Must be tolerant to streaming (partial/incomplete tags)
- Must be strict enough to validate and heal deterministically
- Must be safe: no arbitrary HTML, no script execution, no remote fetches in the renderer

## General rules

1) Tags are case-insensitive but MUST be emitted in lowercase in generated output.
2) Attributes use double quotes. Do not emit single quotes.
3) All tags MUST be in the allowlist below. Unknown tags should be treated as plain text.
4) The renderer must treat all text content as untrusted. No raw HTML injection.
5) Streaming: the client may have an incomplete tail. Parser should keep the last valid AST and wait for more text.

## Allowlisted tags (v0)

- `<gml-section title="..."> ... </gml-section>`
  - Purpose: group a section of a report.
  - Children: markdown text blocks and other gml tags.

- `<gml-callout kind="info|warning|risk|note" title="..."> ... </gml-callout>`
  - Purpose: highlight an important callout.
  - Children: markdown text.

- `<gml-table id="..." caption="..."> ... </gml-table>`
  - Content: JSON table data inside tag body (strict JSON).
  - Body schema:
    `{ "columns": ["A","B"], "rows": [["x","y"], ...] }`

- `<gml-chart id="..." kind="bar|line|scatter|heatmap" title="..."> ... </gml-chart>`
  - Content: JSON chart spec inside tag body (strict JSON).
  - Body schema (v0):
    `{ "series": [{ "name": "...", "points": [{ "x": "...", "y": 123 }, ...]}], "xLabel": "...", "yLabel": "..." }`

- `<gml-citations ids="c1,c2,c3" />`
  - Self-closing.
  - Purpose: render citation markers / list for a paragraph or block.

## Citation attributes

Where a tag can reference citations, it should do so via:
- `citation_ids="c1,c2"` (preferred) or
- `<gml-citations ids="..."/>`

Citations must resolve to entity/citation records (see Entity/Citation substrate).

## Validation and healing

The client should validate:
- tags are in allowlist
- required attributes present
- JSON bodies parse and validate
- no embedded HTML

If validation fails due to structural errors (not merely incomplete stream tail), call the healer endpoint to repair:
- remove/replace unknown tags
- close unclosed tags
- repair invalid JSON bodies by re-emitting valid JSON

The healer MUST be bounded:
- max output length
- max number of attempts
- no tag vocabulary expansion

