
## PhandaSmart Build Plan

A frontend-only TanStack Start app: persistent sidebar + header, 5 routes, indigo/white design system, localStorage persistence, no backend.

### Design system (src/styles.css)
- Update tokens to: bg `#F9FAFB`, primary `#4F46E5`, accent `#6366F1`, card white + `shadow-md` + `rounded-xl`, muted gray text.
- Load Inter via `<link>` in `__root.tsx` head; set `--font-sans: "Inter"` in `@theme`.
- Keep shadcn semantic tokens (`bg-primary`, `text-muted-foreground`, etc.) — no hardcoded hex in components.

### Routes (file-based, under `src/routes/`)
```
__root.tsx          → shell: SidebarProvider + AppSidebar + Header + <Outlet/>
index.tsx           → Dashboard
cv-grootman.tsx     → CV builder (4 steps)
sharp-shoot.tsx     → Email generator (3 steps)
phanda-planner.tsx  → Weekly planner (2 steps)
research-chommie.tsx→ Company research (2 steps)
```
Each route sets its own `head()` with unique title + description + og tags.

### Shared components (`src/components/`)
- `AppSidebar.tsx` — shadcn `Sidebar` (collapsible="icon"), 5 nav items with lucide icons, active state via `useRouterState`. Mobile: collapses via `SidebarTrigger` in header (hamburger).
- `AppHeader.tsx` — "PhandaSmart" wordmark, tagline "Your AI Job Hustle Partner", `SidebarTrigger`, and `<DisclaimerBadge/>`.
- `DisclaimerBadge.tsx` — small ⚠ button opening shadcn `Dialog` with the responsible-AI copy.
- `StepProgress.tsx` — numbered step indicator with progress bar (props: `current`, `total`, `labels[]`).
- `StepShell.tsx` — wraps step content with framer-motion fade/slide transition keyed on step index.
- `useFormPersist.ts` hook — reads/writes a keyed object to `localStorage` with debounce.

### Page 1 — Dashboard (`/`)
- Hero: H1 "Work Smart. Phanda Faster.", sub "AI tools built for South African job seekers", CTA `<Link to="/cv-grootman">Get Started</Link>`.
- 2×2 responsive grid of feature cards (lucide icon + title + blurb + "Open →"), each a `<Link>` to its route.
- Stats bar: "4 AI Tools · 100% Free · No Sign-up Required".

### Page 2 — CV-Grootman (`/cv-grootman`) — 4 steps
1. Personal info inputs.
2. Work experience: dynamic array of role blocks + "Add Another Role".
3. Education (array), skills (comma-separated → tag chips), certifications textarea.
4. Preview: styled CV (semantic HTML, ATS-friendly), editable textarea mirror, "Copy CV Text", "Download as PDF" (via `window.print()` of a print-styled section — no native deps; documented as Worker-safe).
- State persisted under `phandasmart:cv`.

### Page 3 — Sharp-Shoot Emailer (`/sharp-shoot`) — 3 steps
1. Job details (incl. Job Source select).
2. Applicant info.
3. Template-generated subject + body in editable inputs/textarea written in SA English; buttons: Copy Email, Regenerate (re-applies template with slight variant), Clear & Start Over.
- Persist under `phandasmart:email`.

### Page 4 — Phanda Planner (`/phanda-planner`) — 2 steps
1. Goal input, target date (shadcn `Calendar` in `Popover`), status select.
2. 7 day cards (Mon–Sun) with editable tasks + checkboxes + per-day "Add Task". Bottom: Reset Plan, Copy Full Plan.
- Plan generated from a template that varies tasks by goal keywords + status.
- Persist under `phandasmart:planner`.

### Page 5 — Research Chommie (`/research-chommie`) — 2 steps
1. Company name, industry select, role, country (default South Africa).
2. Five labeled editable textareas (Overview, Known For, Culture, Likely Questions, Tips). Copy Report, Start New Research.
- Persist under `phandasmart:research`.

### Technical notes
- All routes are public, no loaders → no SSR auth concerns.
- All "AI" output is deterministic template text built client-side from inputs (no API calls, no Lovable Cloud).
- PDF export uses `window.print()` with a print-only CSS section — avoids Node-only PDF libs.
- Framer-motion already acceptable for step transitions.
- Responsive: sidebar `collapsible="icon"`; on `<md`, header shows `SidebarTrigger` (hamburger) and sidebar overlays as a sheet (shadcn default behavior).

### Out of scope
- No auth, no database, no edge functions, no real LLM calls.
- No file upload / no CV parsing.

After approval I'll create the styles, sidebar/header/disclaimer components, the 5 route files, the step + persistence helpers, and wire up the template generators.
