# RunEventType Rollout Checklist

> Canonical checklist for adding a new RunEventType to the platform.
> Supersedes the V1 "4-surface update rule" and V2M "4-step rollout."
> Decision: V4 #8 (merged V1 6-step + V2M 4-step into unified 6-step protocol).

## The 6-Step Protocol

Every new `RunEventType` addition must complete ALL 6 steps:

### 1. Backend Enum
Add variant to `RunEventType` enum in `src/intelli/db/enums.py`

### 2. Pydantic Schema
Add payload schema class in `src/intelli/schemas/run_events.py`

### 3. LedgerService Emission
Wire emission in the LangGraph node that produces this event type.
The `LedgerService.append()` call must include the new event type.

### 4. TypeScript Union Variant
Add type to the discriminated union in `src/frontend/types/run-events.ts`

### 5. Frontend Handler
Add `case` to the `switch` in `useRunStream` hook (`src/frontend/hooks/useRunStream.ts`)

### 6. Fixture + Contract Test
- Add example payload fixture in `tests/fixtures/run_events/`
- Add or update contract test that validates the new event type round-trips correctly

## Why 6 Steps?

- Steps 1-2 (V1 + V2M): Type safety on both sides
- Step 3 (V2M-specific): Prevents silent non-emission — events are typed but never actually sent
- Steps 4-5 (V1 + V2M): Frontend receives and handles the event
- Step 6 (V1-specific): Prevents drift between implementation and contract spec

## CI Enforcement

The PR template should include:
```
- [ ] If adding a RunEventType: completed all 6 steps of the RunEventType Rollout Checklist
```
