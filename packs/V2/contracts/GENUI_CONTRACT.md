# GenUI descriptor contract (v0)

GenUI is a JSON payload produced by the model to request rendering of structured components.

Constraints:
- Must validate with zod/Pydantic.
- Must be safe to render (no arbitrary HTML/script).
- Must be streamable: descriptors can be replaced by id.

Base shape:
- `version`: "0.1"
- `components`: [{ id, type, data }]

Component types (v0):
- `text`: { markdown }
- `callout`: { kind, title?, markdown }
- `table`: { caption?, columns[], rows[][] }
- `metric`: { label, value, delta? }
- `chart`: { kind, title?, series[], xLabel?, yLabel? }
- `citation_list`: { citation_ids[] }

Streaming semantics:
- A `components` array with an existing id replaces that component.
- Components are immutable once finalized; prefer replacement over patching to keep clients simple.

