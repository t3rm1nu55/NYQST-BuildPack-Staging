# Mockups

This folder contains two mock options:

1) **React mock (authoritative)**  
   `NyqstPortalMockupV2.tsx`  
   Designed to drop into your existing React + shadcn/ui + Tailwind repo.

2) **Standalone HTML mock (no build tools)**  
   `standalone/index.html`  
   Open directly in a browser to quickly review the screen structure.

Both demonstrate:
- global navigation
- Projects / Apps / Studio / Documents / CRM / Models / Dashboards / Workflows / Runs
- the “App” concept (Dify-style) and its detail tabs
- Studio canvas blocks and inspector patterns (lightweight)

## React mock: how to use

1) Copy `NyqstPortalMockupV2.tsx` into your UI codebase, e.g.
   - `ui/src/mockups/NyqstPortalMockupV2.tsx`

2) Create a route/page that renders it:
   - `ui/src/pages/mockups.tsx` or similar

3) Ensure you have:
   - shadcn/ui components (Button, Card, Tabs, Badge, Input, Select, ScrollArea)
   - lucide-react icons
   - Tailwind CSS
   - React Router (or any routing)

4) Run:
   - `npm run dev`

Next step:
- Replace the stub arrays with live API calls and event streams according to `contracts/`.

