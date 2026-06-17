# PhandaSmart — Targeted Updates

Three isolated changes. No layout, navigation, color, or other page edits.

## 1. Sharp-Shoot Emailer — Tone selector

File: `src/routes/sharp-shoot.tsx`

- Extend `EmailData` with `tone: "Formal" | "Friendly" | "Persuasive"` (default `"Formal"`).
- Step 2: add a `Select` field below "Years of Experience" labelled "Tone" with the three options.
- `buildEmail` becomes tone-aware. Three intro/closing/phrasing variants keyed by tone:
  - Formal: "I hope this email finds you well…", no contractions, "Kind regards".
  - Friendly: "Hi <name>, hope you're having a great week…", contractions allowed, "Thanks so much".
  - Persuasive: "I am writing because <company> needs someone who can <skill> — that is exactly what I deliver.", benefit-led sentences, "Looking forward to showing you the impact I can bring".
- Each tone keeps the existing 2-variant rotation driven by `data.variant`, so Regenerate cycles wording within the selected tone. Changing the tone dropdown clears `subjectOverride`/`bodyOverride` so the new tone shows immediately.

## 2. Phanda Planner — Priority tags

File: `src/routes/phanda-planner.tsx`

- Extend the per-task shape (currently `{ text, done }`) to `{ text, done, priority: "High" | "Medium" | "Low" }`. Migrate any persisted task in the loader by defaulting missing `priority` via the auto-tag rule.
- Auto-tagger (case-insensitive keyword match on task text):
  - High: `apply`, `application`, `follow up`, `follow-up`, `interview`, `submit`.
  - Medium: `research`, `prepare`, `update`, `review`, `practice`.
  - Low (default): `network`, `connect`, `coffee`, `read`, anything else.
- Apply auto-tag when the template plan is first generated and when the user adds a new task via "Add Task".
- Per-task UI on Step 2: a compact `Badge` + a small `Select` (`High` / `Medium` / `Low`) next to the existing checkbox/delete controls. Badge colors using existing semantic tokens, kept subtle:
  - High → `bg-destructive/10 text-destructive border-destructive/20`
  - Medium → `bg-amber-100 text-amber-700 border-amber-200` (light) — kept neutral, no theme token change
  - Low → `bg-primary/10 text-primary border-primary/20`
- `Copy Full Plan` prefixes each task line with `[High] `, `[Medium] `, `[Low] `.

## 3. Research Chommie — Insights & Recommendations

File: `src/routes/research-chommie.tsx`

- Add `insights: string` to `ResearchData` (and `initial`).
- Extend `buildReport` to populate `insights` with two sentences:
  1. Insight on the company's current position / sector trend (uses `company` + `industry`).
  2. Recommendation on how the applicant should position themselves for `role`.
- Render a new `ReportField` after "Tips to Impress" with icon `📊` and label "Insights & Recommendations", same styling as the others.
- `fullReport()` appends `\n📊 INSIGHTS & RECOMMENDATIONS\n` + `d.insights` so Copy Report includes it.

## Out of scope

No changes to sidebar, header, dashboard, CV-Grootman, design tokens, or shared components.
