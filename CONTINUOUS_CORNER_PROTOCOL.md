# Continuous Corner Protocol v1
### Universal spec: squircle curvature + concentric radius derivation

**Hand this document to an implementing AI as-is.** It is a specification,
not a suggestion — every MUST/MUST NOT is a hard constraint. Where the AI
has discretion, it is marked DISCRETION. Bracketed `[PROJECT: ...]` items
are the only parts that need filling in per codebase.

---

## 0. Problem statement

A plain `border-radius` corner is a circular arc spliced onto two straight
edges. At the splice point, position and tangent match, but **curvature
does not** — it jumps abruptly from 0 (flat edge) to 1/r (the arc). That
abrupt curvature jump is the actual reason a `border-radius` corner reads
as slightly "off" next to anything from Apple's ecosystem, even when the
radius value is numerically identical.

Apple's continuous corners ("squircles," used since iOS 7 for app icons
and throughout the system since) are not a circular arc and not a pure
mathematical superellipse either — research into the exact icon mask found
small, systematic discrepancies between a true superellipse and Apple's
actual curve, which is a bespoke patchwork of Bézier curves. What *is*
precisely documented (WWDC 2025, the Liquid Glass / `ConcentricRectangle`
system) is the **second half** of the smell, which most clones skip
entirely: nested elements derive their corner radius from their parent's
radius and the gap between them, so the curves stay concentric — sharing a
center — as you move inward through a layout. A single squircle on a card
is half the effect. Squircle-shaped curvature *plus* radius that
mathematically composes through nesting is the full effect.

This protocol implements both halves, for any web project, regardless of
framework or content domain.

## 1. Non-negotiable constraints

1. MUST NOT define a flat list of arbitrary "magic number" pixel radii as
   the design system (e.g. `sm: 4px, md: 8px, lg: 16px` invented by feel).
   Define a small set of **named, role-based reference radii** for the
   outermost/unconstrained shapes only (window, sheet, top-level card).
2. MUST NOT independently author a radius value for any element nested
   inside a radius-bearing container. Every nested radius MUST be derived
   from its nearest radius-bearing ancestor via the concentric formula
   (Stage B). If a designer "eyeballs" an inner radius instead of deriving
   it, that is the bug this protocol exists to prevent.
3. MUST use curvature-continuous corners (squircle / superellipse), not
   plain circular arcs, on any surface where the corner is visually
   prominent — cards, sheets, modals, avatars, primary buttons, image
   containers. DISCRETION on a lower bound: at small radius-to-size
   ratios (e.g. an 8px radius on a 200px-wide element) the visual
   difference between circular and continuous is imperceptible, so it's
   reasonable to skip the continuous-corner treatment there and use plain
   `border-radius` to save complexity.
4. MUST progressively enhance, never gate: native CSS `corner-shape`
   where supported, silent fallback to plain `border-radius` everywhere
   else. The fallback is *correct*, not broken — G1 continuity is still a
   valid corner, just not the premium one. Never block rendering on JS to
   achieve a corner.
5. MUST clamp every derived radius to a floor of 0. The concentric formula
   can mathematically go negative if a child's offset from its parent
   exceeds the parent's radius; a negative radius MUST resolve to a square
   (0) corner, never be passed through to CSS as-is.

## 2. Stage A — Corner curvature (squircle generation)

### A1. Primary path: native CSS

```css
.surface {
  border-radius: var(--radius-card); /* sizing, unsupported-fallback */
  corner-shape: superellipse(2);     /* curvature, squircle-equivalent */
}
```

- `border-radius` controls *how far* the corner extends (size).
- `corner-shape` controls *what kind of curve* fills that extent (shape).
- `superellipse(1)` ≡ `round` (identical to plain `border-radius` alone).
- `superellipse(2)` ≡ `squircle` — the closest native-CSS approximation to
  Apple's continuous corner.
- If `corner-shape` is unsupported, the browser silently ignores it and
  renders the plain `border-radius` arc. No `@supports` gate is even
  required for safety, though one MAY be used to apply a *different*
  radius value specifically when continuous curvature is available
  (continuous corners can carry a visually larger radius before looking
  "too round" than a circular arc can, per Apple's own icon proportions).

  ```css
  @supports (corner-shape: superellipse(2)) {
    .surface { border-radius: var(--radius-card-continuous); }
  }
  ```

- `[PROJECT: confirm minimum supported browser list — corner-shape is
  Chromium-only at time of writing; if the project must support Firefox/
  Safari at full fidelity, treat A1 as enhancement-only and implement A2
  as the actual baseline, not a fallback.]`

### A2. Universal fallback: generated squircle path

For browsers without `corner-shape`, or for projects that need pixel-
identical fidelity today rather than progressive enhancement:

1. Generate an SVG path per element via a bezier-and-arc squircle
   construction, parameterized by `cornerRadius` and `cornerSmoothing`
   (0–1, where 0 = plain circular corner and 1 = maximum continuous
   curvature). MUST NOT re-derive this Bézier math from scratch — the
   geometry has already been solved and published as open-source
   (the algorithm originating from Figma's own corner-smoothing research,
   commonly distributed as a small dependency). Re-deriving it
   independently risks subtly wrong curvature that looks "almost right,"
   which is worse than plain `border-radius`.
2. Apply the generated path via `clip-path: path(...)`.
3. Default `cornerSmoothing` to **0.6** when no other guidance is given —
   this is the commonly-cited approximation of Apple's own smoothing
   value, though note it is community-measured, not an Apple-published
   constant (Apple does not publish exact geometry constants any more
   than it publishes exact hex codes — see the adjacent color protocol
   for the same caveat).
4. Recompute the path whenever the element's rendered width/height
   changes (resize observer), since the squircle geometry is dimension-
   dependent, not just radius-dependent.

## 3. Stage B — Concentric radius derivation

This is the half of the system that gives nested layouts the "sharing a
center" look, and is the part most reimplementations skip.

**Formula**, applied at every parent → child radius boundary:

```
childRadius = max(0, parentRadius - gap)
```

where `gap` is the actual measured perpendicular distance between the
child element's corner and the parent element's corner at that point —
normally the padding, but MUST be the real measured offset if the child
isn't simply inset uniformly (e.g. an asymmetric margin).

1. This is applied **pairwise**, one boundary at a time, not computed once
   for an entire tree. At each level, that level's resolved child radius
   becomes the "parent radius" input for the next level down.
2. If `gap >= parentRadius`, the child corner resolves to 0 (square).
   This is correct geometry, not a degraded case — do not impose an
   artificial minimum visible radius.
3. For the outermost element in the chain (the one with no radius-bearing
   ancestor in the DOM), the "parent radius" input is either:
   - `0`, if the project has no enclosing native shell, or
   - `[PROJECT: a configured root-shell radius]`, if the page is embedded
     in a context with a real physical or window corner radius (a PWA
     window, a native app's WebView wrapper, an OS-level rounded window),
     so the derivation chain starts from the true physical edge inward
     rather than from an arbitrary top-level card.

### Reference implementation shape (runtime resolver)

```js
function resolveConcentricRadius(parentRadiusPx, gapPx) {
  return Math.max(0, parentRadiusPx - gapPx);
}

// Walk from each radius-bearing root downward; at each child with its own
// declared "concentric" role, measure its offset from the nearest
// radius-bearing ancestor and write the resolved value as that element's
// own --radius custom property. Do not skip levels — a grandchild's
// radius is derived from its immediate parent's *resolved* radius, not
// recomputed directly from the root.
```

## 4. Token scale

Define only a small number of **named, role-based** reference radii —
not an arbitrary numeric ramp:

```
--radius-window   /* host shell / outermost surface, if applicable */
--radius-sheet     /* modals, sheets, full-screen overlays */
--radius-card      /* primary content containers */
```

Every other radius in the interface is a *derived* value, written at
runtime by the Stage B resolver, never hand-authored in CSS.
`[PROJECT: list the actual top-level container types that need a named
reference radius — this list is intentionally short.]`

## 5. Motion

If radius or corner-shape values are animated (press states, expand/
collapse transitions), the animation MUST respect
`prefers-reduced-motion` the same as any other transition in the project
— instant snap to end-state, no interpolation frames, when set.

## 6. Failure matrix

| Failure | Behavior |
|---|---|
| `corner-shape` unsupported | Silent fallback to plain `border-radius` — this is correct, not broken |
| Squircle path generation fails (Stage A2) | Fallback further to plain `border-radius` |
| No radius-bearing ancestor found for Stage B resolver | Treat parent radius as 0 → child resolves to square, not a guess |
| Resize occurs mid-transition | Recompute generated path post-transition, don't interpolate stale geometry |

## 7. Validation checklist (implementing AI must self-verify before done)

- [ ] No nested element has a hand-authored radius value — all derive from Stage B
- [ ] No new "magic number" radius was added outside the small named reference scale
- [ ] Every continuous-corner surface degrades to a valid plain rounded corner without JS/CSS feature support
- [ ] Concentric derivation is applied pairwise per boundary, not flattened to a single root calculation
- [ ] All derived radii are clamped to a floor of 0 before being written to CSS
- [ ] Animated radius/corner-shape changes respect `prefers-reduced-motion`

## 8. Required project-specific inputs before handing this to an implementer

- `[PROJECT]` name / repo
- Minimum supported browser list (determines whether Stage A1 is sufficient or Stage A2 is required as baseline)
- Named top-level reference radii in use (§4)
- Root-shell radius, if the page renders inside a native/PWA window with its own physical corner radius
- Which element types receive continuous-corner treatment vs. plain `border-radius` (per the DISCRETION note in §1.3)
