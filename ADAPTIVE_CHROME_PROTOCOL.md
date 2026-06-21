# Adaptive Chrome Protocol v1
### Universal spec: artwork-derived, Liquid-Glass-compatible theming layer

**Hand this document to an implementing AI as-is.** It is a specification,
not a suggestion — every MUST/MUST NOT is a hard constraint. Where the AI
has discretion, it is marked DISCRETION. Bracketed `[PROJECT: ...]` items
are the only parts that need filling in per codebase.

---

## 0. Problem statement

Modern adaptive UIs (Apple Music 2026, and similar patterns elsewhere) do
not use fixed panel colors as their primary aesthetic. Fixed hex/RGB values
are the **static accessibility fallback** — what renders under a
high-contrast / reduced-transparency preference, or before JS executes.
The default experience instead derives chrome color from a source image at
runtime (cover art, hero image, avatar, banner — whatever the dominant
visual content is), then composites it under a translucent glass-style
material layer.

This protocol implements that architecture for **any** web project that
already has a CSS custom-property token system. It does not assume any
particular framework, design system, or content domain.

## 1. Non-negotiable constraints

1. MUST NOT write a final computed hex/RGB value into any `.css` file.
   The stylesheet may only contain the project's **existing static
   fallback tokens** — `[PROJECT: name the existing CSS custom properties
   used for background/surface colors, e.g. --surface-secondary-rgb]`.
   Those remain the pre-paint default, not a competing color system.
2. MUST compute all adaptive values at runtime in JS and inject them via
   `document.documentElement.style.setProperty(...)` on the **same
   variable names** already declared in the stylesheet — do not invent a
   parallel `--adaptive-*` namespace. The adaptive layer overrides the
   existing tokens; it does not duplicate them.
3. MUST be additive/non-invasive unless the project explicitly permits
   direct file edits: implemented as a script injected before `</body>`,
   or as a module added to the existing build, per `[PROJECT: state
   integration constraint — injected script vs. native module]`.
4. MUST degrade silently to the static fallback ramp on any failure
   (CORS-tainted canvas, slow/missing source image, extraction error).
   Never throw an uncaught error, never block primary content/playback.
5. MUST respect, in this priority order:
   `prefers-contrast: more` or a stored "Increase Contrast" user
   preference → disable extraction entirely, use static ramp only.
   `prefers-reduced-transparency` → keep adaptive *color* but render the
   glass layer at full opacity (no blur/translucency).
   `prefers-reduced-motion` → crossfade duration becomes 0ms (instant
   swap, no animation).
6. MUST maintain WCAG contrast ratio ≥ 4.5:1 between the adaptive surface
   color and whatever label/text token sits on top of it, at all times.
   This is enforced mathematically (Stage 3), never eyeballed.

## 2. Stage 1 — Source image sampling

Input: the `<img>` element or URL of the active source image (whatever the
project's primary visual content unit is — album art, product photo,
banner, avatar, etc.).

1. Draw the image to an off-screen `<canvas>` downscaled to **24×24px**
   (cheap, and high-frequency detail is irrelevant for a panel color).
2. Read `getImageData`. If this throws (CORS taint), abort to Stage 9
   (fallback) immediately.
3. Discard pixels in the outer 15% margin (avoid edge artifacts/borders
   baked into source images).
4. Compute a weighted average RGB, weighting saturated pixels higher than
   near-gray pixels so a vivid accent in the image isn't washed out by a
   dominant neutral background:

   ```
   weight(pixel) = 0.3 + 0.7 * saturation(pixel)   // HSL saturation, 0–1
   avgR = Σ(R_i * weight_i) / Σ(weight_i)   // same for G, B
   ```

5. Output: one `{r, g, b}` triplet. This is the **seed color**, not the
   final token — it has not yet been contrast-checked.

DISCRETION: a k-means (k=3) dominant-cluster extraction is acceptable as a
higher-fidelity alternative to weighted averaging if the implementing AI
judges the perf cost (still must complete in <16ms on mid-tier mobile)
acceptable. Weighted average is the required minimum baseline.

## 3. Stage 2 — Perceptual normalization

Convert the seed color to HSL.

1. Clamp **Lightness** into the role-appropriate band so it reads as a
   panel, not as a hero color:
   - Secondary-surface role: `L ∈ [10%, 20%]` (dark mode) / `[80%, 92%]`
     (light mode)
   - Tertiary/elevated role: `L ∈ [16%, 26%]` (dark) / `[70%, 84%]` (light)
2. Clamp **Saturation** to `S ≤ 45%` to prevent neon/oversaturated panels
   from vivid source images (a desaturated *suggestion* of the image's hue
   is the goal, not a reproduction of it).
3. Convert back to RGB. This is the **normalized candidate**.

## 4. Stage 3 — Contrast enforcement (mandatory, not optional)

1. Identify the text/label token that will sit on this surface
   `[PROJECT: name the existing primary-label/text color token]`.
2. Compute relative luminance and contrast ratio between the normalized
   candidate and that label color (standard WCAG relative-luminance
   formula).
3. If ratio < 4.5:1, binary-search the **L** channel of the candidate
   (darkening in dark mode / lightening in light mode) in 1% steps,
   re-checking contrast at each step, until the ratio clears 4.5:1 or `L`
   hits the role's clamp boundary from Stage 2 — whichever comes first.
4. If the boundary is hit before contrast clears, MUST fall back to the
   static token for that role instead of shipping a non-compliant surface.
   This is a hard floor, not a warning.

Output: the **final adaptive value**, guaranteed accessible.

## 5. Stage 4 — Token injection

1. Write the final value as an RGB triplet string (e.g. `"42, 31, 38"`)
   into the existing surface-color variable identified in §1.1. Do not
   touch any other variable.
2. Injection happens on `:root`, scoped for the duration the relevant
   content unit (track, product, page, etc.) is active.
3. Until JS runs (first paint, slow connections), the static fallback
   declared in the stylesheet is what renders. No flash-of-adaptive-color
   is required or expected — the static value IS the correct first paint.

## 6. Stage 5 — Glass material composition

Layer order, back to front:

1. Adaptive surface color (Stage 4 output) as the base fill.
2. `backdrop-filter: blur(20px) saturate(160%)` on the chrome element
   (sidebar, header, now-playing/now-viewing bar — whatever the project's
   persistent chrome surface is), so content scrolling underneath shows
   through.
3. A scrim: the project's existing neutral background RGB triplet at low
   alpha (≈12–18%) composited over the blur, to keep text legible
   regardless of what's moving underneath.
4. Existing hairline border/elevation tokens, unchanged.

If `prefers-reduced-transparency` is set, skip step 2's blur and raise the
scrim alpha to ~92% so the surface reads as solid while keeping the
adaptive hue.

## 7. Stage 6 — Transition & motion

On content-unit change (new track, new product, new page, etc.):

- Crossfade the CSS variable from old value to new value over `600ms
  ease-in-out` using a JS-driven interpolation (CSS custom properties
  don't transition natively) — interpolate in HSL space, not RGB, to avoid
  muddy intermediate grays.
- If `prefers-reduced-motion` is set: swap instantly, 0ms, no
  interpolation frames.

## 8. Stage 7 — Caching

- Cache final adaptive values in an in-memory `Map<sourceImageUrlHash,
  {r,g,b}>` keyed by a hash of the source image URL, so repeated views of
  the same content unit don't re-run extraction.
- Optional: persist to `localStorage` with a cap (e.g. last 200 entries,
  LRU eviction) so the cache survives reloads.
- Cache stores the **post-contrast-enforcement** final value, not the raw
  seed, so cached values never need re-validation.

## 9. Failure matrix (all MUST fall back silently to static tokens)

| Failure | Behavior |
|---|---|
| Canvas CORS taint | Skip extraction, use static ramp, no console error surfaced to user |
| Source image fails to load / 404 | Use static ramp |
| Extraction takes >50ms (perf guard) | Abort, use static ramp, log for later tuning |
| Contrast can't clear 4.5:1 within clamp bounds | Use static ramp for that role |
| `prefers-contrast: more` or stored a11y override | Bypass extraction entirely, never run Stage 1 |

## 10. Validation checklist (implementing AI must self-verify before done)

- [ ] No new hex/RGB literals were added to any `.css` file
- [ ] All adaptive values flow through Stage 3 contrast enforcement before injection
- [ ] Existing variable names are reused, not duplicated under a new namespace
- [ ] Static fallback renders correctly with JS disabled
- [ ] `prefers-contrast: more` fully disables extraction (verify by toggling OS setting)
- [ ] `prefers-reduced-transparency` removes blur, keeps adaptive hue
- [ ] `prefers-reduced-motion` removes the crossfade
- [ ] No file was modified beyond what `[PROJECT: integration constraint]` permits
- [ ] CORS failure on a cross-origin source image does not throw or break the app

## 11. Required project-specific inputs before handing this to an implementer

Fill these in once per codebase — everything else in this document is
reusable as-is:

- `[PROJECT]` name / repo
- Existing surface/background CSS variable name(s) to override
- Existing primary-label/text CSS variable name to contrast-check against
- Integration constraint: injected script only, or native module allowed
- The DOM element(s) that should receive the glass material treatment
