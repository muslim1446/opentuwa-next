# Liquid Glass Platform — Complete Protocol for Apple Ecosystem Implementation

> **Version**: 2.0 | **Date**: June 2026 | **Status**: Production-Ready

---

## 1. Problem Statement & Design Philosophy

### 1.1 The Curvature Discontinuity Problem

A plain `border-radius` corner is a circular arc spliced onto two straight edges. At the splice point, position and tangent both match — but **curvature does not**. It jumps abruptly from 0 (the flat edge) to 1/r (the arc). That first-derivative discontinuity is the precise mathematical reason a `border-radius` corner reads as slightly "off" next to anything from Apple's ecosystem, even when the radius value is numerically identical. The human visual system detects curvature breaks at the splice point as a subliminal "wrongness" that no amount of radius tuning can eliminate.

Apple's continuous corners — the geometry used since iOS 7 for app icons and propagated throughout the system since — are not circular arcs and not a pure mathematical superellipse either. Liam Rosenfeld's reverse-engineering of the iOS icon mask revealed a 16-part cubic Bezier curve construction with control-point constants scaled relative to corner radius [^62^]. The construction carries known asymmetries: the two halves of each corner are not quite mirror images, with a probable tiny straight segment preserved across releases [^46^]. Grida's mathematical analysis places Apple's icon shape closer to a quintic superellipse (exponent n~5) than to a true squircle (n=4) [^88^]. CSS `corner-shape: superellipse(2)` — now shipping in Chromium — produces a mathematically clean quartic superellipse that is close but not pixel-identical to Apple's bespoke patchwork [^64^] [^66^]. The takeaway for implementers is that Apple's curve is a **fixed, non-configurable** construction whose distinguishing feature is not any specific exponent but rather its curvature continuity: no jump, no splice, no perceptible seam.

### 1.2 The Two-Layer Architecture

What the WWDC 2025 documentation of Liquid Glass reveals — and what most squircle clones skip entirely — is the **second half** of the Apple feel: a strict two-layer architecture that governs where curved glass is allowed to exist.

Apple's interface is divided into exactly two layers. The **content layer** (bottom) holds standard materials — `ultraThin`, `thin`, `regular`, `thick`, `ultraThick` — applied to lists, tables, media, and scrollable views [^5^]. The **navigation layer** (top) is where Liquid Glass lives exclusively: tab bars, sidebars, toolbars, navigation bars, buttons, and controls [^79^]. Liquid Glass forms a "distinct functional layer for controls and navigation elements that floats above the content layer, establishing a clear visual hierarchy between functional elements and content" [^258^]. Stacking Liquid Glass on top of Liquid Glass is an explicit anti-pattern — Apple warns that it "can quickly make the interface feel cluttered and confusing" [^79^].

This separation is not a visual suggestion; it is an architectural invariant. Every other design decision in the system serves it. The reason typography needs vibrancy levels is that text must remain legible *on* glass. The reason concentric corners matter is that nested navigation elements must share a common center as they compose inward. The reason standard materials persist alongside Liquid Glass is that they serve entirely different architectural roles — not replacements, but layers in a stack.

The following diagram illustrates the two-layer hierarchy and the geometric nesting of concentric corners within the navigation layer:

```
┌─────────────────────────────────────────────────────────────┐
│  NAVIGATION LAYER (Liquid Glass)                            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Toolbar / Sidebar (Liquid Glass .regular)          │   │
│   │                                                     │   │
│   │   ┌─────┐  ┌─────┐  ┌──────────┐  ┌──────────┐   │   │
│   │   │ Btn │  │ Btn │  │ Capsule  │  │ Capsule  │   │   │
│   │   │ r=8 │  │ r=8 │  │ r=20     │  │ r=20     │   │   │
│   │   └─────┘  └─────┘  └──────────┘  └──────────┘   │   │
│   │         ↑ inner radii derived from outer           │   │
│   │           r_inner = max(0, r_outer − gap)          │   │
│   └─────────────────────────────────────────────────────┘   │
│                         ↑ ConcentricRectangle nesting       │
├─────────────────────────────────────────────────────────────┤
│  CONTENT LAYER (Standard Materials)                         │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Scrollable content (ultraThin → ultraThick)        │   │
│   │  Lists, tables, media, text                         │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Material thickness → elevation → information hierarchy    │
│   ultraThin (most translucent, farthest)                    │
│   thin ── regular ── thick ── ultraThick (most opaque)      │
└─────────────────────────────────────────────────────────────┘
```

*Figure 1.1 — Two-layer architecture: navigation floats above content. All corner radii within the navigation layer derive from their parent's radius minus the gap, ensuring concentric nesting that shares a common center [^47^] [^41^].*

This architecture also explains the **visionOS-first origin** of the system. Liquid Glass was designed for spatial computing first and then adapted backward to flat-screen devices [^533^]. This reverses Apple's historical pattern, in which iPhone designs propagated outward. The spatial origin explains why Liquid Glass uses depth (not size or contrast) as its primary hierarchy mechanism, why morphing and materialization animations feel natively three-dimensional, and why the system emphasizes real-time light response over static styling [^534^]. On visionOS, "hierarchy is communicated through depth. You don't just look at the UI, you look through it" [^534^]. That depth-first sensibility, inherited from spatial computing, is what makes Liquid Glass feel "over-engineered" for flat screens — and precisely what this protocol captures.

### 1.3 What This Protocol Covers

This protocol implements **both halves** of the Apple feel, for any web project, regardless of framework or content domain.

The first half is curvature-continuous corner geometry: replacing `border-radius` circular arcs with squircle-approximation curves via CSS `corner-shape: superellipse(2)` where supported [^64^], with JavaScript polyfill fallback using `figma-squircle` at `cornerSmoothing: 0.6` [^38^] for browsers without native support. The second half is the concentric nesting system: every nested element's corner radius derives from `childRadius = max(0, parentRadius − gap)` [^47^] [^70^], the formula Apple formalized in SwiftUI's `ConcentricRectangle` API at WWDC 2025 [^41^]. A single squircle on a card is half the effect. Squircle-shaped curvature *plus* radius that mathematically composes through nesting is the full effect.

Beyond corners, the protocol specifies the complete token system for the two-layer architecture: CSS custom properties namespaced by layer (`--nav-*` vs `--content-*`), material thickness tokens mapped to elevation, adaptive shadow behavior that increases opacity over text and decreases over solid backgrounds [^79^], the spring physics animation parameters (`response: 0.55`, `dampingFraction: 0.825`) [^78^], and accessibility fallbacks including `prefers-reduced-transparency` and `prefers-reduced-motion` hard degradations. All tokens use `calc()` to express interdependencies — for example, `--radius-card-inner: calc(var(--radius-card) - var(--spacing-md))` — so the system forms a closed mathematical loop where spacing drives shape, shape drives elevation, and elevation drives material selection.

---

## 2. Non-Negotiable Constraints

The following constraints bind every implementation. They govern geometry, color, motion, and accessibility as a unified system — no constraint may be relaxed in isolation.

### 2.1 Token Governance

**2.1.1 Named role-based reference tokens only.** The system MUST NOT expose arbitrary "magic number" pixel radii (e.g., `sm: 4px, md: 8px, lg: 16px`). Define a minimal set of named, role-based reference radii for outermost shapes only — `--radius-window`, `--radius-sheet`, `--radius-card`. Every token MUST map to one of Apple's three shape types (Fixed, Capsule, Concentric) [^65^]; the role, not the pixel value, carries design intent.

**2.1.2 All nested radii derived via concentric formula.** No element nested inside a radius-bearing container MAY have an independently authored radius. Every nested radius MUST derive from its nearest ancestor via `childRadius = max(0, parentRadius - gap)` [^47^] [^41^], codified in Apple's `ConcentricRectangle` API [^65^]. Equal radii on parent and child produce optically inconsistent gap thickness [^70^]; hand-authoring inner radii is the exact bug this protocol prevents. Curvature-continuous corners via CSS `corner-shape: squircle` are REQUIRED on visually prominent surfaces [^48^] [^66^]; at small radius-to-size ratios plain `border-radius` MAY substitute.

### 2.2 Progressive Enhancement

**2.2.1 MUST enhance, never gate.** Use native CSS `corner-shape` where supported; silently fall back to `border-radius` everywhere else. The fallback is correct, not broken — G1 continuity remains valid [^102^]. Never block rendering on JavaScript for a corner shape. Adaptive color values MUST be injected via `setProperty(...)` on the same variable names declared in the stylesheet, not a parallel `--adaptive-*` namespace. The adaptive layer overrides; it does not duplicate.

**2.2.2 All derived radii clamped to floor of 0.** When a child's offset exceeds its parent's radius, the concentric formula yields a negative value. A negative radius MUST resolve to `0` (square corner), never pass through to CSS [^41^]. Implement via `max(0, calc(parent - gap))` in CSS or `Math.max(0, value)` in JavaScript — negative `border-radius` is invalid CSS and breaks the cascade.

### 2.3 Accessibility First

**2.3.1 WCAG 4.5:1 contrast ratio enforced mathematically.** The contrast between every adaptive surface and its text MUST meet WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text [^440^] [^436^]. Enforce at runtime via binary search on the L channel — never eyeballed. The 2025 AppleVis Report Card found satisfaction decreased across all categories, with Liquid Glass cited as having "a significant negative impact" [^25^]; Nielsen Norman Group confirmed that translucency inherently breaks contrast [^313^]. Mathematical enforcement is the protocol's defense against these documented failures.

**2.3.2 All animations respect `prefers-reduced-motion` as instant snap.** When `prefers-reduced-motion: reduce` is active, all crossfades, springs, and materialization animations MUST collapse to 0 ms — instant swap to end state [^321^] [^310^]. Implement via a global media query setting `--duration: 0.01ms` and `animation-iteration-count: 1` [^324^]. Zero duration, not shorter duration.

**2.3.3 All glass materials have non-glass accessible equivalents.** Every glass effect MUST provide a genuinely accessible non-glass state — not merely "less glass." The following preference matrix governs all rendering:

| Preference | Opacity | Blur | Adaptive Color | Animation | Contrast |
|---|---|---|---|---|---|
| Default | 40% | 20 px | ON | 300 ms spring | 4.5:1 |
| `prefers-reduced-transparency` | 95% solid | 0 px | ON (keep hue) | 300 ms | 4.5:1 |
| `prefers-contrast: more` | 100% solid | 0 px | OFF (static) | 300 ms | 7:1 |
| `prefers-reduced-motion` | 40% | 20 px | ON | 0 ms instant | 4.5:1 |

Under `prefers-contrast: more`, adaptive extraction is disabled entirely; static high-contrast ramps replace it [^504^] [^479^]. Under `prefers-reduced-transparency: reduce`, glass renders at full opacity while preserving adaptive hue [^479^]. The European Accessibility Act, enforceable since June 28, 2025, mandates EN 301 549 compliance with penalties reaching 10% of annual turnover [^448^] [^451^]. Implementations MUST degrade silently to static fallbacks on any extraction failure — never throw, never block content.

---

## 3. Stage A — Corner Curvature: Squircle Generation

The Liquid Glass surface begins with its corners. Apple's continuous-corner geometry is the first recognizable signal of the material — a curvature that transitions seamlessly from flat edge to rounded corner without the visible "kink" of a circular arc [^62^]. This stage specifies two parallel generation paths — native CSS progressive enhancement and a universal JavaScript fallback — serving a single shape taxonomy of Fixed, Capsule, and Concentric.

### 3.1 Primary Path: Native CSS `corner-shape`

The CSS `corner-shape` property, specified in CSS Borders and Box Decorations Module Level 4 [^48^] [^66^], separates corner sizing from corner curvature: `border-radius` controls extent (how far the corner reaches), while `corner-shape` controls curve kind (what fills that extent).

#### 3.1.1 Separation of concerns: `border-radius` vs. `corner-shape`

This decoupling means radius tokens remain stable across shape methods. A design system can swap curvature without recalculating distances. If `corner-shape` is unsupported, the declaration is silently discarded and `border-radius` renders as a standard circular arc — no `@supports` gate is required for safety, though one MAY be used to vary the radius value when continuous curvature is present.

```css
.surface {
  border-radius: var(--radius-card);    /* extent: sizing token */
  corner-shape: superellipse(2);         /* curve kind: squircle */
}
```

#### 3.1.2 `superellipse(1)` ≡ `round`, `superellipse(2)` ≡ squircle

The CSS `superellipse(k)` function generates a Lamé superellipse with exponent `n = 2^k`, satisfying `|x|^n + |y|^n = 1` [^42^]. Two values matter for Liquid Glass:

| CSS Value | Exponent `n` | Description |
|-----------|-------------|-------------|
| `superellipse(1)` | `n = 2` | Circular arc (keyword: `round`) |
| `superellipse(2)` | `n = 4` | Quartic superellipse — native-CSS squircle |

`superellipse(2)` is the closest native-CSS approximation to Apple's continuous corners, which reverse-engineering has shown to be a 16-part cubic Bézier construction closer to a quintic superellipse (n ~ 5) [^62^] [^88^]. The two are not pixel-identical — Apple's shape carries a known asymmetry (a tiny straight segment on one half, described as a "probable bug, preserved across releases") and degrades to a generic rounded rectangle at low aspect ratios [^46^]. But `superellipse(2)` is sufficiently close for production use and represents the best available native-CSS path.

#### 3.1.3 Chromium 139+ support only

As of mid-2026, `corner-shape` ships only in Chromium-derived browsers. Safari has signaled vendor-position "support" (intent to implement) with no shipping code yet [^102^].

| Browser | Status | First Version |
|---------|--------|--------------|
| Chrome / Chromium | **Shipped** | 139 (Aug 2025) |
| Edge | **Shipped** | 139 (Aug 2025) |
| Safari | **Not implemented** | Vendor position: support (planned) [^102^] |
| Firefox | **Not implemented** | No public signal [^103^] |
| **Global usage** | **~66.7%** | Limited availability per Baseline [^105^] |

The feature is **NOT** in Web Platform Baseline. For projects requiring full cross-browser fidelity, the generated-path fallback in Section 3.2 MUST be treated as the baseline implementation, with `corner-shape` as progressive enhancement only.

#### 3.1.4 `@supports` gate for enhanced radius values

When `corner-shape` is available, continuous-curvature corners can carry a visually larger radius before appearing "too round" than circular arcs can. An `@supports` gate MAY apply a larger radius specifically for the continuous case — continuous corners at 24px read as equivalent to circular arcs at 16px in perceived roundness [^62^].

```css
.surface {
  border-radius: var(--radius-card); /* base: circular fallback */
}

@supports (corner-shape: superellipse(2)) {
  .surface {
    border-radius: var(--radius-card-continuous); /* larger, for squircle */
    corner-shape: superellipse(2);
  }
}
```

The `@supports` block MUST override only the radius value and the shape property — it MUST NOT duplicate unrelated declarations. The two radius tokens SHOULD differ by one step in the token scale.

### 3.2 Universal Fallback: Generated Squircle Path

For browsers without `corner-shape`, a generated SVG path provides the universal fallback, constructed via a parameterized Bézier-and-arc algorithm.

#### 3.2.1 SVG path via Bézier-and-arc construction

The path is parameterized by `cornerRadius` (extent, in pixels) and `cornerSmoothing` (curvature quality, 0–1), then applied via `clip-path: path(...)`.

```javascript
import { getSvgPath } from 'figma-squircle';

function applySquircle(el, w, h, r, smoothing = 0.6) {
  const svgPath = getSvgPath({ width: w, height: h, cornerRadius: r, cornerSmoothing: smoothing });
  el.style.clipPath = `path('${svgPath}')`;
}
```

#### 3.2.2 Use the published Figma algorithm — MUST NOT re-derive

The Bézier geometry has already been solved and published as open-source, originating from Figma's corner-smoothing research [^52^] and distributed through packages such as `figma-squircle` and `squircle-js` [^38^]. Implementations **MUST NOT** re-derive this math independently — a subtly wrong curvature that is "almost right" is worse than plain `border-radius`, because it signals attempted fidelity that falls short. The published algorithm uses a parameterized clothoid-based piecewise function [^52^] cross-validated against multiple reverse-engineering efforts.

#### 3.2.3 Default `cornerSmoothing`: 0.6

When no design guidance specifies otherwise, `cornerSmoothing` **MUST** default to **0.6** — the community-measured approximation of Apple's iOS icon smoothing [^38^] [^87^]. Figma labels the 60% position "iOS", and the tooling ecosystem has converged on this value [^87^]. It is **not** an Apple-published constant; it is derived from visual pixel-comparison and should be treated as the best-available approximation [^46^].

| Smoothing Value | Description |
|----------------|-------------|
| 0.0 | Standard rounded rectangle (circular arc) |
| 0.4 | Subtle smoothing |
| **0.6** | **Apple iOS standard — default for Liquid Glass** |
| 0.8 | Pronounced squircle |
| 1.0 | Maximum continuous curvature |

#### 3.2.4 Recompute on resize via `ResizeObserver`

Squircle geometry is dimension-dependent — the SVG path encodes absolute coordinates for the element's width and height. A `ResizeObserver` MUST monitor each squircle-clipped element and regenerate the path when dimensions change.

```javascript
const ro = new ResizeObserver(entries => {
  for (const { target, contentRect: { width: w, height: h } } of entries) {
    const r = parseFloat(getComputedStyle(target).getPropertyValue('--corner-radius'));
    applySquircle(target, w, h, r, 0.6);
  }
});
document.querySelectorAll('.squircle-surface').forEach(el => ro.observe(el));
```

For fixed-size elements (icons, badges), the path MAY be generated once and cached. For responsive containers, the `ResizeObserver` overhead is unavoidable — the squircle path cannot be expressed as a percentage-based or relative-coordinate shape.

### 3.3 The Three Shape Types

Apple's shape system is built on three categories, documented at WWDC 2025 [^65^]. Every rounded rectangle in a Liquid Glass interface belongs to one of these types.

| Shape Type | Formula | Primary Use | Example Elements |
|------------|---------|-------------|-----------------|
| **Fixed** | `radius = constant` | Consistent layouts | Cards, modals, panels |
| **Capsule** | `radius = height / 2` | Touch-friendly iOS elements | Buttons, bars, switches |
| **Concentric** | `radius = max(0, parentRadius - gap)` | Nested alignment | Child containers, sheets |

> "We use three shape types to build concentric layouts: fixed shapes have a constant corner radius. Capsules use a radius that's half the height of the container. And concentric shapes calculate their radius by subtracting padding from the parent's." — Apple, WWDC 2025 [^65^]

#### 3.3.1 Fixed: constant radius

Fixed shapes carry the same corner radius regardless of container size, making them predictable for general-purpose containers. On macOS, Mini/Small/Medium controls use fixed radii for high-density layouts like inspector panels [^65^].

```css
.card {
  border-radius: var(--radius-lg); /* 16px, always */
}
```

#### 3.3.2 Capsule: `radius = height / 2`

Capsules dominate iOS and iPadOS. The `.glassEffect()` modifier defaults to `Capsule` [^58^] [^16^], confirming its status as the canonical Liquid Glass container. On macOS, Large and X-Large controls also adopt capsules, creating hierarchy where more prominent elements receive more curvature.

```css
.pill-button {
  border-radius: min(9999px, calc(var(--height) / 2));
}
```

> "The capsule's geometry naturally supports concentricity. Which is why you'll see it throughout the system." — Apple, WWDC 2025 [^65^]

#### 3.3.3 Concentric: radius derived from parent

A concentric corner shares a common center with its container's corner, ensuring nested elements trace back to the same radial origin [^47^]. The formula is `childRadius = max(0, parentRadius - gap)` [^41^] [^70^].

Using the same radius for both parent and child creates an optically inconsistent gap — padding appears thicker at the corners than along the edges [^70^]. The concentric formula maintains uniform visual padding around the corner arc.

```css
.outer {
  border-radius: var(--radius-xl); /* 24px */
  padding: var(--space-md);         /* 8px */
}

.inner {
  /* childRadius = max(0, 24 - 8) = 16px */
  border-radius: calc(var(--outer-radius) - var(--outer-padding));
}
```

For components that work both nested and standalone, provide a minimum fallback radius. The concentric value adapts when nested; the fallback applies when alone — matching SwiftUI's `ConcentricRectangle(corners: .concentric(minimum: 24))` [^65^] [^41^]:

```css
.badge {
  border-radius: max(
    var(--badge-fallback-radius, 12px),
    calc(var(--container-radius, 0px) - var(--container-padding, 0px))
  );
}
```

---

## 4. Stage B — Concentric Radius Derivation

This stage gives nested layouts the "sharing a center" look that distinguishes Liquid Glass from ad-hoc rounding. It is the half of the system most reimplementations skip. The concentric radius formula creates a geometric chain in which every nested element's corners trace back to the same center point, producing the unified rhythm between hardware bezels and software shapes that Apple defines as a core Liquid Glass property [^15^].

### 4.1 The Concentric Formula

The governing formula, applied pairwise at every parent-to-child boundary, is:

```
childRadius = max(0, parentRadius - gap)
```

where `gap` is the actual measured perpendicular distance between the child element's corner and the parent element's corner at that point [^47^] [^41^]. In most layouts this equals the parent's padding, but it **MUST** be the real measured offset when the child is not uniformly inset — for example, with asymmetric margins, positioned elements, or scroll offsets. As Panferova notes: "The corner radii for the concentric shape are derived from the container corner radii and the distance between the container and the inner shape corners." [^41^]

The formula is applied **pairwise**, one boundary at a time. At each level, the resolved child radius becomes the `parentRadius` input for the next level down [^65^]. A grandchild's geometry depends on its immediate parent's resolved radius, which may already have been clamped to zero by an intermediate gap. Recomputing from the root would ignore accumulated intermediate padding and produce inconsistent gaps [^70^].

When `gap >= parentRadius`, the child corner resolves to exactly `0` — a square corner. This is correct geometry, not degradation. Implementations **MUST NOT** impose an artificial minimum visible radius [^41^]. The `max(0, ...)` guard is structural, not defensive.

| Parameter | Description | Resolved Value |
|---|---|---|
| `parentRadius` | Resolved radius of nearest radius-bearing ancestor | From previous Stage B iteration or root token |
| `gap` | Measured perpendicular distance between corners | Actual offset (padding in uniform inset; measured otherwise) |
| `childRadius` | Resolved radius for current element | `max(0, parentRadius - gap)`; 0 when gap >= parentRadius |
| Clamping | Mandatory floor, no artificial minimum | Square corner (0) is valid output |

The formula's geometric origin is straightforward: for a rounded rectangle nested inside another to maintain concentricity (sharing a common center), the inner radius must equal the outer radius minus the separation between them [^70^]. When the separation equals or exceeds the outer radius, the inner corner collapses to a right angle — the only mathematically consistent result.

### 4.2 Platform-Specific Shape Usage

Apple's three shape types — Fixed, Capsule, and Concentric — are not applied uniformly across platforms [^65^]. Each platform uses a dominant shape vocabulary reflecting its input model and information density. This determines where Stage B applies: concentric derivation is only invoked for concentric shapes; capsules and fixed-radius elements bypass it.

On iOS and iPadOS, **capsules dominate**. Buttons, switches, sliders, bars, and grouped table view corners all follow capsule geometry (`radius = height / 2`) [^65^]. The capsule naturally supports concentricity: "You'll see it throughout the system — in the mirrored proportions of sliders and switches, and echoed in bars, buttons, and the rounded corners of grouped table views." [^65^] iPhone layouts use capsules with extra margin near screen edges to avoid clipping [^15^]. The `.glassEffect()` API defaults to `Capsule` [^58^] [^16^].

On macOS, shape selection depends on control size. Mini, Small, and Medium controls use **rounded rectangles** (fixed radius) for dense layouts like inspector panels. Large controls use **capsules**, and X-Large uses **capsules with Liquid Glass emphasis** [^65^]. This size-dependent selection creates hierarchy in complex desktop environments.

| Platform | Mini / Small / Medium | Large | X-Large | Root Shell |
|---|---|---|---|---|
| iOS / iPadOS | Capsule (preferred) | Capsule | Capsule | Capsule + extra margin |
| macOS | Rounded rectangle (fixed) | Capsule | Capsule (Liquid Glass) | Concentric, window-aligned |

Stage B applies only to **Concentric** entries in this matrix. Capsules derive radius from container height; fixed rectangles use constant values. For iPad and Mac root shells, the derivation chain starts from the true physical edge inward rather than from an arbitrary top-level card [^15^].

For the outermost element in a concentric chain, the `parentRadius` input is either `0` (no enclosing shell) or a **configured root-shell radius** (PWA window, WebView wrapper, or OS-level rounded window). This value is project-specific and **MUST** be supplied as a configuration parameter; it cannot be derived from CSS.

### 4.3 Runtime Resolver Implementation

The resolver walks the DOM from each radius-bearing root downward. At each child with a declared "concentric" role, it measures offset from the nearest radius-bearing ancestor and writes the resolved value as that element's `--radius` custom property. Levels are not skipped: a grandchild's radius is derived from its **immediate parent's resolved radius**, not recomputed from the root [^65^].

```js
/**
 * Stage B — Concentric Radius Resolver
 * childRadius = max(0, parentRadius - gap), applied pairwise.
 */
function resolveConcentricRadius(parentRadiusPx, gapPx) {
  return Math.max(0, parentRadiusPx - gapPx);
}

/**
 * Walk from a radius-bearing root downward. At each concentric child,
 * measure actual gap, write resolved --radius, then recurse.
 */
function walkConcentricTree(root, rootRadiusPx) {
  const children = root.querySelectorAll('[data-radius-role="concentric"]');

  children.forEach((child) => {
    const parentRect = root.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();

    // Measure ACTUAL perpendicular gap, not assumed padding
    const gapPx = Math.abs(parentRect.top - childRect.top);
    const resolvedRadius = resolveConcentricRadius(rootRadiusPx, gapPx);

    child.style.setProperty('--radius', `${resolvedRadius}px`);

    // Recurse: pass resolvedRadius, NOT rootRadiusPx.
    // This enforces pairwise derivation through the chain.
    if (child.querySelector('[data-radius-role="concentric"]')) {
      walkConcentricTree(child, resolvedRadius);
    }
  });
}

// Initialize from each root element with a configured root-shell radius.
document.querySelectorAll('[data-radius-role="root"]').forEach((root) => {
  const rootRadius = parseFloat(
    getComputedStyle(root).getPropertyValue('--radius-root') || '0'
  );
  walkConcentricTree(root, rootRadius);
});
```

The recursive pass through `walkConcentricTree` enforces pairwise derivation by propagating each resolved radius downward. If a middle-level element clamps to `0`, all descendants below it correctly inherit `0` and resolve to square corners. Skipping levels would allow a grandchild to derive a positive radius from a distant ancestor while ignoring a zero-clamped intermediate parent, breaking the shared-center geometry.

The resolver **SHOULD** run after layout stabilizes — in a `requestAnimationFrame` callback following DOM mutations, resize events, or padding changes. For components that function both nested and standalone, a `minimum` fallback radius **MAY** be provided via a secondary custom property, matching SwiftUI's `ConcentricRectangle(corners: .concentric(minimum: 24))` pattern: "The concentric value adapts when nested, and the fallback kicks in when the component stands alone." [^65^]

---

## 5. Stage C — Typography System

Typography on Liquid Glass departs from the ultra-thin aesthetic of early iOS in favor of heavier, more legible defaults. Translucent glass materials reduce perceived contrast; text compensates through increased weight, precise vibrancy layering, and a font stack engineered for optical clarity. This section defines the SF Pro font system, the 12-class Dynamic Type scale, and the four-tier vibrancy hierarchy for text on glass.

### 5.1 The SF Pro Font Stack

#### 5.1.1 CSS font-family declaration

SF Pro is a neo-grotesque sans-serif typeface designed by Apple and released in 2014, inspired by Helvetica and FF DIN. [^135^] It serves as the system typeface across iOS, iPadOS, macOS, and tvOS. On the web, Apple platforms expose SF Pro through system font generic families; embedding the font file directly violates Apple's license, which restricts usage to "creating mock-ups of user interfaces to be used in software products running on Apple's iOS, iPadOS, macOS or tvOS operating systems." [^184^]

Implementations **MUST** use a progressive font stack that resolves to SF Pro on Apple devices and falls back gracefully elsewhere. The `system-ui` generic family is standardized in CSS Fonts Module Level 4 and resolves to SF Pro on macOS/iOS, Segoe UI on Windows, and Roboto on Android. [^183^] The `-apple-system` keyword targets Safari on Apple platforms; `BlinkMacSystemFont` targets Chrome on macOS. [^182^]

```css
:root {
  /* Primary sans-serif stack — SF Pro on Apple platforms */
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

  /* Monospace stack — SF Mono on Apple platforms */
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco,
    Consolas, "Liberation Mono", "Courier New", monospace;

  /* Rounded variant — SF Pro Rounded on Apple platforms */
  --font-rounded: ui-rounded, "SF Pro Rounded", -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

The `ui-sans-serif`, `ui-serif`, `ui-monospace`, and `ui-rounded` generic families provide standards-compliant mappings across platforms: `ui-sans-serif` resolves to SF Pro on macOS/iOS, Segoe UI on Windows, and Roboto on Android; `ui-monospace` resolves to SF Mono, Consolas, and Roboto Mono respectively; `ui-rounded` resolves to SF Pro Rounded on Apple platforms with no cross-platform equivalent. [^182^]

#### 5.1.2 Optical sizing: SF Pro Text vs Display

SF Pro was originally released as two optical variants: SF Pro Text for sizes at or below 19 pt, and SF Pro Display for sizes at or above 20 pt. Text features wider letter-spacing, heavier strokes, and more open apertures for small-size legibility; Display uses tighter spacing, finer details, and greater contrast for impact at scale. [^137^]

With the SF Pro variable font release in iOS 16, the hard break at 20 pt was eliminated. The optical size now transitions smoothly between 17 and 28 points via the `opsz` axis. [^137^] In platform code this behavior is automatic — the system keeps optical size and point size values in sync for both system fonts and any custom variable font exposing an optical size axis. [^137^] On the web, implementations **SHOULD** enable this via `font-optical-sizing: auto`. For design tools without variable font support, the separate SF Pro Text and Display files remain available; tracking tables between 17 and 28 points **MUST** be updated when switching to the variable font. [^137^]

#### 5.1.3 Nine weights and CSS font-weight mappings

SF Pro provides nine weights mapped to CSS `font-weight` values along a continuous variable axis. [^140^] [^169^]

| Weight Name | CSS `font-weight` | Variable Axis Value | Recommended Usage |
|-------------|-------------------|---------------------|-------------------|
| Ultralight | 100 | 30.925 | Hero text, display sizes only |
| Thin | 200 | 110.725 | Display headlines |
| Light | 300 | 274.315 | Subheadlines, large display |
| Regular | 400 | 400.000 | Body text; base content |
| Medium | 500 | 510.000 | Secondary headers |
| Semibold | 600 | 590.000 | Section headers; buttons |
| Bold | 700 | 700.000 | Primary CTAs; emphasis |
| Heavy | 800 | 860.000 | Display emphasis |
| Black | 900 | 1000.000 | Maximum-impact headlines |

Light weights (Ultralight, Thin, Light) **MUST NOT** be used at text sizes (17 pt and below) due to legibility concerns, particularly on glass where translucent backgrounds reduce perceived contrast. [^140^] Liquid Glass explicitly features bolder text rendering; implementations **SHOULD** default to Regular (400) as the minimum for body text on glass and consider Semibold (600) where legacy designs used Regular. [^1^] SF Pro Text historically shipped with six weights (Light through Heavy) while Display had all nine; the variable font unifies both. [^130^]

#### 5.1.4 SF Pro Rounded, SF Compact, SF Mono

The SF family includes specialized variants for distinct contexts.

| Variant | Context | Weights | Key Characteristics |
|---------|---------|---------|---------------------|
| SF Pro Rounded | Friendly UI, watch complications, Fitness rings | 9 | Rounded terminals; warmth and approachability |
| SF Compact | watchOS, narrow columns, tvOS highlights | 9 | Narrower advance; flatter curves for small sizes [^195^] |
| SF Mono | Xcode, Terminal, Console | 6 | Monospaced; consistent cell widths for alignment |

SF Compact's flatter round curves allow more space between letters, improving legibility at small sizes. [^195^] SF Pro Rounded is available via `ui-rounded` with no equivalent on Windows or Android; implementations **SHOULD** fall back to the standard sans-serif stack when unavailable. [^182^]

### 5.2 Dynamic Type Scale

#### 5.2.1 Twelve size classes

Dynamic Type provides 12 size classes: seven standard (xSmall through xxxLarge) and five accessibility (AX1 through AX5). [^131^] [^141^] The default is Large (L). Each style specifies size, weight, leading, and tracking values that preserve proportional hierarchy — larger defaults grow more slowly than smaller ones as accessibility size increases. [^145^]

The table below specifies the iOS/iPadOS Dynamic Type scale at the default (Large) size class with tracking values from Apple's published tables. [^131^] [^137^]

| Style | Size (pt) | Weight | Leading (pt) | Tracking (pt) | Line-Height Ratio |
|-------|-----------|--------|--------------|---------------|-------------------|
| Large Title | 34 | Regular (400) | 41 | +0.40 | 1.206 |
| Title 1 | 28 | Regular (400) | 34 | +0.38 | 1.214 |
| Title 2 | 22 | Regular (400) | 28 | −0.26 | 1.273 |
| Title 3 | 20 | Regular (400) | 25 | −0.45 | 1.250 |
| Headline | 17 | Semibold (600) | 22 | −0.43 | 1.294 |
| Body | 17 | Regular (400) | 22 | −0.43 | 1.294 |
| Callout | 16 | Regular (400) | 21 | −0.31 | 1.312 |
| Subhead | 15 | Regular (400) | 20 | −0.23 | 1.333 |
| Footnote | 13 | Regular (400) | 18 | −0.08 | 1.385 |
| Caption 1 | 12 | Regular (400) | 16 | 0.00 | 1.333 |
| Caption 2 | 11 | Regular (400) | 13 | +0.06 | 1.182 |

Tracking is negative through the text-size range (peaking at −0.43 pt at 17 pt), crosses to positive at 24 pt, and returns to zero at 80 pt and above. [^137^] This continuous curve eliminates the abrupt shift at the old 20 pt Text/Display boundary.

#### 5.2.2 CSS clamp() for fluid scaling

Implementations **SHOULD** use CSS `clamp()` for fluid scaling between minimum readable size and maximum accessibility size. The minimum bound prevents unreadable text on small screens; the maximum bound prevents accessibility text from breaking containers.

```css
:root {
  --type-large-title: clamp(1.75rem, 5vw + 1rem, 2.125rem);   /* 28–34pt */
  --type-title-1: clamp(1.5rem, 4vw + 0.875rem, 1.75rem);     /* 24–28pt */
  --type-title-2: clamp(1.25rem, 3vw + 0.75rem, 1.375rem);    /* 20–22pt */
  --type-title-3: clamp(1.125rem, 2.5vw + 0.625rem, 1.25rem); /* 18–20pt */
  --type-headline: clamp(0.9375rem, 1.5vw + 0.75rem, 1.0625rem); /* 15–17pt */
  --type-body: clamp(0.9375rem, 1.5vw + 0.75rem, 1.0625rem);     /* 15–17pt */
  --type-callout: clamp(0.875rem, 1.5vw + 0.625rem, 1rem);    /* 14–16pt */
  --type-subhead: clamp(0.8125rem, 1.25vw + 0.625rem, 0.9375rem); /* 13–15pt */
  --type-footnote: clamp(0.75rem, 1vw + 0.5rem, 0.8125rem);  /* 12–13pt */
  --type-caption-1: clamp(0.6875rem, 1vw + 0.5rem, 0.75rem); /* 11–12pt */
  --type-caption-2: clamp(0.6875rem, 0.875vw + 0.5rem, 0.6875rem); /* 11pt floor */
}
```

For tracking, Apple publishes values in thousandths of an em; implementations **MUST** convert proportionally for CSS `letter-spacing`:

```css
/* Tracking at 17pt: -26/1000 em = -0.022em */
.tracking-17pt { letter-spacing: -0.022em; }

/* Tracking at 34pt: +12/1000 em = +0.012em */
.tracking-34pt { letter-spacing: 0.012em; }
```

#### 5.2.3 @ScaledMetric equivalent: CSS custom properties

SwiftUI's `@ScaledMetric` scales a value proportionally with the user's Dynamic Type setting. In CSS, custom properties referencing a base size variable achieve the same behavior — when the root font size changes, all dependent properties scale automatically.

```css
:root {
  /* Base metric — scales with user's browser font-size preference */
  --dynamic-base: 1rem;

  /* Derived metrics: equivalent to @ScaledMetric in SwiftUI */
  --scaled-icon-xs: calc(var(--dynamic-base) * 0.75);
  --scaled-icon-sm: calc(var(--dynamic-base) * 0.875);
  --scaled-icon-md: var(--dynamic-base);
  --scaled-icon-lg: calc(var(--dynamic-base) * 1.25);
  --scaled-icon-xl: calc(var(--dynamic-base) * 1.5);

  /* Padding scales with type to preserve touch targets */
  --scaled-padding-sm: calc(var(--dynamic-base) * 0.5);
  --scaled-padding-md: calc(var(--dynamic-base) * 0.75);
  --scaled-padding-lg: var(--dynamic-base);
}
```

Implementations **SHOULD** expose a single `--dynamic-base` property overridable via browser preferences or in-app accessibility controls. All typography, spacing, and icon sizing tokens **MUST** derive from this base. When font size increases with Dynamic Type, line height scales proportionally. [^127^]

### 5.3 Text on Glass Materials

#### 5.3.1 Four-tier vibrancy hierarchy

Text on glass materials **MUST** use vibrant colors, never opaque system colors. [^5^] Vibrancy automatically adjusts text color, brightness, and saturation based on background content passing through the material. [^16^] Four vibrancy levels form a contrast gradient from primary to de-emphasized content.

| Vibrancy Level | Semantic Token | Contrast | Usage |
|---------------|----------------|----------|-------|
| Label (default) | `UIVibrancyEffectStyle.label` | Highest | Primary text, titles, body content |
| Secondary Label | `UIVibrancyEffectStyle.secondaryLabel` | High | Descriptions, footnotes, subtitles |
| Tertiary Label | `UIVibrancyEffectStyle.tertiaryLabel` | Medium | Inactive elements, disabled states |
| Quaternary Label | `UIVibrancyEffectStyle.quaternaryLabel` | Lowest | Very de-emphasized content, placeholders |

On visionOS only three vibrancy levels exist (`label`, `secondaryLabel`, `tertiaryLabel`); quaternary is omitted. [^5^] Quaternary vibrancy **MUST NOT** be used on `thin` or `ultraThin` materials because contrast is too low for legibility. [^5^] Thicker materials provide better text contrast; thinner materials retain more background context. [^5^]

#### 5.3.2 CSS text-shadow and mix-blend-mode equivalents

Native vibrancy relies on real-time background sampling that CSS cannot fully replicate. Implementations **MAY** approximate vibrancy using `mix-blend-mode` and text shadows.

```css
/* Vibrancy approximation for text on glass */
.vibrant-label {
  color: rgb(255 255 255 / 0.95);
  mix-blend-mode: plus-lighter;
  text-shadow: 0 0 2px rgb(0 0 0 / 0.15);
}

.vibrant-secondary {
  color: rgb(255 255 255 / 0.75);
  mix-blend-mode: plus-lighter;
  text-shadow: 0 0 1px rgb(0 0 0 / 0.1);
}

.vibrant-tertiary {
  color: rgb(255 255 255 / 0.55);
  mix-blend-mode: plus-lighter;
}

.vibrant-quaternary {
  color: rgb(255 255 255 / 0.38);
  mix-blend-mode: plus-lighter;
}
```

The `plus-lighter` blend mode adds text luminance to the background, mimicking native vibrancy. [^16^] For dark-content scenarios, implementations **SHOULD** switch to a dark-vibrancy variant:

```css
.vibrant-label-dark {
  color: rgb(0 0 0 / 0.92);
  mix-blend-mode: multiply;
  text-shadow: 0 0 2px rgb(255 255 255 / 0.2);
}
```

Highest-fidelity results are achieved when the material layer applies `backdrop-filter: blur()` with alpha background, while text layers above use vibrancy blend modes to extract contrast from the filtered background.

#### 5.3.3 Liquid Glass bolder text rendering

Liquid Glass introduces explicitly bolder text rendering for improved clarity on translucent surfaces. [^1^] This is a legibility requirement: glass reduces perceived contrast, and heavier stroke weights compensate. The Lock Screen clock in iOS 26 demonstrates the most advanced application — a custom San Francisco typeface dynamically morphs weight, width, and height of each numeral in real time based on wallpaper content. [^166^] [^167^] While full morphing requires platform-level font technology, web implementations **SHOULD** adopt these bolder defaults:

```css
:root {
  /* Liquid Glass: shift body weight up by one step */
  --weight-body: 500;        /* Regular → Medium on glass */
  --weight-headline: 700;    /* Semibold → Bold on glass */
  --weight-caption: 500;     /* Regular → Medium on glass */

  /* Minimum weight on any glass material */
  --weight-glass-minimum: 400;
}

.glass-container { font-weight: var(--weight-body); }
.glass-container .headline { font-weight: var(--weight-headline); }
```

Implementations **MUST NOT** use font weights below 400 for any text on Liquid Glass or standard material backgrounds. For display sizes (20 pt and above), the full weight range remains available, but Light (300) and thinner **SHOULD** be avoided unless the background is uniformly dark.

Apple also specifies left-aligned typography in critical moments such as alerts and onboarding. [^1^] This improves scanability when users process important information quickly. Web implementations **SHOULD** default to left-alignment for alert text, onboarding copy, and any content on glass where rapid comprehension is required.

---

## 6. Stage D — Spacing & Layout Grid

Apple's spacing system operates on an 8-point grid with a 4-point sub-grid, adapting through size classes, safe area insets, and layout margins [^1^][^2^]. This section defines the token scale, safe area handling, and hardware-software concentric alignment that gives Liquid Glass its unified spatial rhythm.

### 6.1 The 8-Point Grid

#### 6.1.1 Base Scale and Token Architecture

The Apple-approved spacing scale increments in 8-point steps for inter-component spacing and 4-point steps for internal component spacing. The full scale spans 4pt to 64pt, with each step carrying a semantic token name that maps to a specific layout context [^2^].

| Token | Value | Usage Context | Grid Type |
|---|---|---|---|
| `--space-xxs` | 4pt | Tight component internal padding, icon button inset, chip spacing | 4pt sub-grid |
| `--space-xs` | 8pt | Default gap between related elements, list separator padding, button row gap | 8pt base |
| `--space-s` | 12pt | Small component padding, tight groups, compact card gutters | 4pt sub-grid |
| `--space-m` | 16pt | Standard screen edge margin (Compact width), card internal padding | 8pt base |
| `--space-l` | 20pt | Standard screen edge margin (Regular width), iPad layout margins | 4pt sub-grid |
| `--space-xl` | 24pt | Content block bottom margin, section separation | 8pt base |
| `--space-2xl` | 32pt | Header/footer height, major section separation | 8pt base |
| `--space-3xl` | 40pt | Large container padding, card groups | 8pt base |
| `--space-4xl` | 48pt | Extra-large separation, hero section padding | 8pt base |
| `--space-5xl` | 56pt | Prominent action button heights | 8pt base |
| `--space-6xl` | 64pt | Major structural spacing, landscape section gaps | 8pt base |

This scale directly reflects the specification that defines spacing components at 8, 16, 24, 32, 40, 48, 56, and 64pt for all padding and margin between elements, with 4pt reserved for tight internal adjustments [^1^][^2^]. The CSS custom property implementation **MUST** expose every step:

```css
:root {
  /* ---- Base Grid Units ---- */
  --space-unit: 4pt;
  --space-grid: 8pt;

  /* ---- Spacing Scale ---- */
  --space-xxs:   4pt;   /* 0.5x — tight internal padding */
  --space-xs:    8pt;   /* 1x — default inter-element gap */
  --space-s:    12pt;   /* 1.5x — small component padding */
  --space-m:    16pt;   /* 2x — compact screen margin */
  --space-l:    20pt;   /* 2.5x — regular screen margin */
  --space-xl:   24pt;   /* 3x — content block separation */
  --space-2xl:  32pt;   /* 4x — header/footer height */
  --space-3xl:  40pt;   /* 5x — large container padding */
  --space-4xl:  48pt;   /* 6x — hero section gap */
  --space-5xl:  56pt;   /* 7x — prominent action height */
  --space-6xl:  64pt;   /* 8x — major structural spacing */
}
```

#### 6.1.2 4pt Sub-Grid for Internal Component Spacing

The 8-point grid governs spacing between components; the 4-point sub-grid governs spacing inside them. Use 4-point increments for internal component padding — button insets, badge spacing, chip padding, icon margins — and 8-point increments for all inter-component gaps and component-level dimensions [^3^]. Web implementations **MUST** confine the 4pt sub-grid to component boundaries only; inter-component spacing that deviates from the 8pt base grid breaks the visual rhythm. Apple enforces this through `NSStackView`, whose `spacing` property defaults to 8.0 points, encoding the platform expectation that adjacent views breathe at 8pt intervals [^19^].

### 6.2 Safe Areas & Layout Margins

#### 6.2.1 iPhone Safe Area Insets

Safe area insets change with device generation, orientation, and visible chrome. On iPhone 16 series, the top inset measures 59pt in portrait (62pt on Pro models), while the bottom inset is 34pt on all Face ID iPhones for the Home Indicator [^5^][^6^]. In landscape, top collapses to 0pt while left and right edges each absorb 59pt (62pt on Pro) to accommodate the Dynamic Island and rounded corners, with the Home Indicator shrinking to 21pt [^5^].

| Feature | iPhone 16 / 16 Plus | iPhone 16 Pro / Pro Max | iPhone SE (3rd gen) |
|---|---|---|---|
| Portrait top | 59pt | 62pt | 20pt |
| Portrait bottom | 34pt | 34pt | 0pt |
| Portrait left/right | 0pt | 0pt | 0pt |
| Landscape top | 0pt | 0pt | 0pt |
| Landscape bottom | 21pt | 21pt | 0pt |
| Landscape left | 59pt | 62pt | 0pt |
| Landscape right | 59pt | 62pt | 0pt |

The iPad uses a distinct profile: the Home Indicator occupies exactly 20pt in both orientations, with the status bar at 24pt [^7^]. visionOS raises the minimum interactive tap target to 60pt, with ornaments overlapping window edges by 20pt [^10^]. These values represent hardware-imposed collision boundaries that the layout engine **MUST** respect.

#### 6.2.2 Layout Margins: Size-Class Responsive Values

Layout margins derive from the horizontal size class, not the device. On iOS and iPadOS, margins are 16pt in Compact width and 20pt in Regular width [^11^]. iPhone portrait (Compact) uses 16pt; iPad full-screen (Regular) uses 20pt. iPhone Plus/Max in landscape crosses into Regular width and adopts 20pt. iPad Split View introduces dynamic transitions: a 50/50 split on non-Pro iPads assigns Compact width (16pt), while the 12.9-inch and 13-inch iPad Pro retains Regular width (20pt) for both panes [^7^][^24^].

| Context | Width Size Class | Layout Margin |
|---|---|---|
| iPhone (portrait) | Compact | 16pt |
| iPhone (landscape, non-Plus) | Compact | 16pt |
| iPhone Plus/Max (landscape) | Regular | 20pt |
| iPad (full screen) | Regular | 20pt |
| iPad Split View 50/50 (non-Pro) | Compact | 16pt |
| iPad Split View 50/50 (12.9"/13" Pro) | Regular | 20pt |
| iPad Slide Over | Compact | 16pt |

The `insetsLayoutMarginsFromSafeArea` property causes layout margins to compound with safe area insets using `max()`, not addition: effective edge padding equals the larger of the layout margin or the safe area inset at that edge [^25^]. Web implementations **MUST** replicate this `max()` behavior.

#### 6.2.3 CSS `env(safe-area-inset-*)` Usage with Fallbacks

On the web, safe area insets are exposed through CSS environment variables. The protocol **MUST** query these inside `@supports` and apply `max()` fallbacks:

```css
@supports (padding-top: env(safe-area-inset-top)) {
  :root {
    --safe-top:    env(safe-area-inset-top);
    --safe-bottom: env(safe-area-inset-bottom);
    --safe-left:   env(safe-area-inset-left);
    --safe-right:  env(safe-area-inset-right);
  }
}

/* Fallback for devices without safe-area support */
@supports not (padding-top: env(safe-area-inset-top)) {
  :root {
    --safe-top:    0pt;
    --safe-bottom: 0pt;
    --safe-left:   0pt;
    --safe-right:  0pt;
  }
}

/* Size-class responsive layout margin */
:root {
  --margin-screen: var(--space-m); /* 16pt default (Compact) */
}

@media (min-width: 768px) {
  :root {
    --margin-screen: var(--space-l); /* 20pt (Regular) */
  }
}

/* Combined safe-area + margin application */
.page-container {
  padding-top:    max(var(--safe-top),    var(--space-xs));
  padding-bottom: max(var(--safe-bottom), var(--space-xs));
  padding-left:   max(var(--safe-left),   var(--margin-screen));
  padding-right:  max(var(--safe-right),  var(--margin-screen));
}
```

The `max()` pattern replicates iOS's `insetsLayoutMarginsFromSafeArea` behavior: when the safe area exceeds the layout margin (iPhone Dynamic Island: 59pt vs 16pt), the safe area wins; when the margin exceeds the safe area (iPad: 20pt vs 0pt), the margin prevails [^25^].

### 6.3 Hardware-Software Concentric Alignment

#### 6.3.1 Device Edge Handling: Capsules and Concentric Shapes

Liquid Glass introduces a concentric shape system that aligns software geometry with hardware bezels, creating what Apple describes as "a unified rhythm between what you hold and what you see" [^15^]. The system defines three shape types: fixed shapes with constant corner radius, capsules with radius equal to half the container height, and concentric shapes whose radius is derived from the parent's radius minus the padding gap [^15^]. This concentric formula — `innerRadius = max(0, outerRadius - padding)` — ensures that nested elements share a common center point, producing visually consistent gap thickness around every corner [^41^][^70^].

For phone layouts, capsules **MUST** be used with extra margin near the screen edge to prevent clipped corners against the device's physical rounded display. For iPad and Mac, concentric shapes align with the window edge [^15^]. iPhone's tight bezels would cause concentric shapes to collide with the display edge; the capsule's uniform curvature provides necessary breathing room. iPad and Mac window chrome and larger bezels create a natural buffer that lets concentric shapes extend to the edge.

The CSS implementation of concentric derivation uses `calc()` to express the relationship between container radius, padding, and child radius:

```css
/* Parent container with concentric shape */
.glass-card {
  --card-radius: var(--radius-xl);    /* 24pt */
  --card-padding: var(--space-xs);     /* 8pt */
  border-radius: var(--card-radius);
  padding: var(--card-padding);
}

/* Child: concentric radius derived from parent */
.glass-card-inner {
  /* innerRadius = outerRadius - padding */
  border-radius: calc(var(--card-radius) - var(--card-padding));
  /* Result: 16pt — shares center with parent corner */
}

/* Minimum fallback for standalone components */
.glass-badge {
  border-radius: max(
    var(--badge-fallback, var(--radius-md)),
    calc(var(--container-radius, 0px) - var(--container-padding, 0px))
  );
}
```

The `max()` fallback is essential for components that appear both nested and standalone: when nested, the concentric calculation produces a positive radius; when standalone, the container tokens resolve to zero and the fallback takes over — matching the `ConcentricRectangle(minimum:)` API in iOS 26 [^16^].

#### 6.3.2 Readable Content Guides

Apple's readable content guide defines an area optimized for text readability. On iPad Pro 12.9-inch in landscape, it measures approximately 672pt wide, inset 176pt from each edge, yielding a body text line length of roughly 87 characters at default Dynamic Type [^13^][^14^]. The width adapts with Dynamic Type: 560pt at the smallest setting, 896pt at the largest standard setting [^14^].

For web implementations lacking `readableContentGuide`, the 52% container width rule approximates the guide in Regular-Regular size classes [^26^]. This rule **MUST** apply only when both width and height size classes are Regular (iPad full-screen landscape); on Compact widths the percentage produces excessive narrowing.

```css
/* Readable content guide implementation */
:root {
  --readable-max-width: 672pt;
  --readable-width-pct: 52%;
}

.readable-content {
  /* Fixed max-width approach (iPad landscape) */
  max-width: var(--readable-max-width);
  margin-left: auto;
  margin-right: auto;
}

/* Size-class responsive readable width */
@media (min-width: 1024px) and (min-height: 768px) {
  .readable-content-fluid {
    width: var(--readable-width-pct);
    max-width: var(--readable-max-width);
    margin-left: auto;
    margin-right: auto;
  }
}

/* Compact width: use full margins, no percentage constraint */
@media (max-width: 767px) {
  .readable-content-fluid {
    width: auto;
    margin-left: var(--margin-screen);
    margin-right: var(--margin-screen);
  }
}
```

The 8-point grid, safe-area-aware margins, and concentric shape derivation form a closed mathematical system: the concentric formula connects spacing tokens to shape tokens; the safe area `max()` pattern connects hardware insets to layout margins; and the readable content guide connects container width to typography legibility. Together these produce the unified spatial rhythm that Liquid Glass requires — a system where, as Apple articulates, "curvature, size, and proportion align to create a unified rhythm between what you hold and what you see" [^15^].

---

## 7. Stage E — Depth, Shadows & Elevation

### 7.1 The Adaptive Depth System

#### 7.1.1 Apple's Depth Is Adaptive, Not Fixed

Liquid Glass replaces the fixed elevation-shadow mapping of Material Design with a **content-aware depth system** in which shadow opacity, material thickness, and translucency all respond dynamically to the content behind them [^79^]. The element "is aware of what's behind it and increases the opacity of its shadow when it is over text" and "lowers the opacity of its shadow when it is over a solid light background" [^79^]. When glass floats over media-rich content, it "casts deeper, richer shadows, has more pronounced lensing and refraction effects, and a softer scattering of light" [^79^].

This adaptation operates across five simultaneous layers [^79^]: a **Highlights Layer** responding to environmental lighting and device motion; a **Shadows Layer** with content-aware opacity; **Tint Layers** adapting hue, brightness, and saturation; a **Lensing Layer** bending light in real-time; and an **Illumination Layer** providing touch feedback through internal glow. Each layer "continuously adapts based on what's behind it" [^79^], making depth perception emergent rather than prescribed. Web implementations **MUST NOT** attempt full real-time replication in CSS — the system requires compositor-level background access. Instead, implementations **SHOULD** use JavaScript intersection observers to detect background content type and apply pre-defined shadow variants.

#### 7.1.2 Material Thickness Correlates with Elevation

Material thickness serves as the primary information hierarchy signal, establishing a direct mapping: `thickness → opacity → elevation` [^5^]. Thicker materials are more opaque and indicate higher importance; thinner materials are more translucent and indicate lower importance. The five standard content-layer materials — `ultraThin`, `thin`, `regular`, `thick`, `ultraThick` — form a continuous spectrum from background-adjacent (mostly translucent) to foreground-adjacent (mostly opaque) [^5^][^251^]. In visionOS, this hierarchy becomes literal spatial depth: thin material brings interactive elements closer to the user; thick material creates elements that read as recessed [^273^].

Liquid Glass occupies a separate tier above all content-layer materials and is **reserved exclusively** for the navigation layer — tab bars, toolbars, navigation bars, and controls [^258^]. This thickness-elevation correlation means that selecting `--material-thick` for a sidebar simultaneously chooses a higher elevation, stronger shadow, and more opaque surface from a single token decision [^5^].

#### 7.1.3 Glass-on-Glass Stacking Is an Explicit Anti-Pattern

Apple's HIG explicitly warns: "Don't use Liquid Glass in the content layer" because it "can result in unnecessary complexity and a confusing visual hierarchy" [^79^]. The stronger prohibition is against stacking Liquid Glass elements on each other — "stacking Liquid Glass elements on top of each other can quickly make the interface feel cluttered and confusing" [^79^]. When placing elements atop Liquid Glass, implementations **MUST** use fills, transparency, and vibrancy instead of applying glass to both layers [^79^]. The correct hierarchy is immutable: content layer at the bottom, a gap with scroll edge effects, and the Liquid Glass navigation layer floating above [^65^]. Any glass-on-glass occurrence **MUST** be refactored.

### 7.2 Shadow Specifications

#### 7.2.1 One Shadow Only: Product Photography Exclusion

Apple's web design system uses exactly one drop-shadow: `rgba(0, 0, 0, 0.22) 3px 5px 30px 0`, applied exclusively to product photography — never to cards, buttons, or text [^266^]. UI elevation derives from surface-color change and `backdrop-filter` blur on sticky bars [^266^]. This constraint is absolute.

```css
/* Apple's ONLY shadow — reserved for product photography */
:root {
  --shadow-product-photo: rgba(0, 0, 0, 0.22) 3px 5px 30px 0;
}
```

#### 7.2.2 Five Elevation Levels: SAP Fiori for iOS Proxy

Since Apple's Liquid Glass shadows are fully adaptive with no published fixed values, the SAP Fiori for iOS design system — built in partnership with Apple — provides the closest public specification [^238^]. SAP defines five elevation levels with exact CSS `box-shadow` values for light mode. In dark mode, all levels collapse to `0px 0px 2px 0px rgba(0, 0, 0, 0.13)` [^238^] since dark surfaces absorb light and require minimal differentiation.

| Level | Usage | Shadow Value (Light Mode) |
|:-----:|-------|--------------------------|
| 0 | Modal and non-modal sheets | `0px 0px 2px 0px rgba(0, 0, 0, 0.13)` |
| 1 | Default cards | `0px 0px 2px 0px rgba(0, 0, 0, 0.13), 0px 1px 4px 0px rgba(0, 0, 0, 0.04)` |
| 2 | Elevated cards | `0px 0px 2px 0px rgba(0, 0, 0, 0.13), 0px 2px 8px 0px rgba(0, 0, 0, 0.04)` |
| 3 | Toasts, quick-sort menus | `0px 0px 2px 0px rgba(0, 0, 0, 0.13), 0px 8px 16px 0px rgba(0, 0, 0, 0.04), 0px 16px 32px 0px rgba(0, 0, 0, 0.04)` |
| 4 | Popovers (highest) | `0px 0px 2px 0px rgba(0, 0, 0, 0.04), 0px 8px 16px 0px rgba(0, 0, 0, 0.04), 0px 10px 100px 0px rgba(0, 0, 0, 0.20)` |

*Source: SAP Fiori Design for iOS Elevation [^238^].*

The shadow intensity follows a clear progression: Level 0 provides only a 2px contact shadow for sheets sitting close to their parent. Level 1 introduces a 1px vertical offset for standard cards. Level 2 doubles the offset to 2px with 8px blur for elevated cards. Level 3 adds a third layer reaching 32px blur for transient toasts. Level 4 extends to 100px blur at 20% opacity for popovers demanding maximum attention [^238^].

```css
:root {
  --shadow-elevation-0: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
  --shadow-elevation-1:
    0px 0px 2px 0px rgba(0, 0, 0, 0.13),
    0px 1px 4px 0px rgba(0, 0, 0, 0.04);
  --shadow-elevation-2:
    0px 0px 2px 0px rgba(0, 0, 0, 0.13),
    0px 2px 8px 0px rgba(0, 0, 0, 0.04);
  --shadow-elevation-3:
    0px 0px 2px 0px rgba(0, 0, 0, 0.13),
    0px 8px 16px 0px rgba(0, 0, 0, 0.04),
    0px 16px 32px 0px rgba(0, 0, 0, 0.04);
  --shadow-elevation-4:
    0px 0px 2px 0px rgba(0, 0, 0, 0.04),
    0px 8px 16px 0px rgba(0, 0, 0, 0.04),
    0px 10px 100px 0px rgba(0, 0, 0, 0.20);
}

@media (prefers-color-scheme: dark) {
  :root {
    --shadow-elevation-0: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
    --shadow-elevation-1: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
    --shadow-elevation-2: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
    --shadow-elevation-3: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
    --shadow-elevation-4: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
  }
}
```

Cross-platform shadow conversion **MUST** apply scale factors [^243^]: CSS to iOS uses 0.5×; CSS to Android uses 0.866×; iOS to CSS uses 2.0×; Android to CSS uses 1.155×.

#### 7.2.3 Ambient Occlusion: Darker Edge Shading (iOS 27+)

iOS 27 introduced explicit darker edge shading around Liquid Glass elements — functionally **ambient occlusion** from 3D rendering — where contact edges receive less light and appear darker [^267^][^281^]. Apple described this as: "a darkened edge and brighter specular highlights establish more depth and separation for the UI" [^281^], addressing legibility concerns where "transparency in certain interface elements made text harder to read, particularly in low-contrast conditions" [^256^].

The effect is approximated via inset `box-shadow` on glass edges. iOS 27 also introduced a user-controllable transparency slider, signaling that depth and transparency are now **user preferences** [^281^]. Web implementations **SHOULD** respect this through `prefers-reduced-transparency` media queries, reducing `backdrop-filter` blur and increasing background opacity when users opt for less translucency.

```css
:root {
  --edge-occlusion-light: inset 0 -0.5px 0 0 rgba(0, 0, 0, 0.06);
  --edge-occlusion-dark:  inset 0 -0.5px 0 0 rgba(0, 0, 0, 0.15);
  --edge-highlight-top:   inset 0 0.5px 0 0 rgba(255, 255, 255, 0.30);
}
```

### 7.3 Z-Index Hierarchy

#### 7.3.1 Three-Layer Architecture

Apple's interface enforces a strict three-layer architecture [^16^][^79^]. The **Content Layer** (0–1999) holds standard materials, lists, tables, media, and scrollable content. The **Navigation Layer** (2000–2999) holds Liquid Glass, tab bars, sidebars, toolbars, and controls. The **Overlay Layer** (3000+) holds popovers, sheets, modals, alerts, and tooltips. "Liquid Glass forms a distinct functional layer for controls and navigation elements — like tab bars and sidebars — that floats above the content layer" [^258^]. When a sheet appears, the content window recedes along the z-axis while the sheet comes forward — a spatial pattern inherited from visionOS [^242^].

The 2000-point gap between Content and Navigation layers prevents collision and allows content sub-layering. The 100-point increments within the Navigation layer provide predictable insertion points for new component types.

| Token | Z-Index | Layer | Element Type |
|:------|:-------:|:-----:|:-------------|
| `--z-base` | 0 | Content | Page root, static backgrounds |
| `--z-content` | 10 | Content | Text blocks, standard flow |
| `--z-scroll-view` | 20 | Content | Scrollable containers |
| `--z-media` | 30 | Content | Images, video, canvas |
| `--z-content-elevated` | 100 | Content | Raised cards, sticky sub-headers |
| `--z-material-ultra-thin` | 200 | Content | Full-screen translucent backgrounds |
| `--z-material-thin` | 300 | Content | Interactive element surfaces |
| `--z-material-regular` | 400 | Content | Default content surfaces |
| `--z-material-thick` | 500 | Content | Dark element backgrounds |
| `--z-material-ultra-thick` | 600 | Content | Maximum contrast surfaces |
| `--z-nav-base` | 2000 | Navigation | Navigation layer entry |
| `--z-tab-bar` | 2100 | Navigation | Bottom tab bars |
| `--z-toolbar` | 2200 | Navigation | Toolbars, formatting bars |
| `--z-sidebar` | 2300 | Navigation | Side navigation panels |
| `--z-navigation-bar` | 2400 | Navigation | Top navigation bars |
| `--z-search-bar` | 2500 | Navigation | Search input chrome |
| `--z-liquid-glass` | 2600 | Navigation | Liquid Glass controls |
| `--z-overlay` | 3000 | Overlay | Overlay backdrop/scrim |
| `--z-popover` | 3100 | Overlay | Popover containers |
| `--z-sheet` | 3200 | Overlay | Bottom sheets |
| `--z-modal` | 3300 | Overlay | Modal dialogs |
| `--z-alert` | 3400 | Overlay | System alerts |
| `--z-toast` | 3500 | Overlay | Toast notifications |
| `--z-dropdown` | 3600 | Overlay | Dropdown menus |
| `--z-tooltip` | 3700 | Overlay | Tooltip labels |
| `--z-fullscreen` | 4000 | Overlay | Full-screen takeover |

*Source: Apple Developer Documentation three-layer architecture [^16^][^79^] and SAP Fiori iOS conventions [^238^].*

#### 7.3.2 CSS Custom Property Tokens for Z-Index

Token names encode both layer and component type: `--z-content-*` and `--z-material-*` for Content Layer; `--z-nav-*` for Navigation Layer; `--z-overlay-*` for Overlay Layer. This convention makes layer violations detectable at code review — a content element receiving a `--z-nav-*` token is immediately identifiable as an error.

```css
:root {
  --z-base: 0;
  --z-content: 10;
  --z-scroll-view: 20;
  --z-media: 30;
  --z-content-elevated: 100;
  --z-material-ultra-thin: 200;
  --z-material-thin: 300;
  --z-material-regular: 400;
  --z-material-thick: 500;
  --z-material-ultra-thick: 600;
  --z-nav-base: 2000;
  --z-tab-bar: 2100;
  --z-toolbar: 2200;
  --z-sidebar: 2300;
  --z-navigation-bar: 2400;
  --z-search-bar: 2500;
  --z-liquid-glass: 2600;
  --z-overlay: 3000;
  --z-popover: 3100;
  --z-sheet: 3200;
  --z-modal: 3300;
  --z-alert: 3400;
  --z-toast: 3500;
  --z-dropdown: 3600;
  --z-tooltip: 3700;
  --z-fullscreen: 4000;
}
```

A runtime validation helper catches layer-violation bugs during development by asserting that a resolved z-index falls within its expected layer range:

```javascript
/**
 * Resolves a z-index token and validates layer correctness.
 * Throws in development when token layer mismatches element type.
 */
function resolveZIndex(token, elementType) {
  const value = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue(token), 10
  );

  const layerRanges = {
    content:     [0, 1999],
    navigation:  [2000, 2999],
    overlay:     [3000, Infinity]
  };

  if (process.env.NODE_ENV === 'development') {
    const [min, max] = layerRanges[elementType];
    if (value < min || value > max) {
      throw new Error(
        `[Liquid Glass] Layer violation: ${token} (${value}) ` +
        `assigned to ${elementType}, expected ${min}–${max}`
      );
    }
  }
  return value;
}
```

When a window loses focus, "Liquid Glass shifts its appearance and visually recedes to guide attention" [^79^]. This **MAY** be implemented by reducing `backdrop-filter` intensity and dimming surface opacity on non-focused modal layers, creating perceived z-axis recession without changing the actual `z-index` value.

---

## 8. Stage F — Motion, Physics & Animation

Apple's animation system underwent a foundational shift in iOS 17: spring physics replaced easing curves as the default interaction model, and Liquid Glass extends that philosophy by making motion a core material property rather than a decorative layer [^79^] [^291^]. Where previous materials treated animation as something applied *to* a surface, Liquid Glass treats animation as part of the surface's physical definition — materialization modulates light-bending, morphing reshapes the glass plane itself, and touch response creates gel-like flexion [^79^]. This stage specifies the spring parameter models, timing curve mappings, Liquid Glass-specific animation types, and interruptible transition mechanics required to replicate that behavior on the web.

### 8.1 Spring Animation Parameters

#### 8.1.1 Legacy Model: response, dampingFraction, blendDuration

The legacy SwiftUI spring model, supported since iOS 13 and still valid today, configures physics through three parameters. The default `.spring()` initializer uses `response: 0.55`, `dampingFraction: 0.825`, `blendDuration: 0` [^293^]. The `response` parameter controls the perceptual speed of the spring — values around 0.3 produce quick, snappy motion suited to button feedback, 0.55 is the balanced default, and 0.9 creates slower, more deliberate transitions for modal presentations [^10^]. The `dampingFraction` governs oscillation: 0.5 yields visible bounce, 0.75 is balanced, and 0.95 produces a nearly critically-damped spring with minimal overshoot [^10^]. The `blendDuration` parameter interpolates changes to the response value when multiple spring animations target the same property, enabling smooth handoffs between overlapping animations [^287^]. In practice, `blendDuration: 0` is the correct default for most single-property transitions; nonzero values only become relevant when mixing spring animations on shared properties.

#### 8.1.2 Modern iOS 17+ Model: duration + bounce

At WWDC 2023, Apple introduced a two-parameter spring model using `duration` and `bounce` that maps more directly to designer intent [^340^]. Increasing duration makes the animation take longer; increasing bounce adds overshoot. The `Spring` model type can convert programmatically between parameter systems — duration/bounce to mass/stiffness/damping and vice versa — which means both mental models coexist and interoperate [^308^]. The conversion formulas, corrected after an error in the original WWDC presentation, are:

```
mass = 1
stiffness = (2π ÷ perceptualDuration)²
damping = ((1 - bounce) × 4π) ÷ perceptualDuration,  bounce ≥ 0
damping = 4π ÷ (perceptualDuration × (1 + bounce)),  bounce < 0
```

These formulas allow web implementations to accept duration/bounce as the user-facing API while computing the underlying physics parameters for simulation [^316^]. The concept of **perceptual duration** is central here: unlike traditional spring "settling duration" that varies with bounce intensity, perceptual duration remains constant and predictable regardless of bounce value, solving the design problem where adding bounce inadvertently made animations feel longer [^316^].

**Table 1: Spring Parameter Reference**

| Parameter Set | Model | Key Values | Use Case |
|---|---|---|---|
| `response: 0.3, dampingFraction: 0.75` | Legacy | Quick, snappy | Button press, small UI feedback [^10^] |
| `response: 0.55, dampingFraction: 0.825` | Legacy | Balanced default | Standard transitions, modals [^293^] |
| `response: 0.9, dampingFraction: 0.6` | Legacy | Slow, dramatic | Hero transitions, onboarding [^10^] |
| `duration: 0.25, bounce: 0.05` | Modern iOS 17+ | Snappy preset | Fast feedback, toggle switches [^286^] |
| `duration: 0.5, bounce: 0` | Modern iOS 17+ | Smooth preset | Soft UI transitions, no overshoot [^286^] |
| `duration: 0.5, bounce: 0.2` | Modern iOS 17+ | Bouncy preset | Playful UI, visible overshoot [^286^] |
| `duration: 0.32, bounce: 0.15` | Modern iOS 17+ | Lively personality | Apple Music-style energetic feel [^11^] |

Web implementations **SHOULD** expose the modern duration/bounce interface to designers while using the conversion formulas above to derive physics parameters for animation engines. The legacy response/dampingFraction model **MUST** remain available for backward compatibility and for fine-tuning scenarios where the two-parameter model lacks sufficient control.

#### 8.1.3 CSS cubic-bezier and spring-easing equivalents

Native CSS cannot yet express true spring physics — the `spring()` timing function remains a proposal [^331^] — so web implementations must approximate. Three techniques exist, in order of fidelity:

**Cubic-bezier approximations** work in all modern browsers and capture the general feel of underdamped springs through overshoot (y-values > 1 or < 0). The smooth preset maps to `cubic-bezier(0.25, 0.1, 0.25, 1.0)` (effectively ease-out), snappy to `cubic-bezier(0.34, 1.56, 0.64, 1)`, and bouncy to `cubic-bezier(0.68, -0.6, 0.32, 1.6)`. These lack velocity preservation and true physics simulation but are adequate for simple transitions [^325^].

**CSS `linear()`** (Safari 17.2+, Chrome 113+, Firefox 112+) enables significantly more accurate spring approximation by defining a piecewise-linear curve from sampled spring output values [^317^]. The `generateLinearSpring()` utility in Section 8.1.4 produces these curves from mass/stiffness/damping inputs.

**JavaScript spring libraries** (Framer Motion, Motion.dev, React Spring) provide full physics simulation with velocity preservation, gesture integration, and interruptible transitions [^334^] [^337^]. These **SHOULD** be used for any gesture-driven or interruptible animation; CSS approximations are acceptable for static transitions.

```css
/* =============================================
   SPRING TOKEN SYSTEM — Liquid Glass Web
   ============================================= */

/* Timing Curves (Easing) */
--ease-linear: linear;
--ease-in: cubic-bezier(0.42, 0, 1.0, 1.0);
--ease-out: cubic-bezier(0, 0, 0.58, 1.0);
--ease-in-out: cubic-bezier(0.42, 0, 0.58, 1.0);

/* Spring Approximations (cubic-bezier) */
--spring-smooth: cubic-bezier(0.25, 0.1, 0.25, 1.0);
--spring-snappy: cubic-bezier(0.34, 1.56, 0.64, 1);
--spring-bouncy: cubic-bezier(0.68, -0.6, 0.32, 1.6);

/* Duration Scale */
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-medium: 400ms;
--duration-slow: 550ms;
--duration-dramatic: 900ms;
```

```javascript
/**
 * Convert Apple-style duration/bounce to mass/stiffness/damping
 * Based on WWDC 2023 corrected formulas [^308^] [^316^]
 */
function springToPhysics(duration, bounce) {
  const mass = 1;
  const stiffness = Math.pow((2 * Math.PI) / duration, 2);
  const damping = bounce >= 0
    ? ((1 - bounce) * 4 * Math.PI) / duration
    : (4 * Math.PI) / (duration * (1 + bounce));
  return { mass, stiffness, damping };
}

/**
 * Generate CSS linear() spring approximation
 * Requires Safari 17.2+, Chrome 113+, Firefox 112+ [^317^]
 */
function generateLinearSpring({ stiffness = 180, damping = 12, mass = 1, samples = 60 } = {}) {
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const omegaD = omega * Math.sqrt(1 - zeta ** 2);
  const zetaFac = zeta / Math.sqrt(1 - zeta ** 2);

  let settleT = 1;
  for (let t = 0.05; t < 10; t += 0.01) {
    const x = 1 - Math.exp(-zeta * omega * t) * (
      Math.cos(omegaD * t) + zetaFac * Math.sin(omegaD * t)
    );
    if (Math.abs(x - 1) < 0.002) { settleT = t; break; }
  }

  const points = Array.from({ length: samples + 1 }, (_, i) => {
    const t = (i / samples) * settleT;
    const x = 1 - Math.exp(-zeta * omega * t) * (
      Math.cos(omegaD * t) + zetaFac * Math.sin(omegaD * t)
    );
    return +x.toFixed(4);
  });

  return {
    easing: `linear(${points.join(', ')})`,
    durationMs: Math.round(settleT * 1000),
  };
}
```

### 8.2 Timing Curves by Context

Since iOS 17, SwiftUI's default animation is a smooth spring — Apple explicitly replaced `easeInOut` with spring physics because springs "give your UI an organic feel by preserving velocity and naturally coming to rest" [^291^]. SwiftUI provides three built-in spring presets: **smooth** (critically damped, no overshoot), **snappy** (slightly underdamped, small overshoot), and **bouncy** (more underdamped, visible oscillation) [^286^]. Web implementations **MUST** map these presets to equivalent timing functions and use them consistently across context categories.

#### 8.2.1 .snappy(duration: 0.25) — fast, clean, modern iOS feel

The snappy preset produces a fast, responsive animation with a small amount of overshoot that signals physicality without feeling playful. At `duration: 0.25`, it matches the quick-feedback range identified for button presses and toggle interactions [^11^]. This curve **SHOULD** be used for: button press feedback (scale down), toggle switches, checkboxes, radio selections, tab changes, and any micro-interaction where the user expects immediate response. The snappy preset converts to `spring(response: 0.25, dampingFraction: ~0.82)` in the legacy model.

#### 8.2.2 .smooth(duration: 0.35) — soft UI transitions

The smooth preset is a critically damped spring with zero bounce — the damping force is exactly strong enough to prevent any overshoot [^286^]. At `duration: 0.35`, it produces soft, fluid transitions that feel natural without drawing attention to themselves. This curve **SHOULD** be used for: navigation transitions, panel expansions, content reveals, and any state change where the motion should support the transition without becoming a focal point. The smooth preset is the iOS 17+ default for bare `withAnimation` calls [^291^].

#### 8.2.3 .spring(response: 0.32, dampingFraction: 0.72) — lively, Apple Music feel

This configuration creates a more energetic, personality-rich animation with noticeable bounce and quicker response than the default [^11^]. The lower damping fraction (0.72 vs. 0.825) increases overshoot, while the shorter response (0.32 vs. 0.55) accelerates the initial movement. This curve **SHOULD** be used sparingly for: hero transitions, featured content reveals, promotional UI, and moments where the interface should feel alive and expressive. Overuse of bouncy springs produces a juvenile, disorienting interface — reserve this character for high-impact moments.

**Table 2: Timing Curves by Context**

| Context | SwiftUI Preset | Legacy Equivalent | CSS cubic-bezier | Duration | Bounce |
|---|---|---|---|---|---|
| Button press, toggle | `.snappy(duration: 0.25)` | `spring(response: 0.25, dampingFraction: 0.82)` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 0.25s | 0.05 |
| Standard UI transition | `.smooth(duration: 0.35)` | `spring(response: 0.35, dampingFraction: 1.0)` | `cubic-bezier(0.25, 0.1, 0.25, 1.0)` | 0.35s | 0 |
| Navigation push/pop | `.snappy(duration: 0.3)` | `spring(response: 0.3, dampingFraction: 0.85)` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 0.3s | 0.03 |
| Modal/sheet | `.smooth(duration: 0.4)` | `spring(response: 0.4, dampingFraction: 0.9)` | `cubic-bezier(0.25, 0.1, 0.25, 1.0)` | 0.4s | 0 |
| Lively/energetic UI | `.spring(response: 0.32, dampingFraction: 0.72)` | — | `cubic-bezier(0.68, -0.6, 0.32, 1.6)` | 0.32s | 0.15 |
| Bottom sheet snap | `.snappy(duration: 0.4)` | `spring(response: 0.4, dampingFraction: 0.85)` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 0.4s | 0.1 |
| Hero transition | `.bouncy(duration: 0.5)` | `spring(response: 0.5, dampingFraction: 0.72)` | `cubic-bezier(0.68, -0.6, 0.32, 1.6)` | 0.5s | 0.15 |
| Color crossfade | `easeInOut` | — | `cubic-bezier(0.42, 0, 0.58, 1.0)` | 0.6s | N/A |

The default UIView animation duration of 0.2 seconds [^309^] predates the spring system and **SHOULD NOT** be used as a reference for Liquid Glass implementations — the spring model makes duration an emergent property of physics rather than a fixed constant. Navigation push/pop transitions historically use approximately 0.3s [^332^], which aligns well with the snappy preset. Color crossfades remain the exception: HSL-interpolated color transitions at 600ms with `ease-in-out` produce perceptually smooth hue shifts that spring physics cannot improve upon.

### 8.3 Liquid Glass Specific Animations

Unlike previous materials where animation was applied externally, Liquid Glass was designed with motion as a core property from its foundation — "both the visuals AND motion of Liquid Glass were designed as one" [^79^]. Three animation types are intrinsic to the material.

#### 8.3.1 Materialization: elements appear by modulating light bending, not fading

Liquid Glass objects materialize in and out by gradually modulating the light bending and lensing properties of the material, not by fading opacity [^79^]. This preserves the optical integrity of the glass — a physical object does not become transparent when it appears; it comes into focus. On the web, this **MUST** be approximated through a combination of `backdrop-filter` modulation (blur and saturation), subtle scale transformation, and opacity as a secondary channel. The keyframes below demonstrate the materialization pattern: the element begins heavily blurred and desaturated, then resolves to its final glass state as the light-bending effect intensifies.

```css
/* Liquid Glass materialization — light-bending modulation, not fade */
.glass-materialize {
  animation: materialize 0.5s var(--ease-out) forwards;
}
@keyframes materialize {
  from {
    opacity: 0;
    filter: blur(12px) saturate(0.5);
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    filter: blur(0) saturate(1);
    transform: scale(1);
  }
}
```

The animation duration for materialization **SHOULD** be 400–550ms — longer than standard transitions because the optical effect involves multiple simultaneous property changes (blur radius, saturation, scale, and backdrop-filter intensity). The easing **SHOULD** be ease-out so the material "snaps into focus" quickly at the end.

#### 8.3.2 Morphing: dynamic transformation between control states via glassEffectID

Liquid Glass dynamically morphs between control states, maintaining the concept of a singular floating plane that controls live on [^79^]. When a button transforms into a menu, the glass surface does not disappear and reappear — it pops open, reshaping itself to contain the new content while preserving material continuity. The `glassEffectID()` API associates related glass elements, enabling the system to interpolate between them seamlessly [^31^]. The `GlassEffectContainer` type provides a `spacing` parameter that controls the morphing threshold — elements within the specified distance (commonly 40 points) visually blend and morph together during transitions [^16^].

Web implementations **SHOULD** implement morphing through FLIP (First, Last, Invert, Play) techniques or shared-element transition APIs, animating `border-radius`, `width`, `height`, `backdrop-filter`, and `box-shadow` simultaneously. The transition **MUST** use the smooth spring preset to maintain the fluid, plane-like quality.

```css
/* Liquid Glass morph transition */
.glass-morph {
  transition:
    border-radius 0.5s var(--spring-smooth),
    background-color 0.6s var(--ease-in-out),
    backdrop-filter 0.4s var(--ease-out),
    box-shadow 0.3s var(--ease-out),
    transform 0.5s var(--spring-smooth);
}
```

#### 8.3.3 Crossfade color transitions: 600ms HSL-interpolated

Color transitions within Liquid Glass elements — such as background tint shifts when moving between light and dark content areas — **MUST** use 600ms HSL-interpolated crossfades. This duration, carried forward from the existing protocol, is longer than standard UI transitions because color perception requires more time for the visual system to adapt. HSL interpolation (as opposed to RGB) preserves perceptual hue relationships and prevents the muddy gray intermediate states that RGB blending produces during crossfades. The easing **SHOULD** be `ease-in-out` for color transitions to create symmetric, smooth shifts without abrupt starts or stops.

**Table 3: Liquid Glass Animation Types**

| Animation Type | Mechanism | Duration | Easing | Properties Animated |
|---|---|---|---|---|
| Materialization | Light-bending modulation | 400–550ms | ease-out | `blur`, `saturate`, `scale`, `opacity` [^79^] |
| Morphing | Dynamic shape transformation | 400–600ms | spring-smooth | `border-radius`, `size`, `backdrop-filter`, `shadow` [^31^] |
| Crossfade color | HSL-interpolated shift | 600ms | ease-in-out | `background-color`, `tint` |
| Touch response | Gel-like flexion | 150–200ms | ease-out | `transform` (scale, translate), `brightness` [^79^] |
| Staggered entrance | Sequential materialization | 400ms + 60ms stagger | spring-snappy | `opacity`, `translateY`, `blur` |

### 8.4 Interruptible Transitions & Gestures

#### 8.4.1 Springs preserve velocity when retargeted — gesture-driven animations

A defining characteristic of spring animations is velocity preservation: when a spring animation is interrupted mid-flight and retargeted to a new value, it uses its current velocity as the initial velocity toward the new destination [^308^]. This behavior is what makes spring-driven interfaces feel "liquid" — there is no jarring stop and restart, only a smooth redirection of existing momentum. `UIViewPropertyAnimator` (iOS 10+) formalized this with interruptible, reversible, scrubbable animations [^298^], and iOS 8's additive animation model (where new animations are added to existing ones rather than replacing them) laid the groundwork by smoothing velocity changes during overlap [^298^].

SwiftUI now automatically tracks velocities any time a gesture changes properties, providing natural spring feel without explicit velocity measurement [^308^]. The `interactiveSpring` preset — `response: 0.15, dampingFraction: 0.86` — is optimized specifically for gesture-driven interactions where the user's finger velocity should directly influence the animation's initial velocity [^293^]. Bottom sheet implementations, for example, combine `DragGesture` with spring animation to produce natural snap behavior [^306^].

Web implementations **MUST** use a JavaScript spring library (not CSS transitions) for any gesture-driven animation where velocity preservation matters. CSS `transition` cannot access gesture velocity and cannot retarget mid-flight while preserving momentum — it can only replace the existing transition, producing a discontinuity. Framer Motion and Motion.dev both implement Apple's duration/bounce mental model and support gesture velocity as spring input [^334^] [^337^].

```javascript
/**
 * Apple spring preset configurations for web animation libraries
 */
const SPRING_PRESETS = {
  smooth:   { duration: 0.5,  bounce: 0,    label: 'No bounce, fluid' },
  snappy:   { duration: 0.25, bounce: 0.05, label: 'Small bounce, responsive' },
  bouncy:   { duration: 0.5,  bounce: 0.2,  label: 'Visible bounce, playful' },
  gesture:  { duration: 0.15, bounce: 0,    label: 'Gesture-driven, instant' },
  sheet:    { duration: 0.4,  bounce: 0.1,  label: 'Bottom sheet snap' },
  modal:    { duration: 0.55, bounce: 0,    label: 'Modal presentation' },
  hero:     { duration: 0.5,  bounce: 0.15, label: 'Hero transition' },
};

/**
 * Reduced motion helper — MUST be checked before every animation [^326^]
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function withMotionSupport(activeConfig, reducedConfig = { duration: 0 }) {
  return prefersReducedMotion() ? reducedConfig : activeConfig;
}
```

#### 8.4.2 prefers-reduced-motion: instant snap to end-state, no interpolation frames

Apple's Human Interface Guidelines state unequivocally: "Make motion optional. Not everyone can or wants to experience the motion in your app or game, so it's essential to avoid using it as the only way to communicate important information" [^310^]. SwiftUI exposes this preference through `@Environment(\.accessibilityReduceMotion)` [^326^], and web implementations **MUST** check `prefers-reduced-motion: reduce` before initiating any animation.

When reduced motion is enabled, duration-based animations **MUST** snap instantly to their end state with no interpolation frames [^321^]. Apple's system-level Reduce Motion replaces zoom and slide transitions with dissolve and cross-fade effects [^324^], which provides a model for web implementations: instead of removing the element entirely (which could be confusing), instantly set it to its final visual state. The CSS media query below handles the global case, but JavaScript-initiated animations **MUST** also check the preference programmatically.

```css
/* ---- Reduced Motion Support ---- */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .glass-materialize {
    animation: none;
    opacity: 1;
    filter: none;
    transform: none;
  }

  .glass-morph {
    transition: none;
  }
}
```

The blanket `0.01ms` override is the correct approach — it forces all CSS animations and transitions to complete in a single frame, effectively producing an instant snap without requiring per-component modifications. JavaScript spring libraries **MUST** receive `{ duration: 0 }` or an equivalent instant-complete configuration when reduced motion is active. Importantly, motion **MUST NOT** be the sole channel for communicating critical information — any state change conveyed through animation must also be conveyed through static visual cues (color change, icon update, text notification) so that users with motion sensitivity receive the same information [^310^].

---

## 9. Stage G — Component Library

The Liquid Glass component library redefines every interactive control through a unified material language. Buttons, switches, sliders, and navigation elements that previously had independent styling rules now share a coherent family of physical behaviors: glass droplet thumbs that deform on touch, capsule geometries scaling across five control sizes, and spring-physics transitions that materialize surfaces from their originating controls. This section specifies implementation parameters for each component class with platform-conditional rules. All specifications derive from the observation that control thumbs — the draggable knobs on switches, sliders, and segmented controls — share a single morphological grammar: they transform into clear glass droplets during interaction and settle back to opaque idle states when released [^96^].

### 9.1 Buttons

#### 9.1.1 Two Foundation Styles: .glass and .glassProminent

Liquid Glass introduces two button styles that form the complete action hierarchy. The `.glass` style produces a translucent, see-through surface for secondary actions and cancellation flows. The `.glassProminent` style produces an opaque surface tinted with the application accent color, reserved for primary confirmations and destructive operations requiring elevated attention [^96^]. In UIKit, these map to `UIButton.Configuration.glass()` and `.prominentGlass()`; `.clearGlass()` and `.prominentClearGlass()` provide additional transparency grades for contexts where standard glass backgrounds create legibility conflicts [^416^]. Implementations **MUST** use `.glassProminent` exclusively for the single primary action within any view hierarchy — multiple prominent buttons in close proximity dilute hierarchy and violate the Layer Separation Principle (Section 2.1).

Tint application differs materially between the two styles. Applied to `.glass`, color manifests only at the border and edge highlights, preserving the translucent body. Applied to `.glassProminent`, the tint floods the entire button surface, producing a vibrant filled appearance [^344^]. This differential tinting enables rapid visual scanning: users perceive full-tint buttons as primary and edge-tint buttons as secondary without reading labels.

The `.interactive()` modifier — iOS only — extends glass buttons with touch-responsive behaviors: scaling on press, bouncing animation on release, shimmering light effects, and touch-point illumination radiating to nearby glass elements within the same `GlassEffectContainer` [^34^]. When multiple glass controls share a container, this illumination creates the perception that all buttons originate from a single liquid source [^233^]. Web implementations **SHOULD** simulate this through `:active` scale transforms and CSS custom property propagation for radial illumination gradients.

#### 9.1.2 Five Control Sizes with Platform-Conditional Shapes

Liquid Glass defines five control sizes with precise height tokens and shape rules spanning from Mini at ~20pt to X-Large at 56pt+ [^314^].

| Control Size | Token | Height (iOS) | Height (macOS) | Shape (iOS/iPadOS) | Shape (macOS) | Use Case |
|-------------|-------|-------------|----------------|-------------------|---------------|----------|
| Mini | `--control-mini` | ~20pt | ~20pt | Rounded rect (6px) | Rounded rect (6px) | Inline toggles, compact toolbars |
| Small | `--control-small` | ~28pt | ~26pt | Rounded rect (8px) | Rounded rect (8px) | Secondary actions, form controls |
| Regular | `--control-medium` | ~32pt | ~30pt | Capsule | Rounded rect (8px) | Default button, standard actions |
| Large | `--control-large` | ~44pt | — | Capsule | Capsule | Primary CTAs, confirmation buttons |
| X-Large | `--control-xl` | ~56pt+ | — | Capsule | Capsule | Hero actions, spacious layouts |

The shape divergence between platforms is intentional. iOS and iPadOS use capsules for Regular, Large, and X-Large because curved geometry harmonizes with rounded hardware corners and fluid touch gestures. macOS retains rounded rectangles for Mini, Small, and Medium to preserve horizontal density in complex desktop layouts; only at Large and X-Large does macOS adopt the capsule [^1^] [^314^]. Web implementations **MUST** default to iOS shape rules for mobile viewports and macOS shape rules for desktop viewports above 1024px. The `.buttonBorderShape(.automatic)` API delegates this platform detection to the system [^314^].

#### 9.1.3 CSS Implementation — Button Foundation

```css
/* Liquid Glass Button Foundation */
.btn-glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  padding: 10px 20px;
  color: inherit;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.6, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-glass-prominent {
  background: var(--tint-color, rgba(0, 122, 255, 0.7));
  backdrop-filter: blur(20px) saturate(180%);
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
}

/* Size variants */
.btn-mini    { height: 20px; font-size: 11px; padding: 2px 8px;  border-radius: 6px; }
.btn-small   { height: 28px; font-size: 12px; padding: 4px 12px; border-radius: 8px; }
.btn-regular { height: 32px; font-size: 15px; padding: 6px 16px; border-radius: 9999px; }
.btn-large   { height: 44px; font-size: 17px; padding: 10px 20px; border-radius: 9999px; }
.btn-xlarge  { height: 56px; font-size: 20px; padding: 14px 28px; border-radius: 9999px; }

.btn-glass-interactive:active {
  transform: scale(1.04);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
}

@media (min-width: 1024px) {
  .btn-macos.btn-mini,
  .btn-macos.btn-small,
  .btn-macos.btn-regular { border-radius: 8px; }
}
```

The `backdrop-filter` declaration **MUST** include the `-webkit-` vendor prefix for Safari. The `0.5px` border produces the hairline highlight separating glass from its background without the visual weight of a 1px stroke. `overflow: hidden` clips shimmer and illumination effects to the button boundary.

### 9.2 Switches, Sliders & Pickers

#### 9.2.1 Switch: Glass Droplet Thumb Transformation

The UISwitch thumb maintains an opaque appearance at idle and transforms into a clear glass droplet — enlarged and refractive — on touch, contracting back to opaque on release [^352^]. This transformation communicates active manipulation without requiring instructional text. The standard switch dimensions remain approximately 51pt × 31pt with a slight size increase in iOS 26 that layouts **MUST** accommodate in constraints [^96^]. The track adopts translucent glass with the filled portion rendering in the application tint color. No explicit API call enables Liquid Glass on UISwitch — the effect is automatic when targeting iOS 26.

#### 9.2.2 Slider: Elastic Stretch, Momentum Preservation, and Tick Marks

Sliders integrate three physical behaviors: liquid glass thumb styling, elastic stretch deformation during drag, and momentum preservation carrying the thumb forward after release [^96^]. The thumb follows the same glass droplet transformation as switches but adds elastic deformation: the track stretches along the drag axis when pulled, then springs back with velocity-proportional damping. The `TrackConfiguration` API supports tick marks at specified intervals, a neutral value defining where the filled track begins (useful for bidirectional controls), and a thumbless style rendering the slider as a progress bar without the draggable knob — **SHOULD** be used for media playback where the thumb would distract [^96^].

| Component | Thumb (Idle) | Thumb (Active) | Track (Filled) | Track (Unfilled) | Special Behaviors |
|-----------|-------------|---------------|----------------|-----------------|-------------------|
| Switch | Opaque, standard | Clear glass droplet, enlarged | Tint color | Translucent dimmed | Auto-morph on touch/release |
| Slider | Opaque, standard | Clear glass droplet, elastic stretch | Tint with refraction | Translucent dimmed | Momentum preservation, tick marks, neutral value, thumbless mode |
| Segmented | Standard opaque | Clear glass, deforms during swipe | Selected segment fill | Translucent background | Drag gesture to switch segments |
| Picker (Wheel) | — | Liquid Glass on selected row | — | — | 7 style variants, glass droplet on selected row |

The elastic stretch behavior **MUST NOT** use CSS transitions alone — velocity-sensitive spring physics require JavaScript-based spring simulation. The Web Animations API with a custom spring timing function provides the closest native approximation. Spring parameters **SHOULD** match the system configuration defined in Section 6.3 for behavioral consistency across the component family.

#### 9.2.3 Picker: Seven Style Variants

Pickers adopt Liquid Glass through interaction-time materialization. Seven styles cover the full selection interface pattern range:

| Style | SwiftUI API | Platform | Liquid Glass Behavior |
|-------|------------|----------|----------------------|
| Wheel | `.pickerStyle(.wheel)` | iOS (default) | Glass droplet on selected row during scroll |
| Menu | `.pickerStyle(.menu)` | All | Glass background on dropdown presentation |
| Segmented | `.pickerStyle(.segmented)` | iOS/macOS | Glass thumb transforms during segment swipe |
| Inline | `.pickerStyle(.inline)` | All | Inline glass styling on selected value |
| Navigation Link | `.pickerStyle(.navigationLink)` | iOS | Glass background on pushed selection list |
| Palette | `.pickerStyle(.palette)` | All | Row of compact glass elements |
| Radio Group | `.pickerStyle(.radioGroup)` | macOS | Glass selection indicators |

The segmented control thumb transforms into Liquid Glass during swipe interactions, deforming elastically as it moves between segments [^96^]. This unifies it with switches and sliders under the same thumb-transformation grammar. Usage **SHOULD** be limited to 2–5 options; exceeding five segments reduces tappability and **SHOULD** trigger fallback to wheel or menu style [^258^].

Menus adopting Liquid Glass use slightly higher opacity than standard glass surfaces to ensure readability over blurred content. Menu items for common actions **MUST** use SF Symbols on the leading edge for rapid visual scanning [^258^].

### 9.3 Navigation Bars, Tab Bars & Search

#### 9.3.1 Tab Bars: Capsule-Shaped, Floating, and Scroll-Responsive

Tab bars transition from legacy blur material to transparent Liquid Glass, float above content with adaptive shadows (stronger over text, lighter over white), and introduce minimize-on-scroll behavior via `.tabBarMinimizeBehavior()` [^258^]. This modifier accepts `.onScrollDown`, `.onScrollUp`, or `.never`. When minimized, the tab bar collapses to a compact capsule indicator; it expands on opposite-direction scroll or tap. The bottom accessory API (`.tabViewBottomAccessory()`) places supplementary content above the tab bar, which blends into the bar when collapsed — this blending is automatic and **MUST NOT** be overridden, as it embodies the Liquid Glass principle that navigation chrome recedes as a single unit when content demands attention [^370^].

| Tab Bar Property | Specification | API / Token |
|-----------------|---------------|-------------|
| Background material | Transparent Liquid Glass | System default — no custom override |
| Shadow behavior | Adaptive (strong over text, weak over white) | `--shadow-glass-adaptive` |
| Minimize trigger | Scroll direction (configurable) | `.tabBarMinimizeBehavior()` |
| Expand trigger | Opposite scroll or tap | Automatic |
| Search tab role | Dedicated `.search` role with `.searchable()` | `Tab(role: .search)` |
| Bottom accessory | Blends into tab bar on collapse | `.tabViewBottomAccessory()` |
| Height (expanded) | 49pt | `--tab-bar-height` |
| Height (minimized) | ~24pt capsule | System-managed |

Apple's guidance is unambiguous: developers **MUST** remove custom background customization from navigation bars and toolbars. Using `UIBarAppearance` or `backgroundColor` directly interferes with the glass appearance and produces artifacts at scroll boundaries [^96^].

#### 9.3.2 Search: Bottom Placement on iPhone, Morph Animation

On iPhone, search fields move to the bottom for thumb reachability; on iPad, they appear in a Liquid Glass container in the top trailing corner [^346^]. The search activation experience introduces a morph animation where the field expands from a circular button into a full-width search bar. The `.searchToolbarBehavior(.minimize)` modifier collapses the search field into a toolbar button when search is not the primary experience [^346^]. When combined with the `.search` tab role, selecting the search tab automatically activates the field and presents the keyboard [^370^].

#### 9.3.3 Toolbar Grouping: Automatic Glass Background Sharing

Toolbar items organize into visual groups sharing glass backgrounds based on deterministic type rules: adjacent image buttons share a unified glass background; text buttons ("Done", "Close"), prominent-style buttons, and cancellation/confirmation actions each receive separate individual backgrounds [^258^]. This grouping creates functional clusters — two image buttons sharing a background are perceived as related tools, while a separate text button signals a discrete action.

```javascript
// Toolbar grouping logic for web component libraries
function groupToolbarItems(items) {
  const groups = [];
  let currentGroup = [];

  for (const item of items) {
    if (item.type === 'spacer') {
      if (currentGroup.length > 0) { groups.push(currentGroup); currentGroup = []; }
      continue;
    }
    if (item.type === 'text' || item.style === 'prominent'
        || item.role === 'cancellation' || item.role === 'confirmation') {
      if (currentGroup.length > 0) { groups.push(currentGroup); currentGroup = []; }
      groups.push([item]);
    } else if (item.type === 'image') {
      currentGroup.push(item);
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);
  return groups;
}

// Confirmation actions automatically get prominent styling
.toolbar-item-confirmation {
  background: var(--tint-color, rgba(0, 122, 255, 0.7));
  border: none;
}
```

A `ToolbarSpacer` (fixed or flexible) separates groups, breaking the shared background at the spacer boundary. The `.sharedBackgroundVisibility(.hidden)` modifier enables individual items to opt out of group backgrounds [^258^]. Scroll views beneath navigation bars automatically receive edge effects — soft blur treatments ensuring legibility of content overlapping transparent glass [^96^]. The `.soft` style (default) applies gradual blur fade; `.hard` produces a sharp cutoff. Custom containers register for edge effects via `ScrollEdgeElementContainerInteraction` [^96^].

### 9.4 Sheets, Alerts & Text Input

#### 9.4.1 Sheets: Liquid Glass Background, Inset Edges, Concentric Corners

Partial-height sheets are redesigned as floating panels with three defining properties: Liquid Glass background by default, edges inset from display boundaries creating a visible gap, and corner radius concentric with device hardware — the sheet's corners share a common center with the device's physical corners [^374^]. When dragged to full height, the background transitions from Liquid Glass to opaque, signaling the modal shift from temporary overlay to immersive view [^374^].

| Sheet Property | Partial Height (Medium/Custom) | Full Height (Large) |
|---------------|-------------------------------|---------------------|
| Background material | Liquid Glass (translucent) | Opaque (solid) |
| Edge inset | Inset from display edges | Edge-to-edge |
| Corner radius | Concentric with device hardware | Concentric with device hardware |
| Presentation transition | Morph from source button | Standard slide-up |
| Scroll content background | Hidden for glass appearance | System default |

The morphing transition via `matchedTransitionSource()` paired with `.navigationTransition(.zoom)` creates fluid continuity where the sheet grows from the toolbar button triggering it [^374^]. When presenting sheets containing `Form` or `List`, `.scrollContentBackground(.hidden)` **MUST** be applied to prevent the form's opaque background from obscuring the Liquid Glass material [^374^]. Action sheets on iPhone now anchor to their source view — matching iPad behavior — rather than always presenting at screen bottom [^96^].

#### 9.4.2 Alerts: In-Place Expansion from Trigger Button

Alerts shift from center-screen modal presentation to in-place expansion, springing directly from the initiating button with a spring animation that makes confirmations, deletions, and actions quicker to reach [^18^]. The alert background uses Liquid Glass material with spring physics parameters matching the control family (Section 6.3). All action buttons **MUST** maintain a minimum 44pt touch target. Dismissal occurs through explicit button tap or tap on the translucent scrim outside alert bounds. On iPad, alerts continue as popovers anchored to their source control; iPhone now mirrors this pattern [^96^].

#### 9.4.3 Text Fields: Liquid Glass Magnifier Loupe and Expanded Context Menus

The text cursor's magnifier loupe — appearing on press-and-hold to position the insertion point — is constructed from Liquid Glass material magnifying underlying text at approximately 1.5x. When dragged, the loupe deforms like a water droplet, stretching along the drag axis with fluid, gel-like response [^349^]. This simulates surface tension: the droplet elongates in the direction of motion and rebounds when movement stops [^18^].

The text editing context menu expands into a vertical scannable list in iOS 26, replacing the traditional horizontal bar [^18^]. Items stack with leading-edge SF Symbols for rapid identification. Standard actions (cut, copy, paste, bold, italic) **MUST** use system-standard symbols to leverage cross-application muscle memory [^258^].

```css
/* Text input glass effects */
.text-loupe {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px) saturate(150%);
  border-radius: 50%;
  width: 64px; height: 64px;
  transform: scaleX(var(--loupe-scale-x, 1)) scaleY(var(--loupe-scale-y, 1));
  transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.context-menu-glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 16px;
  border: 0.5px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  min-width: 200px;
  overflow: hidden;
}

.context-menu-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.context-menu-item:active { background: rgba(255, 255, 255, 0.15); }
```

The `--loupe-scale-x` and `--loupe-scale-y` custom properties **MUST** be updated via JavaScript based on drag velocity. Below 100px/s, both values default to 1.0 (circular). Between 100–400px/s, the loupe stretches to `scaleX(1.15)` and `scaleY(0.92)`. Above 400px/s, maximum deformation reaches `scaleX(1.3)` and `scaleY(0.85)`. These thresholds approximate observed system behavior and **SHOULD** be tuned through user testing. The on-screen keyboard maintains an opaque background — it does not adopt Liquid Glass — preserving typing accuracy through consistent key-to-label contrast.

---

## 10. Stage H — SF Symbols & Iconography

### 10.1 The Symbol System

Apple's SF Symbols library has expanded from 1,500 icons in its 2019 debut to over 6,900 symbols in version 7 (2025), with each annual release introducing transformative capabilities that progressively transform static icons into programmable, animation-ready visual media [^356^]. This seven-year evolution establishes SF Symbols as the visual vocabulary of the Liquid Glass interface — a system where navigation controls communicate through universal iconography rather than localized text labels, reducing linguistic cognitive load and enabling faster parse times across language barriers.

The system defines nine weights — ultralight through black — each corresponding directly to a San Francisco font weight [^360^]. This mapping ensures companion symbols adapt automatically when adjacent text changes weight via Dynamic Type or accessibility settings, preserving optical harmony without developer intervention. Each weight MUST map to its CSS `font-weight` equivalent per Table 10.1.

Three scales — Small (~80% of Medium), Medium (default), and Large (~130% of Medium) — provide size variation relative to San Francisco's cap height [^387^]. The system applies weight compensation across scales to maintain consistent perceived stroke thickness, and all three scales align vertically with text of the same point size for inline placement.

Nine weights multiplied by three scales yields 27 base variations per symbol. Custom symbols require only three source weights — Ultralight-Small, Regular-Small, and Black-Small — with the system interpolating all intermediates automatically, subject to path and point compatibility verified through the SF Symbols app [^379^].

| SF Symbol Weight | CSS `font-weight` | Relative Scale Small | Relative Scale Medium | Relative Scale Large | Use Context |
|---|---|---|---|---|---|
| Ultralight | 100 | 0.80em | 1.00em (17px) | 1.30em | Delicate inline, captions |
| Thin | 200 | 0.80em | 1.00em | 1.30em | Subtle indicators |
| Light | 300 | 0.80em | 1.00em | 1.30em | Body text pairing |
| Regular | 400 | 0.80em | 1.00em | 1.30em | Default toolbar, lists |
| Medium | 500 | 0.80em | 1.00em | 1.30em | Emphasized labels |
| Semibold | 600 | 0.80em | 1.00em | 1.30em | Navigation bar items |
| Bold | 700 | 0.80em | 1.00em | 1.30em | Prominent actions |
| Heavy | 800 | 0.80em | 1.00em | 1.30em | Tab bar selected |
| Black | 900 | 0.80em | 1.00em | 1.30em | Maximum emphasis |

**Table 10.1** — SF Symbol weight and scale specification with CSS equivalents. Medium scale at Regular weight is the system default (17px). Weight compensation is applied automatically by the rendering system to maintain consistent stroke thickness across scales [^360^] [^387^].

The CSS implementation MUST establish a tokenized symbol system that exposes weight, scale, and rendering mode as CSS custom properties. Because SF Symbols are delivered as variable-font-based SVG, web implementations should reference an SVG symbol library with these tokens driving presentation:

```css
:root {
  /* Weight tokens: 100–900 mapping */
  --symbol-weight-ultralight: 100;
  --symbol-weight-thin:       200;
  --symbol-weight-light:      300;
  --symbol-weight-regular:    400;
  --symbol-weight-medium:     500;
  --symbol-weight-semibold:   600;
  --symbol-weight-bold:       700;
  --symbol-weight-heavy:      800;
  --symbol-weight-black:      900;

  /* Scale tokens: relative to base em */
  --symbol-scale-small:  0.80em;
  --symbol-scale-medium: 1.00em;
  --symbol-scale-large:  1.30em;

  /* Base size at body pairing */
  --symbol-size-base: 17px;
  --symbol-size-xs:   12px;
  --symbol-size-sm:   15px;
  --symbol-size-md:   var(--symbol-size-base);
  --symbol-size-lg:   21px;
  --symbol-size-xl:   28px;
  --symbol-size-2xl:  34px;

  /* Default: Regular weight, Medium scale */
  --symbol-weight: var(--symbol-weight-regular);
  --symbol-scale:  var(--symbol-scale-medium);
}

/* Symbol element base */
.sf-symbol {
  display: inline-block;
  width:  var(--symbol-size-md);
  height: var(--symbol-size-md);
  font-weight: var(--symbol-weight);
  /* Scale applied via font-size on parent or SVG viewBox */
}

.sf-symbol[data-scale="small"]  { --symbol-scale: var(--symbol-scale-small); }
.sf-symbol[data-scale="medium"] { --symbol-scale: var(--symbol-scale-medium); }
.sf-symbol[data-scale="large"]  { --symbol-scale: var(--symbol-scale-large); }
```

### 10.2 Rendering Modes

SF Symbols organizes every icon's paths into distinct hierarchical layers — primary, secondary, and tertiary — enabling four core rendering modes that control color application per layer [^360^]. The `cloud.sun.rain.fill` symbol demonstrates this: cloud (primary), sun and rays (secondary), raindrops (tertiary) [^360^].

**Monochrome** applies one color uniformly to all layers; it is the default and the right choice for toolbars and navigation. **Hierarchical** applies a single hue at varying opacity — primary at 100%, secondary at ~40–60%, tertiary at ~20–30% — creating depth through luminance [^360^]. **Palette** assigns one contrasting color per layer; when fewer colors than layers are supplied, adjacent layers share the last specified color [^360^]. **Multicolor** applies predefined intrinsic colors representing real-world appearance, but these are fixed and do not adapt to light or dark mode [^355^].

SF Symbols 4 introduced **Automatic** mode, which selects the optimal rendering mode per symbol based on an Apple-assigned preference [^389^]. This MAY be overridden when context demands. SF Symbols 7 adds **gradient rendering**, generating a smooth linear gradient from a single source color with lighting simulation across all rendering modes [^360^] [^24^]. Gradients render at any size but achieve maximum impact at larger sizes [^360^].

| Rendering Mode | Color Application | Layer Treatment | Best For | Light/Dark Adaptive |
|---|---|---|---|---|
| Monochrome | Single color, all layers | Uniform fill | Toolbars, navigation, consistency | Yes |
| Hierarchical | Single hue, varying opacity | Primary 100%, Secondary ~50%, Tertiary ~25% | Structural depth, emphasis | Yes |
| Palette | Multiple contrasting colors | One color per layer | Brand coordination, accent UI | Yes |
| Multicolor | Predefined intrinsic colors | Fixed real-world colors | Weather, objects, status | No [^355^] |
| Automatic | System-selected per symbol | Varies by symbol assignment | General use, reduced decision load | Varies |
| Gradient (v7+) | Single-source linear gradient | Gradient across all paths | Feature icons, visual polish | Yes |

**Table 10.2** — Rendering mode comparison with color behavior, layer treatment, and adaptive compatibility. Gradient rendering introduced in SF Symbols 7 works across all modes [^360^] [^24^].

The CSS implementation for rendering modes MUST layer SVG fill rules via CSS custom properties, with each mode exposing the appropriate opacity or color assignment:

```css
:root {
  /* Hierarchical mode opacity values */
  --symbol-layer-primary:   1.0;
  --symbol-layer-secondary: 0.5;
  --symbol-layer-tertiary:  0.25;
}

/* Rendering mode modifiers on symbol container */
.sf-symbol[data-render="monochrome"] .layer-primary,
.sf-symbol[data-render="monochrome"] .layer-secondary,
.sf-symbol[data-render="monochrome"] .layer-tertiary {
  fill: currentColor;
  opacity: 1;
}

.sf-symbol[data-render="hierarchical"] .layer-primary {
  fill: currentColor;
  opacity: var(--symbol-layer-primary);
}
.sf-symbol[data-render="hierarchical"] .layer-secondary {
  fill: currentColor;
  opacity: var(--symbol-layer-secondary);
}
.sf-symbol[data-render="hierarchical"] .layer-tertiary {
  fill: currentColor;
  opacity: var(--symbol-layer-tertiary);
}

/* Gradient rendering (SF Symbols 7+) */
.sf-symbol[data-render="gradient"] .symbol-paths {
  fill: url(#symbol-gradient);
}
#symbol-gradient {
  --gradient-source: var(--symbol-color, #007aff);
  stop-color: var(--gradient-source);
}
```

For palette mode, CSS MUST accept up to three color values and map them to layers. If fewer than three colors are provided, secondary and tertiary layers share the last specified color, matching Apple's behavior:

```css
/* Palette: --palette-1, --palette-2, --palette-3 */
.sf-symbol[data-render="palette"] .layer-primary {
  fill: var(--palette-1, currentColor);
}
.sf-symbol[data-render="palette"] .layer-secondary {
  fill: var(--palette-2, var(--palette-1, currentColor));
}
.sf-symbol[data-render="palette"] .layer-tertiary {
  fill: var(--palette-3, var(--palette-2, var(--palette-1, currentColor)));
}
```

### 10.3 Animations & Integration

SF Symbols 7 introduces **Draw On** and **Draw Off** animation presets that animate symbols along their defined vector paths using handwriting-inspired motion [^377^]. Three playback options control the draw behavior: **By Layer** (default) staggers the starting offset of each path for expressive reveals; **Whole Symbol** draws all layers simultaneously for immediate effects; and **Individually** completes each layer before the next begins for sequential, attention-directing animation [^377^]. The system incorporates directional intelligence — wind symbols draw left to right, Arabic characters draw right to left, and symmetrical shapes can draw outward from center — ensuring the animation respects the semantic content of the symbol [^377^].

**Variable Draw**, also introduced in SF Symbols 7, renders paths at a specific percentage over a reduced-opacity background, making it ideal for progress indicators, download status, and temperature gauges [^356^]. Variable Draw and Variable Color are mutually exclusive at render time; the implementation MUST choose between color-based or draw-based progress representation.

**Magic Replace** was introduced in SF Symbols 6 as a smart transition between related symbols where slashes draw on and off independently and badges appear or disappear without affecting the base symbol [^374^]. SF Symbols 7 enhanced this with **enclosure matching** — the system recognizes matching shapes such as circles during transitions and preserves them, enabling seamless circle-to-circle symbol changes where the enclosing shape remains static while the interior content morphs [^361^]. When combined with Draw animations, the outgoing symbol uses Draw Off while the incoming symbol uses Draw On, producing a continuous visual flow [^361^]. For unrelated symbols, the system falls back to standard Replace with configurable direction — down-up for state changes, up-up for forward progression, off-up for next-state emphasis [^374^].

The iOS 26 symbol-first navigation shift moves navigation bars to toolbars where contained icon buttons replace text labels for standardized actions — back, close/cancel, save/done — as part of the Liquid Glass design language [^426^]. Toolbars automatically receive floating glass treatment, and `.confirmationAction` gets `.glassProminent` styling [^16^]. TabView adopts a floating tab bar with symbols as primary identifiers, fill variants for selected states, and a dedicated Search tab — creating a dual-navigation model of symbols for primary navigation and search for secondary discovery [^426^].

This paradigm pairs with enclosure matching and Draw animation to create fluid navigation transitions. When a user toggles a bookmark, Magic Replace preserves the enclosing shape while the interior morphs — a heart fills, a star activates — communicating the state relationship rather than swapping static images. The combination of symbol-based navigation, Liquid Glass material treatment, and intelligent replacement animation makes icons active participants in the interface's spatial and temporal behavior.

---

## 11. Stage I — Glass Material System

The Liquid Glass material system is the optical foundation of the entire Liquid Glass platform. Introduced at WWDC 2025, it replaces the legacy blur-based scattering model with a lensing architecture that bends and concentrates light in real time [^65^]. The system is not a single effect but a family of materials organized into two distinct domains: Liquid Glass variants for the navigation layer and standard translucency materials for the content layer. Both domains participate in a shared composition architecture that defines how light, content, and structure interact across the interface.

### 11.1 Liquid Glass Variants

Liquid Glass exposes three API-level variants through the `Glass` type: `.regular`, `.clear`, and `.identity` [^16^]. Of these, only `.regular` and `.clear` are true material variants with optical output. The `.identity` variant is a conditional no-op that enables programmatic toggling. Apple explicitly states that `.regular` and `.clear` MUST NOT be mixed within the same interface context because each carries fundamentally different adaptive characteristics [^79^].

#### 11.1.1 .regular: Full Adaptivity, Medium Transparency

The `.regular` variant is the default and most versatile Liquid Glass material. It provides full adaptive behavior: the material continuously samples content behind it and adjusts shadow opacity, tint, luminosity, and light/dark mode switching in response [^16^]. When text scrolls underneath a `.regular` element, shadows increase in opacity to preserve separation and legibility [^89^]. The material independently switches between light and dark appearances based on background brightness — without requiring the system-wide appearance setting to change [^79^]. Larger elements simulate thicker glass with deeper shadows and more pronounced lensing, a behavior Apple describes as "dimensional sizing" [^79^].

By default, `.regular` renders with a capsule shape on iOS. Developers MAY override this via the `in:` parameter of `.glassEffect(_:in:isEnabled:)` [^16^]. The `.regular` variant is the correct choice for toolbars, tab bars, navigation bars, buttons, sheets, popovers, menus, and standard floating controls [^16^]. It MUST NOT be applied to content layers such as lists, cards, tables, or scrollable media — Apple reserves Liquid Glass exclusively for the navigation layer [^29^].

#### 11.1.2 .clear: High Transparency, No Adaptive Behaviors

The `.clear` variant provides permanently high transparency. Unlike `.regular`, it has NO adaptive behaviors — it does not respond to content changes, does not auto-switch light/dark mode, and does not adjust shadows based on scrolling text [^35^]. Because the content underneath is fully visible, `.clear` MUST be paired with a dimming layer to ensure foreground legibility [^79^]. Apple imposes three strict conditions for `.clear` usage, ALL of which MUST be satisfied simultaneously: (1) the element sits over media-rich content such as photos, videos, or maps; (2) the content underneath will not be negatively affected by introducing a dimming layer; and (3) the foreground content above the glass is bold and bright [^79^]. Official examples include floating controls in Maps, media player overlays, and camera app chrome [^35^]. Using `.clear` outside these constraints produces illegible text and violates the Liquid Glass specification.

#### 11.1.3 .identity: No Effect, Conditional Disable

The `.identity` variant applies no glass effect whatsoever. Its sole purpose is conditional toggling — for example, `glassEffect(isEnabled ? .regular : .identity)` [^16^]. This pattern supports accessibility feature flags, user preference overrides, and programmatic disable states without restructuring the view hierarchy. When `.identity` is active, the element renders as if no `.glassEffect()` modifier were applied at all. `.identity` MUST be used instead of conditionally removing the modifier when the view structure must remain stable across state changes.

| Property | `.regular` | `.clear` | `.identity` |
|----------|-----------|----------|-------------|
| Transparency | Medium | High (permanent) | None |
| Backdrop Blur | Yes | Minimal | No |
| Adaptive Shadows | Yes — increase over scrolling text [^89^] | No | No |
| Light/Dark Auto-Switch | Yes — independent of system [^79^] | No | N/A |
| Scroll Edge Response | Yes | No | No |
| Lensing/Refraction | Full | Minimal | None |
| Dimensional Sizing | Yes — thicker at larger sizes [^79^] | No | No |
| Dimming Layer Required | No | Yes — mandatory [^79^] | N/A |
| Tinting Support | Yes | Yes | N/A |
| Interactive Modifier | `.interactive()` (iOS only) | `.interactive()` (iOS only) | N/A |
| Use Case | Toolbars, nav bars, buttons, sheets | Media controls, maps floating buttons | Accessibility/feature-flag toggles |

**Table: Liquid Glass Variant Comparison.** `.regular` and `.clear` MUST NOT be mixed in the same interface context [^79^]. `.identity` is not a material variant but a conditional no-op. The table above guides selection: default to `.regular`, restrict `.clear` to the three-condition media-rich scenario, and reserve `.identity` for programmatic disable patterns.

### 11.2 Standard Materials (Content Layer)

While Liquid Glass occupies the navigation layer, the content layer beneath it continues to use the four standard materials introduced in iOS 13: `ultraThin`, `thin`, `regular` (default), and `thick` [^449^]. These materials form a translucency hierarchy where thickness correlates directly with opacity and text contrast.

#### 11.2.1 Four Levels of Translucency

Apple's material system encodes information hierarchy into material thickness itself. Thicker materials are more opaque, providing better text contrast and stronger separation from background content. Thinner materials are more translucent, revealing more of the context behind them and creating lighter-weight visual presence [^449^] [^5^]. This relationship — material thickness → opacity → information importance — is Insight 7 from the cross-dimensional analysis: thickness serves as the primary hierarchy signal [^Insight 7^].

The `regular` material is the default and works well in most circumstances [^449^]. When presenting content that needs additional contrast — such as body text over complex imagery — `thick` SHOULD be selected. For lighter-weight interactions with simpler content, `thin` or `ultraThin` MAY be used, though developers MUST verify text legibility against the specific background context [^449^]. The `ultraThin` material provides the most context visibility but the lowest text contrast, making it suitable only for large, high-contrast foreground elements.

#### 11.2.2 Translucency-to-Hierarchy Mapping

Material selection SHOULD follow a semantic decision path rather than visual preference. Content that demands high reading comprehension — articles, data tables, forms — MUST use `thick` or `regular`. Decorative overlays, secondary controls, and transient UI MAY use `thin` or `ultraThin`. The quaternary label vibrancy level (18% alpha) SHOULD be avoided on `thin` and `ultraThin` materials because the resulting contrast is too low for reliable legibility [^5^].

#### 11.2.3 CSS backdrop-filter Equivalents

The standard materials can be approximated on the web using `backdrop-filter` with `blur()` and `saturate()` functions. The base values derive from community-measured visual comparisons against Apple's native implementation [^494^] [^523^]. While Liquid Glass uses lensing (light bending) rather than blur, the standard materials remain blur-based and therefore map cleanly to CSS [^65^].

| Material | Translucency | Approx. CSS backdrop-filter | Light Mode Background | Dark Mode Background | Text Contrast |
|----------|-------------|----------------------------|----------------------|----------------------|---------------|
| `ultraThin` | Most translucent | `blur(30px) saturate(180%)` | `rgba(255,255,255,0.15)` | `rgba(0,0,0,0.15)` | Lowest |
| `thin` | High | `blur(24px) saturate(180%)` | `rgba(255,255,255,0.25)` | `rgba(0,0,0,0.25)` | Moderate |
| `regular` (default) | Medium | `blur(20px) saturate(180%)` | `rgba(255,255,255,0.45)` | `rgba(30,30,30,0.55)` | Good |
| `thick` | Most opaque | `blur(16px) saturate(180%)` | `rgba(255,255,255,0.65)` | `rgba(40,40,40,0.70)` | Best |

**Table: Standard Material CSS Equivalents.** These are community-measured approximations, not official Apple specifications [^494^]. The blur radius inversely correlates with material thickness: thinner materials require more blur to maintain visual cohesion, while thicker materials need less because their higher background opacity already provides separation. The `saturate(180%)` value compensates for the desaturation that Gaussian blur introduces in the sampled backdrop.

The base CSS implementation for standard materials follows this pattern:

```css
@layer materials {
  :root {
    /* Backdrop filter values by material thickness */
    --material-blur-ultra-thin: blur(30px) saturate(180%);
    --material-blur-thin: blur(24px) saturate(180%);
    --material-blur-regular: blur(20px) saturate(160%);
    --material-blur-thick: blur(16px) saturate(160%);

    /* Light mode backgrounds — opacity increases with thickness */
    --material-bg-ultra-thin-light: rgba(255, 255, 255, 0.15);
    --material-bg-thin-light: rgba(255, 255, 255, 0.25);
    --material-bg-regular-light: rgba(255, 255, 255, 0.45);
    --material-bg-thick-light: rgba(255, 255, 255, 0.65);

    /* Dark mode backgrounds */
    --material-bg-ultra-thin-dark: rgba(0, 0, 0, 0.15);
    --material-bg-thin-dark: rgba(0, 0, 0, 0.25);
    --material-bg-regular-dark: rgba(30, 30, 30, 0.55);
    --material-bg-thick-dark: rgba(40, 40, 40, 0.70);

    /* Subtle border for material edge definition */
    --material-border-light: rgba(255, 255, 255, 0.2);
    --material-border-dark: rgba(255, 255, 255, 0.1);
  }

  /* Material thickness classes */
  .material-ultra-thin {
    -webkit-backdrop-filter: var(--material-blur-ultra-thin);
    backdrop-filter: var(--material-blur-ultra-thin);
    background-color: var(--material-bg-ultra-thin-light);
  }

  .material-thin {
    -webkit-backdrop-filter: var(--material-blur-thin);
    backdrop-filter: var(--material-blur-thin);
    background-color: var(--material-bg-thin-light);
  }

  .material-regular {
    -webkit-backdrop-filter: var(--material-blur-regular);
    backdrop-filter: var(--material-blur-regular);
    background-color: var(--material-bg-regular-light);
  }

  .material-thick {
    -webkit-backdrop-filter: var(--material-blur-thick);
    backdrop-filter: var(--material-blur-thick);
    background-color: var(--material-bg-thick-light);
  }

  @media (prefers-color-scheme: dark) {
    .material-ultra-thin { background-color: var(--material-bg-ultra-thin-dark); }
    .material-thin { background-color: var(--material-bg-thin-dark); }
    .material-regular { background-color: var(--material-bg-regular-dark); }
    .material-thick { background-color: var(--material-bg-thick-dark); }
  }
}
```

The `prefers-color-scheme` media query handles automatic light/dark adaptation, matching the native behavior where materials dynamically switch appearance based on the system appearance [^449^]. Both `-webkit-backdrop-filter` and unprefixed `backdrop-filter` MUST be declared because Safari 9–17 only honors the prefixed version, while Safari 18+ and all other modern browsers accept the unprefixed property [^465^] [^471^].

### 11.3 Composition Architecture

Liquid Glass achieves its dimensional quality not through a single filter but through the coordinated interaction of multiple conceptual layers. This layered composition model is the architectural bridge between the material system and the rest of the design language — it determines how glass sits in relation to content, light, and depth.

#### 11.3.1 Four-Layer Stack

Liquid Glass consists of four conceptual layers arranged front to back: Highlights → Content → Material → Shadow [^30^]. Each layer has a distinct function and adapts independently based on what lies beneath the glass surface [^79^].

| Layer | Position | Function | Adaptive Behavior |
|-------|----------|----------|-------------------|
| **Highlights** | Front-most | Specular highlight computation, glass prism refraction, edge lighting | Responds to device motion (accelerometer/gyroscope); Fresnel effect intensifies at viewing angles [^30^] [^65^] |
| **Content** | Second | Text, icons, symbols, foreground UI elements | Receives "vibrant treatment" — auto-adjusts color, brightness, and saturation for legibility on the material surface [^30^] |
| **Material** | Third | Backdrop blur, translucency, tint, luminosity adjustment, glow | Applies lensing/distortion to captured backdrop; core visual engine of the glass effect [^30^] |
| **Shadow** | Back-most | Depth separation, elevation cues | Increases opacity when text scrolls behind; decreases over plain solid backgrounds [^30^] [^35^] |

**Table: Liquid Glass Four-Layer Composition Model.** This layer decomposition was derived from analysis of Apple's iOS 26 Figma file [^30^]. While Apple confirms that "a number of layers work together" with each "continuously adapting based on what's behind it" [^79^], the exact count and naming of four layers is an inference rather than officially published specification. The model remains the most accurate working description available.

The Highlights layer creates the signature "liquid" quality. It behaves like a glass prism, refracting light and enhancing depth perception [^30^]. Specular highlights follow the geometry of the element and, in some cases, respond to real-time device movement via accelerometer and gyroscope integration [^65^]. This is the layer that distinguishes Liquid Glass from legacy blur materials — it simulates optical refraction rather than mere light scattering.

The Content layer is where text, icons, and interactive elements live. This content receives automatic vibrant treatment: the system adjusts foreground color, brightness, and saturation to maintain contrast against the translucent material beneath [^30^]. Web implementations SHOULD pair material backgrounds with vibrant label tokens — for example, `rgba(0, 0, 0, 1.0)` for primary labels in light mode and `rgba(255, 255, 255, 1.0)` in dark mode [^529^] [^5^].

The Material layer is the core optical engine. It captures the rendered content behind the glass via `CABackdropLayer` (private API on native platforms) and applies the blur, saturation, and lensing pipeline [^73^]. On the web, this corresponds to the `backdrop-filter` property. The Material layer also handles tint application — developers MAY apply `.tint()` to emphasize primary elements, but tints MUST NOT be used decoratively [^35^].

The Shadow layer provides depth separation. Its opacity is content-aware: when text scrolls underneath the glass, shadow opacity increases to create additional separation; when the glass sits over a plain solid background, shadow opacity decreases to avoid unnecessary heaviness [^35^]. This adaptive shadow behavior is one of the key differences between Liquid Glass and static glassmorphism implementations.

#### 11.3.2 GlassEffectContainer for Grouped Elements

When multiple glass elements appear in close proximity — such as a toolbar with multiple buttons — each element MUST be wrapped in a `GlassEffectContainer` (SwiftUI) or `UIGlassContainerEffect` (UIKit) [^37^]. The container provides three critical functions. First, it establishes a shared sampling region so all grouped elements read from the same backdrop capture, eliminating visual seams at element boundaries. Second, it reduces the rendering pipeline to a single pass, improving GPU performance significantly compared to individual per-element sampling. Third, it enables morphing — the fluid shape-to-shape transitions that occur when glass elements change state or position [^37^].

The container exposes a `spacing` parameter that controls the distance at which individual glass effects begin to merge. A larger spacing value causes elements to blend together sooner; the default value of `0` processes elements as a batch without merging distortion [^114^]. On the web, grouped glass elements SHOULD share a common parent container with a single `backdrop-filter` applied to the parent rather than individual filters on each child, approximating the shared sampling behavior.

```css
@layer composition {
  /* GlassEffectContainer equivalent — shared sampling region */
  .glass-container {
    /* Single backdrop-filter on the container, not children */
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    backdrop-filter: blur(20px) saturate(160%);
    background: rgba(255, 255, 255, 0.1);
    /* Spacing-equivalent: padding controls merge proximity */
    padding: var(--glass-container-spacing, 4px);
    border-radius: var(--glass-container-radius, 9999px);
  }

  /* Child elements receive NO individual backdrop-filter */
  .glass-container > .glass-child {
    background: transparent;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  /* Content-aware shadow: increases over text, decreases over solids */
  .glass-with-adaptive-shadow {
    /* Base shadow for solid backgrounds */
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;
  }

  .glass-with-adaptive-shadow[data-content-type="text"] {
    /* Increased shadow when text scrolls behind */
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  }

  .glass-with-adaptive-shadow[data-content-type="solid"] {
    /* Minimal shadow over plain backgrounds */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
}
```

The `.glass-container` pattern is critical for performance: applying individual `backdrop-filter` to each child element forces the browser to run a separate compositing pass per child, which can drop frame rates on complex UIs [^37^] [^73^]. The container-level approach mirrors Apple's `GlassEffectContainer` optimization strategy.

#### 11.3.3 Content-Aware Shadows

The shadow layer's content-awareness is one of Liquid Glass's most sophisticated behaviors. Unlike static `box-shadow` values, the shadow opacity adapts dynamically based on what content passes behind the glass [^35^]. When scrolling text moves underneath, shadow opacity increases to preserve legibility separation. When the background is a plain solid color, shadow opacity decreases to maintain visual lightness. This behavior correlates directly with Insight 7: material properties encode information hierarchy, and the shadow layer self-adjusts to protect that hierarchy as content changes [^Insight 7^].

On the web, true content-aware shadow adaptation requires JavaScript to detect background content type. A progressive implementation uses `IntersectionObserver` to classify visible backdrop content and adjusts a CSS custom property:

```javascript
// Content-aware shadow adaptation (progressive enhancement)
class AdaptiveGlassShadow {
  constructor(glassElement) {
    this.el = glassElement;
    this.observer = new IntersectionObserver(
      (entries) => this.updateShadow(entries),
      { root: glassElement, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    // Observe sibling/content elements behind the glass
    this.observeBehindContent();
  }

  updateShadow(entries) {
    const hasTextBehind = entries.some(e => 
      e.isIntersecting && e.target.matches('p, h1, h2, h3, span, .text-content')
    );
    const hasSolidBehind = entries.some(e =>
      e.isIntersecting && e.target.matches('.solid-bg, .card, .panel')
    );

    if (hasTextBehind) {
      // Increase shadow for text separation
      this.el.style.setProperty('--glass-shadow-opacity', '0.18');
      this.el.style.setProperty('--glass-shadow-blur', '32px');
      this.el.style.setProperty('--glass-shadow-y', '8px');
    } else if (hasSolidBehind) {
      // Decrease shadow over solid backgrounds
      this.el.style.setProperty('--glass-shadow-opacity', '0.04');
      this.el.style.setProperty('--glass-shadow-blur', '8px');
      this.el.style.setProperty('--glass-shadow-y', '2px');
    } else {
      // Default: mixed or media content
      this.el.style.setProperty('--glass-shadow-opacity', '0.10');
      this.el.style.setProperty('--glass-shadow-blur', '16px');
      this.el.style.setProperty('--glass-shadow-y', '4px');
    }
  }

  observeBehindContent() {
    // Query elements positioned behind this glass element in z-space
    const behind = document.querySelectorAll(
      '[data-layer="content"] *'
    );
    behind.forEach(el => this.observer.observe(el));
  }
}
```

This JavaScript enhancement is optional — the CSS-only implementation with `[data-content-type]` attributes provides a static approximation that degrades gracefully when JavaScript is unavailable or `prefers-reduced-motion` is active.

#### 11.3.4 Critical Composition Rules

Several constraints govern how these layers combine. Glass MUST NOT sample other glass — stacking a glass element on top of another glass surface produces visual artifacts because the backdrop capture cannot properly read an already-filtered surface [^29^]. This "glass-on-glass" anti-pattern is the compositional counterpart to the navigation/content layer separation: Liquid Glass lives exclusively on the navigation layer, and the content layer beneath it MUST use fills, transparency, and vibrancy rather than additional material effects [^79^]. When transitioning between states, developers SHOULD set the `effect` property to `nil` rather than animating `opacity`, as the native dematerialization animation modulates light-bending intensity rather than fading alpha [^66^]. On the web, this corresponds to animating `backdrop-filter` blur values from their operational radius to `0px` rather than animating `opacity` to zero.

---

## 12. Stage J — Adaptive Color & Glass Composition

Adaptive color extraction bridges a project's static token system and its content-aware chrome layer. Where Stages A–I established the geometric, typographic, and material foundations, this stage supplies the runtime chromatic data that grounds each surface in its context. The protocol treats color adaptation as a strictly governed pipeline: sampling, perceptual normalization, mathematical contrast enforcement, and glass material composition—every step carrying a hard fallback. The 2025 AppleVis Report Card documented decreased satisfaction among low-vision users specifically correlating with Liquid Glass's translucent redesign [^499^]; the pipeline below closes that gap.

### 12.1 Source Image Sampling

#### 12.1.1 Canvas-based extraction: 24×24 downscale, discard outer 15% margin

The active source image is drawn to an off-screen `<canvas>` downscaled to 24×24 pixels—small enough that `getImageData` stays within the 50 ms performance guard, with browser bilinear filtering producing a naturally smoothed histogram [^493^]. The full image data is then read via `canvas.getContext('2d').getImageData`; a CORS taint (missing `crossorigin` attribute on a cross-origin source) causes immediate abort to static tokens. The outer 15% margin of pixels is discarded to eliminate baked-in borders, letterboxing, or edge artifacts. For a 24×24 canvas, the effective sampling region is the central ~20×20 pixel block.

| Stage | Operation | Output | Failure Mode |
|---|---|---|---|
| 1. Draw | `ctx.drawImage(img, 0, 0, 24, 24)` | 24×24 canvas | CORS taint → abort |
| 2. Read | `getImageData(0, 0, 24, 24)` | 576 RGBA values | SecurityError → abort |
| 3. Marginalize | Discard outer 15% border pixels | ~400 valid pixels | None |
| 4. Weight | Apply saturation-weighted average | `{r, g, b}` seed triplet | Zero total weight → abort |
| 5. Normalize | HSL clamp + contrast binary search | Final accessible RGB | Cannot clear 4.5:1 → abort |
| 6. Cache | Store in `Map<hash, RGB>` + optional `localStorage` LRU | Cached entry | Storage quota → silent skip |

#### 12.1.2 Weighted average: weight(pixel) = 0.3 + 0.7 × saturation(pixel) — prevents washout

A naive arithmetic mean would allow a large neutral background to wash out a small vivid accent. The protocol uses a saturation-weighted average where each pixel's contribution scales with its HSL saturation value:

```js
/**
 * Compute saturation-weighted average RGB from ImageData.
 * @param {ImageData} imageData - from canvas.getImageData
 * @returns {{r:number, g:number, b:number}} seed color
 */
function extractSeedColor(imageData) {
  const data = imageData.data; // Uint8ClampedArray, RGBA
  const width = imageData.width;
  const height = imageData.height;
  const margin = Math.round(width * 0.15); // outer 15% discarded

  let sumR = 0, sumG = 0, sumB = 0, sumWeight = 0;

  for (let y = margin; y < height - margin; y++) {
    for (let x = margin; x < width - margin; x++) {
      const i = (y * width + x) * 4;
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const s = max === min ? 0 : l > 0.5
        ? (max - min) / (2 - max - min)
        : (max - min) / (max + min);

      const weight = 0.3 + 0.7 * s; // base weight + saturation bonus

      sumR += data[i] * weight;
      sumG += data[i + 1] * weight;
      sumB += data[i + 2] * weight;
      sumWeight += weight;
    }
  }

  if (sumWeight === 0) return null; // abort to static fallback

  return {
    r: Math.round(sumR / sumWeight),
    g: Math.round(sumG / sumWeight),
    b: Math.round(sumB / sumWeight)
  };
}
```

The formula guarantees that fully desaturated pixels contribute a nonzero baseline (0.3) while vivid pixels receive up to 3.3× their base weight, preserving accent colors that a naive average would drown [^631^]. A k-means cluster extraction (k=3) is acceptable as a higher-fidelity alternative if it completes within the 50 ms mobile guard; weighted average is the required minimum baseline.

### 12.2 Perceptual Normalization & Contrast Enforcement

#### 12.2.1 HSL clamping: L in [10–20%] dark / [80–92%] light for secondary; S ≤ 45%

The seed RGB triplet converts to HSL and clamps into role-appropriate lightness bands so it reads as a panel, not a hero color. Secondary surfaces use L ∈ [10%, 20%] dark and L ∈ [80%, 92%] light; tertiary surfaces use L ∈ [16%, 26%] dark and L ∈ [70%, 84%] light. Saturation clamps to S ≤ 45% in all cases—the goal is a desaturated suggestion of hue, not reproduction. These boundaries reflect Insight 7's finding that material thickness serves as the primary hierarchy signal [^87^].

```js
/**
 * Clamp HSL values to role-appropriate bounds.
 * @param {{h:number, s:number, l:number}} hsl - 0-1 ranges
 * @param {'secondary'|'tertiary'} role
 * @param {'dark'|'light'} mode
 * @returns {{h:number, s:number, l:number}} normalized HSL
 */
function normalizeHSL(hsl, role, mode) {
  const isDark = mode === 'dark';
  const lMin = role === 'secondary'
    ? (isDark ? 0.10 : 0.80)
    : (isDark ? 0.16 : 0.70);
  const lMax = role === 'secondary'
    ? (isDark ? 0.20 : 0.92)
    : (isDark ? 0.26 : 0.84);

  return {
    h: hsl.h,
    s: Math.min(hsl.s, 0.45),
    l: Math.max(lMin, Math.min(lMax, hsl.l))
  };
}
```

#### 12.2.2 Binary-search L channel in 1% steps until WCAG 4.5:1 clears — hard floor not warning

The WCAG 2.1 relative luminance formula defines contrast ratio as (L1 + 0.05) / (L2 + 0.05), where L1 and L2 are the relative luminances of the lighter and darker colors [^627^]. The protocol **MUST** evaluate this ratio between the normalized candidate and the primary-label/text token. If the ratio is below 4.5:1, the pipeline binary-searches the Lightness channel in 1% steps until the ratio clears [^630^].

```js
/**
 * Binary-search the L channel until WCAG 4.5:1 clears.
 * @param {{h:number, s:number, l:number}} hsl - normalized HSL
 * @param {{r:number, g:number, b:number}} labelRGB - text color
 * @param {'dark'|'light'} mode
 * @param {number} lMin - clamp lower bound
 * @param {number} lMax - clamp upper bound
 * @returns {{h:number, s:number, l:number}|null} accessible HSL or null
 */
function enforceContrast(hsl, labelRGB, mode, lMin, lMax) {
  const targetRatio = 4.5;
  let lo = lMin, hi = lMax;
  let best = null;

  while (lo <= hi) {
    const mid = Math.round((lo + hi) * 50) / 100; // 2 decimal precision
    const candidate = { ...hsl, l: mid };
    const candidateRGB = hslToRgb(candidate);
    const ratio = contrastRatio(candidateRGB, labelRGB);

    if (ratio >= targetRatio) {
      best = candidate; // record valid candidate
      if (mode === 'dark') hi = mid - 0.01; // can we go darker?
      else lo = mid + 0.01; // can we go lighter?
    } else {
      if (mode === 'dark') lo = mid + 0.01;
      else hi = mid - 0.01;
    }
  }

  return best; // null if no value clears 4.5:1 within bounds
}
```

The search converges in at most 7–8 iterations, keeping total extraction time under the 50 ms guard. If the clamp boundary is reached before contrast clears 4.5:1, the pipeline **MUST** fall back to the static token. This is a hard floor—shipping a non-compliant surface is a protocol violation [^25^]. The contrast computation uses the standard WCAG relative luminance formula with per-channel gamma correction and weights L = 0.2126×R + 0.7152×G + 0.0722×B [^631^].

### 12.3 Glass Material Composition & Transition

#### 12.3.1 Layer stack: adaptive color base + backdrop-filter blur(20px) saturate(160%) + scrim at 12–18%

The final adaptive RGB value composites into a four-layer glass material stack ordered back to front, mapping to Insight 8's closed mathematical loop where extraction feeds composition feeds contrast enforcement [^101^].

```css
/* Glass material layer stack on the chrome element */
.glass-chrome {
  /* Layer 1: adaptive surface color as base fill */
  background-color: rgb(var(--surface-adaptive-rgb));

  /* Layer 2: backdrop blur with saturation boost */
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  backdrop-filter: blur(20px) saturate(160%);

  /* Layer 3: scrim overlay for legibility */
  background-image: linear-gradient(
    rgba(var(--bg-neutral-rgb), 0.12),
    rgba(var(--bg-neutral-rgb), 0.18)
  );

  /* Layer 4: existing hairline border tokens, unchanged */
  border: 1px solid var(--border-hairline);
}
```

Layer 1 applies the adaptive base fill. Layer 2 uses `backdrop-filter: blur(20px) saturate(160%)` for glassmorphism refraction [^493^]. Layer 3 composites a scrim at 12–18% alpha to preserve text legibility. Layer 4 retains existing hairline border tokens. Supported in Chrome 76+, Firefox 103+, and Safari 9+ (prefixed) [^493^]. The `saturate(160%)` filter compensates for normalization desaturation, restoring visual richness to the blurred background.

#### 12.3.2 prefers-reduced-transparency: skip blur, raise scrim to 92% opacity

When `prefers-reduced-transparency` is active, the blur layer is removed and the scrim opacity raised to ~92%, creating a solid-reading surface that preserves the adaptive hue.

```css
@media (prefers-reduced-transparency: reduce) {
  .glass-chrome {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background-image: linear-gradient(
      rgba(var(--bg-neutral-rgb), 0.92),
      rgba(var(--bg-neutral-rgb), 0.92)
    );
  }
}
```

The 2025 AppleVis Report Card identified translucency as a specific pain point for low-vision users, with participant comments noting the Liquid Glass redesign had a significant negative impact [^499^]. This 92% scrim is therefore a documented accessibility requirement, not a cosmetic preference.

#### 12.3.3 Crossfade: 600ms ease-in-out, JS-driven HSL interpolation — CSS custom properties don't transition natively

On content-unit change, the adaptive color crossfades over 600 ms ease-in-out. CSS custom properties do not transition natively; the interpolation **MUST** be JS-driven in HSL space to avoid muddy intermediate grays [^628^].

```js
/**
 * Animate CSS custom property from one RGB value to another via HSL.
 * CSS custom properties don't transition natively—JS interpolation required.
 * @param {string} property - CSS variable name
 * @param {string} fromRGB - "r, g, b" triplet string
 * @param {string} toRGB - "r, g, b" triplet string
 * @param {number} duration - ms, defaults to 600
 */
function crossfadeAdaptiveColor(property, fromRGB, toRGB, duration = 600) {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    document.documentElement.style.setProperty(property, toRGB);
    return;
  }

  const fromHSL = rgbToHsl(parseRGB(fromRGB));
  const toHSL = rgbToHsl(parseRGB(toRGB));
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    const t = Math.min(1, easeInOutCubic(elapsed / duration));

    // Shortest-path hue interpolation
    let hDiff = toHSL.h - fromHSL.h;
    if (hDiff > 180) hDiff -= 360;
    if (hDiff < -180) hDiff += 360;

    const h = (fromHSL.h + hDiff * t + 360) % 360;
    const s = fromHSL.s + (toHSL.s - fromHSL.s) * t;
    const l = fromHSL.l + (toHSL.l - fromHSL.l) * t;

    const { r, g, b } = hslToRgb({ h, s, l });
    document.documentElement.style.setProperty(
      property, `${r}, ${g}, ${b}`
    );

    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

The interpolation uses shortest-path hue rotation (handling the 0°/360° wrap) and cubic ease-in-out. If `prefers-reduced-motion` is active, the swap is instant at 0 ms.

### 12.4 Caching & Failure Handling

#### 12.4.1 In-memory Map keyed by image URL hash + optional localStorage LRU (200 entries)

Final adaptive values cache in an in-memory `Map<sourceImageUrlHash, {r,g,b}>`, storing the **post-contrast-enforcement** final value so cached entries never require re-validation. An optional `localStorage` persistence layer with LRU eviction (cap: 200 entries) survives page reloads, evicting oldest entries by timestamp when the store exceeds capacity.

```js
/**
 * Two-tier cache: in-memory Map + optional localStorage LRU.
 * Stores post-contrast-enforcement RGB values only.
 */
class AdaptiveColorCache {
  constructor(capacity = 200) {
    this.memory = new Map(); // tier 1: in-memory
    this.capacity = capacity;
    this.key = '__adaptive_color_cache';
    this._loadFromStorage();
  }

  get(url) {
    const hash = cyrb53(url);
    return this.memory.get(hash) ?? this._getFromStorage(hash);
  }

  set(url, rgb) {
    const hash = cyrb53(url);
    this.memory.set(hash, rgb);
    this._persistToStorage(hash, rgb);
  }

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return;
      const entries = JSON.parse(raw);
      // Silently ignore parse/storage errors
      entries.forEach(([h, v]) => this.memory.set(h, v));
    } catch { /* silent — storage is optional */ }
  }

  _persistToStorage(hash, rgb) {
    try {
      const entries = Array.from(this.memory.entries());
      if (entries.length > this.capacity) {
        entries.sort((a, b) => (a[1].ts ?? 0) - (b[1].ts ?? 0));
        entries.splice(0, entries.length - this.capacity);
      }
      localStorage.setItem(this.key,
        JSON.stringify(entries.map(([h, v]) => [h, v]))
      );
    } catch { /* silent — quota exceeded is non-fatal */ }
  }

  _getFromStorage(hash) { /* internal LRU read */ }
}
```

Storage quota exceeded is non-fatal—the in-memory tier continues normally.

#### 12.4.2 Silent fallback to static tokens on any failure — CORS, 404, timeout >50ms, contrast can't clear

Every failure path degrades silently to static fallback tokens. No uncaught errors, no blocking, no console messages surfaced to users.

| Failure | Trigger | Fallback Behavior | User Impact |
|---|---|---|---|
| Canvas CORS taint | `getImageData()` throws SecurityError | Static ramp | None |
| Source image 404 | `<img>` load error | Static ramp | None |
| Extraction timeout | Elapsed > 50 ms mid-pipeline | Static ramp | None |
| Contrast can't clear 4.5:1 | Binary search hits clamp boundary | Static ramp for that role | None |
| `prefers-contrast: more` | OS-level increased contrast | Bypass extraction entirely | Static ramp |
| Storage quota exceeded | `localStorage.setItem` throws | In-memory cache only | None on next load |
| Zero total weight | All sampled pixels have s=0 | Static ramp | None |

The `prefers-contrast: more` media query bypasses extraction entirely—an intentional accessibility override taking highest priority in the preference cascade [^25^]. The AppleVis 2025 data underscores why these silent fallbacks are mandatory: low-vision respondents identified Liquid Glass as a significant negative impact, with decreased satisfaction across nearly all categories year-over-year [^636^]. The protocol's closed-loop design—every adaptive value through contrast enforcement, every failure with a static fallback, every preference with a hard override—addresses the systemic accessibility tensions Insight 4 identified as inherent to translucent material systems [^45^].

---

# 13. Stage K — Accessibility & Inclusion

Liquid Glass's defining properties — translucency, depth-driven hierarchy, and real-time materialization — create a structural conflict with accessibility requirements. The 2025 AppleVis Report Card documented decreased satisfaction across nearly all categories compared to 2024, with Liquid Glass cited as having "a significant negative impact on the user experience for many" [^25^]. Nielsen Norman Group reinforced this: "One of the oldest findings in usability is that anything placed on top of something else becomes harder to see. Yet here we are, in 2025, with Apple proudly obscuring text, icons, and controls by making them transparent and placing them on top of busy backgrounds" [^313^]. This section defines the accessibility matrix for Liquid Glass implementations, establishing protocol requirements ensuring compliance with WCAG 2.2 AA, the enforceable European Accessibility Act, and the lived experience of users with disabilities.

## 13.1 The Accessibility Matrix

### 13.1.1 VoiceOver: Label, Hint, Value, Trait, and Custom Rotor

VoiceOver, Apple's gesture-based screen reader across all platforms, requires every informative element to expose four attributes in a fixed vocalization order [^458^]: `accessibilityLabel` (redefining spoken text), `accessibilityValue` (current state), `trait` (element type), and `accessibilityHint` (behavior description). This order is immutable — developers MUST NOT attempt to reorder vocalization or inject pauses between attributes [^458^].

The VoiceOver rotor provides context-sensitive navigation; users configure rotor items at Settings > Accessibility > VoiceOver > Rotor > Rotor Items, selecting from Speaking Rate, Volume, Live Recognition, and container navigation by headers, links, and form controls [^487^]. Developers SHOULD define custom rotor items via `UIAccessibilityCustomRotor` for app-specific navigation contexts — for instance, between messages in a chat thread or sections in a document. Custom rotors are critical for Liquid Glass interfaces where visual landmarks are intentionally minimal, leaving non-visual users without structural cues.

The VoiceOver attribute system maps to the following protocol matrix for Liquid Glass elements:

| Attribute | Purpose | Example (Glass Button) | Protocol Requirement |
|---|---|---|---|
| `accessibilityLabel` | Redefines spoken text [^458^] | "Send message" | MUST override visible label if text alone is ambiguous |
| `accessibilityValue` | Current state or progress [^458^] | "50 percent complete" | MUST reflect live state changes (on/off, progress) |
| `trait` | Element type classification [^458^] | `button`, `selected` | MUST include all applicable traits; combine with `.selected` |
| `accessibilityHint` | Describes behavior on activation [^458^] | "Double-tap to send" | MUST describe the outcome, not the gesture |
| Custom Rotor | App-specific navigation [^487^] | "Navigate between chat messages" | SHOULD define for any grouped content inside glass panels |

The 2025 AppleVis Report revealed VoiceOver UX on iOS dropped to 4.0 (from higher 2024 ratings), with macOS VoiceOver UX falling to 3.1 [^25^]. Screen Recognition "isn't enough" for Liquid Glass because blurred, translucent surfaces provide insufficient visual anchors for ML-based element identification [^25^]. Developers MUST provide explicit accessibility attributes rather than relying on automatic screen recognition.

### 13.1.2 Dynamic Type: Twelve Size Classes with CSS `clamp()` Fluid Scaling

iOS defines twelve Dynamic Type size classes: seven standard sizes (xSmall through xxxLarge, with Large at 17pt as the default) plus five Accessibility sizes (AX1–AX5) [^438^]. Dynamic Type is not a linear multiplier — each text style has predefined values per class, so headline, body, caption, and footnote follow independent scaling curves [^441^]. SF Symbols scale automatically alongside text when rendered via `Image(systemName:)`.

Web implementations MUST replicate this non-linear scaling using CSS `clamp()` with per-style curves:

```css
/* =========================================
   DYNAMIC TYPE — 12 SIZE CLASS TOKENS
   ========================================= */

:root {
  /* Base at Large (17pt body). Range: xSmall → xxxLarge */
  --dt-body:        clamp(0.75rem, 0.706rem + 0.22vw, 1.375rem);
  --dt-body-ax:     clamp(1.5rem,  1.286rem + 1.07vw, 3.0rem);   /* AX1 → AX5 */

  /* Per-style non-linear curves matching iOS */
  --dt-large-title: clamp(1.625rem, 1.339rem + 1.43vw, 3.5rem);
  --dt-title-1:     clamp(1.375rem, 1.161rem + 1.07vw, 2.75rem);
  --dt-title-2:     clamp(1.25rem,  1.071rem + 0.89vw, 2.5rem);
  --dt-title-3:     clamp(1.125rem, 0.982rem + 0.71vw, 2.125rem);
  --dt-headline:    clamp(0.875rem, 0.804rem + 0.36vw, 1.375rem);
  --dt-callout:     clamp(0.875rem, 0.804rem + 0.36vw, 1.375rem);
  --dt-subheadline: clamp(0.8125rem, 0.759rem + 0.27vw, 1.25rem);
  --dt-footnote:    clamp(0.75rem,   0.705rem + 0.22vw, 1.125rem);
  --dt-caption-1:   clamp(0.6875rem, 0.652rem + 0.18vw, 1.0rem);
  --dt-caption-2:   clamp(0.625rem,  0.598rem + 0.13vw, 0.9375rem);
}
```

Layout spacing MUST scale proportionally alongside text. iOS provides `@ScaledMetric` for this [^443^]; web implementations SHOULD use `em` or `rem` units for padding and margins. The Large Content Viewer [^476^] MUST be available for elements that cannot scale — toolbar icons, tab bar items — via `aria-label` attributes and a minimum intrinsic size of 44×44 CSS pixels. WWDC 2024 guidance [^476^] mandates scalable components, multiline text, and `min-height` instead of fixed `height` on all text-bearing containers.

### 13.1.3 `prefers-contrast: more` — Disable Adaptive Extraction Entirely

When `prefers-contrast: more` is active (iOS: Settings > Accessibility > Display & Text Size > Increase Contrast), the Liquid Glass system MUST disable adaptive color extraction entirely and fall back to static contrast ramps only [^479^] [^504^]. Apple shipped this support in Safari 14.1 [^504^]. Under this preference, key elements render in high-contrast black or white, borders appear around notifications and controls, and — on macOS but not iOS — Reduce Transparency is automatically enabled [^479^].

The protocol requirement is absolute: `prefers-contrast: more` MUST trigger a complete bypass of the adaptive color extraction pipeline from Stage G. The system SHALL NOT sample underlying content for hue adaptation. All surfaces MUST use pre-defined static high-contrast values at minimum 7:1 for body text (WCAG AAA) and 4.5:1 for large text [^440^]. In SwiftUI, detect via `@Environment(\.colorSchemeContrast)` [^507^]; in UIKit, respond to `traitCollection.accessibilityContrast` [^478^].

## 13.2 Liquid Glass Specific Concerns

### 13.2.1 The 2025 AppleVis Report: Documented Negative UX for Low-Vision Users

The 2025 AppleVis Report Card — the largest survey of Apple accessibility users to date — showed cumulative satisfaction dropping to B (3.7) from 2024's 3.9 [^501^]. Direct user feedback identifies Liquid Glass as the primary cause [^25^]: *"Liquid Glass makes it much harder to see things, especially on the light mode keyboard"*; *"Please allow us to turn off liquid glass, it makes certain apps more difficult to see as a lot of us need contrast"*; *"Contrast is inadequate. Text appears as very light gray"* [^25^]. Nielsen Norman Group independently confirmed: *"Reading an email subject line now requires Dan Brown-level cryptographic decoder skills"* and *"Apple Maps: Icons at the bottom of the screen blend in with the images in the background, despite the blurring"* [^313^].

The root cause is structural: Liquid Glass materials reduce contrast by definition. Text sits on blurred, dynamic backgrounds; translucent panes let wallpapers bleed through, breaking minimum 4.5:1 ratios; and the "text on top of text" layering effect in Mail creates illegible compositions [^86^] [^313^]. The following table maps each accessibility preference to its Liquid Glass impact and required protocol mitigation:

| Preference | iOS Setting Path | Liquid Glass Impact | Protocol Mitigation |
|---|---|---|---|
| Reduce Transparency | Display & Text Size > Reduce Transparency [^455^] | Wallpaper bleedthrough breaks contrast; controls float indistinguishably [^479^] | Full opacity; keep adaptive hue; `backdrop-filter: none` |
| Increase Contrast | Display & Text Size > Increase Contrast [^504^] | Low-contrast text on translucent surfaces; no visible boundaries [^479^] | Disable adaptive extraction; static 7:1 ramp; add 2px borders |
| Reduce Motion | Motion > Reduce Motion [^481^] | Refraction disorients; elastic interactions trigger vestibular issues [^475^] | Instant snap to end-state; 0ms crossfade; disable refraction |
| Bold Text | Display & Text Size > Bold Text [^479^] | Thin text on translucent backgrounds marginally improved | `font-weight: 600` minimum; does NOT resolve contrast |
| Button Shapes | Display & Text Size > Button Shapes [^461^] | Glass buttons lack boundaries; tappable areas unidentifiable [^460^] | 2px solid borders; opaque fills; underlines on actions |
| Larger Text | Display & Text Size > Larger Text [^438^] | Text scales but glass containers truncate content [^476^] | `min-height` containers; multiline text; internal scroll |
| Differentiate Without Color | Display & Text Size > Differentiate Without Color [^461^] | Status indicators rely solely on color on glass | Add shape/icon variants alongside color |

Apple has responded incrementally: iOS 26.1 added Clear/Tinted options [^475^]; iOS 26.4 added Reduce Brightness; iOS 27 is expected to include a transparency slider [^475^]. These are reactive. The protocol requires proactive compliance — every implementation MUST include the mitigations above regardless of platform-provided adaptations.

### 13.2.2 Unified "Visual Profile" Concept

The most frequently requested feature across the AppleVis survey is a unified "visual profile" bundling all accessibility settings for system-wide application with per-app override [^25^]. iOS 18+ supports per-app controls at Settings > Accessibility > Per-App Settings [^435^] [^439^], but users report settings are "scattered and sometimes behave differently app to app" [^25^].

The protocol adopts the visual profile as a first-class concept. Implementations SHOULD expose a bundled `visualProfile` configuration object:

```css
/* =========================================
   VISUAL PROFILE — BUNDLED ACCESSIBILITY
   ========================================= */

:root {
  --vp-reduced-motion:        no-preference;
  --vp-reduced-transparency:  no-preference;
  --vp-high-contrast:         no-preference;
  --vp-bold-text:             no-preference;
  --vp-button-shapes:         no-preference;
}

@media (prefers-reduced-motion: reduce)       { :root { --vp-reduced-motion: reduce; } }
@media (prefers-reduced-transparency: reduce)  { :root { --vp-reduced-transparency: reduce; } }
@media (prefers-contrast: more)                { :root { --vp-high-contrast: more; } }

/* Per-component override: scoped, non-inheriting */
.glass-panel--glass-enabled {
  --vp-reduced-transparency: no-preference;
}
```

Individual components MAY override profile settings when context demands — for example, a media viewer might retain glass aesthetics while the rest of the app respects reduced-transparency preferences. Overrides MUST be scoped to the component only and MUST NOT propagate to child elements unless explicitly inherited.

### 13.2.3 Every Glass Effect MUST Have a Non-Glass Equivalent

Reduced glass is not sufficient. A "frostier" material still lacks the contrast and boundary clarity low-vision users require. The Insight 4 analysis established that accessibility tensions are systemic — the properties making Liquid Glass "magical" (transparency, depth, motion) directly conflict with accessibility needs (contrast, predictability, stability) [^25^] [^313^]. **Every glass effect MUST have a genuinely accessible non-glass equivalent** — not a less-transparent variant, but a completely distinct accessible surface.

For a Liquid Glass navigation bar, the equivalent is a solid-color bar with 1px borders and 100% opaque background. For a glass button, the equivalent is a bordered button with solid fill and visible outline. For a translucent panel, the equivalent is a card with solid surface color and no backdrop filter. These equivalents MUST pass WCAG 2.2 AA (4.5:1 body text, 3:1 large text and UI) [^440^] [^436^] and SHOULD target AAA (7:1) for body text. The accessible equivalent MUST be visually distinct from the glass version, not merely a parameter adjustment.

## 13.3 Implementation Requirements

### 13.3.1 `@media (prefers-reduced-motion)`, `(prefers-reduced-transparency)`, `(prefers-contrast: more)` CSS Implementations

The following CSS block provides the complete reference for all three primary accessibility media queries, designed to compose when multiple preferences are active:

```css
/* =========================================
   LIQUID GLASS ACCESSIBILITY MEDIA QUERIES
   ========================================= */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .liquid-glass {
    --glass-refraction: none;
    --glass-distortion: 0;
    backdrop-filter: blur(var(--glass-blur-static, 8px)) !important;
    transition: none !important;
  }
  .page-transition-enter,
  .page-transition-exit {
    opacity: 1 !important;
    transform: none !important;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .liquid-glass {
    background: var(--adaptive-solid-fill) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    opacity: 1 !important;
  }
  .glass-panel, .glass-sheet, .glass-bar {
    background: var(--opaque-surface) !important;
    box-shadow: var(--shadow-static-rest) !important;
  }
}

@media (prefers-contrast: more) {
  .liquid-glass {
    background: var(--static-contrast-ramp-high) !important;
    border: 1px solid var(--hc-border-primary) !important;
    --adaptive-extraction: disabled;
  }
  .text-body, .text-caption, .text-footnote {
    color: var(--hc-text-primary) !important;
  }
  .text-secondary, .text-tertiary {
    color: var(--hc-text-secondary) !important; /* 7:1 minimum */
  }
  button, [role="button"], a, input, select, textarea,
  [tabindex]:not([tabindex="-1"]) {
    outline: 2px solid var(--hc-focus-ring);
    outline-offset: 2px;
  }
  .subtle-gradient, .glass-sheen {
    background: var(--hc-solid-fill) !important;
    background-image: none !important;
  }
}

/* Combined: High Contrast + Dark Mode */
@media (prefers-color-scheme: dark) and (prefers-contrast: more) {
  .liquid-glass {
    background: rgba(0, 0, 0, 0.95) !important;
    border: 1px solid rgba(255, 255, 255, 0.8) !important;
    color: #FFFFFF !important;
  }
  .text-body { color: #FFFFFF !important; }
  .text-secondary { color: #E0E0E0 !important; } /* 14:1 on black */
}

/* Inverted colors (Safari): avoid double-inversion */
@media (inverted-colors: inverted) {
  .liquid-glass {
    backdrop-filter: none;
    background: var(--solid-neutral);
  }
}
```

The custom property `--adaptive-solid-fill` is the critical bridge between states. When transparency is reduced, the surface becomes opaque but retains adaptive hue [^479^]. When contrast is increased, even adaptive behavior is disabled for static high-contrast values. The progressive enhancement order is: default glass → reduced transparency (opaque, adaptive hue) → high contrast (opaque, static, bordered) → combined dark+HC (black background, white text, 1px white border).

### 13.3.2 Button Shapes, Bold Text, Increase Contrast — Dedicated CSS Overrides

Three iOS settings require explicit CSS implementation. Button Shapes adds gray backgrounds to interactive items, underlines to actionable elements, and visible borders to controls [^460^] [^461^]. Bold Text renders all system text in boldface without restart [^479^]. Increase Contrast triggers the full pipeline from Section 13.3.1.

The protocol models Button Shapes and Bold Text as toggleable custom properties:

```css
/* =========================================
   BUTTON SHAPES + BOLD TEXT OVERRIDES
   ========================================= */

:root {
  --button-shapes-enabled: 0;
  --bold-text-enabled: 0;
}

@media (prefers-contrast: more) {
  :root { --button-shapes-enabled: 1; }
}

.btn-glass,
.glass-button,
[role="button"].liquid-glass {
  border: calc(var(--button-shapes-enabled) * 2px) solid
          var(--button-border-color, currentColor);
  background: calc(
    (1 - var(--button-shapes-enabled)) * var(--glass-fill-default)
    + var(--button-shapes-enabled) * var(--opaque-btn-fill)
  );
}

.text-body, .text-headline, .text-caption,
button, [role="button"], a {
  font-weight: calc(400 + (var(--bold-text-enabled) * 200));
  /* 400 when off, 600 when on */
}
```

SwiftUI exposes these via `@Environment(\.accessibilityShowButtonShapes)` [^464^] and `UIAccessibility.isBoldTextEnabled`. Web implementations detect Button Shapes via `prefers-contrast: more` as proxy; Bold Text requires a custom class set by application logic.

### 13.3.3 44pt Minimum Touch Targets Maintained Regardless of Glass Styling

Apple's HIG specifies 44×44 points minimum, exceeding WCAG 2.2's 24×24 CSS pixel floor [^433^]. This is absolute and MUST NOT be compromised by glass styling. A glass button with 36×36 point visible area and 8-point transparent padding is non-compliant — the padding is visually indistinguishable from the background on Liquid Glass surfaces.

The protocol enforces 44×44 CSS pixels as the minimum visible size for all tappable elements. When the visible element is smaller, the hit area MUST expand using a pseudo-element visually integrated into the glass surface:

```css
/* =========================================
   44pt MINIMUM TOUCH TARGETS
   ========================================= */

.touch-target {
  min-width: 44px;
  min-height: 44px;
  position: relative;
}

.touch-target--expanded::after {
  content: '';
  position: absolute;
  inset: -8px; /* Expands 44px hit from 28px visible */
  border-radius: inherit;
  background: var(--glass-fill-rest);
  backdrop-filter: var(--glass-backdrop-rest);
  z-index: -1;
}

@media (prefers-reduced-transparency: reduce) {
  .touch-target--expanded::after {
    background: var(--opaque-surface);
    backdrop-filter: none;
  }
}
```

Contrast checking for Liquid Glass MUST measure against the effective background AFTER blur and color extraction, not raw background [^503^]. The enforcement pipeline uses three stages: Stage 1 (design-time) audits tokens with the Figma Stark plugin; Stage 2 (build-time) runs automated ratio calculations; Stage 3 (runtime) applies binary-search L-channel adjustment when effective contrast falls below 4.5:1 [^503^]. The ratio is computed as `CR = (L1 + 0.05) / (L2 + 0.05)` where `L = 0.2126*R + 0.7152*G + 0.0722*B` per WCAG [^440^].

The European Accessibility Act, enforceable since June 28, 2025, makes these requirements legally binding for B2C digital products in the EU under EN 301 549 [^448^]. Penalties reach €900,000 or 10% of annual turnover in some member states [^451^]. Liquid Glass implementations that fail to provide non-glass equivalents, contrast enforcement, and touch target guarantees expose products to regulatory action and the documented user harm captured in the 2025 AppleVis Report [^25^].

---

## 14. Stage L — Cross-Platform Adaptation

Liquid Glass is Apple's first simultaneous design update across all six operating systems — iOS, iPadOS, macOS, visionOS, watchOS, and tvOS — announced at WWDC 2025.[^26^] The system is architected on a philosophy of treating platform variations as "expressions, not exceptions" of a shared design foundation[^65^][^1^] — a single anatomy scales across devices, with each platform adapting shape, material behavior, and interaction patterns to its unique input method and display context. The design flow reverses Apple's historical diffusion pattern: principles flow backward from visionOS (spatial computing) into flat-screen devices for the first time.[^534^][^533^]

### 14.1 Platform Matrix

The matrix defines behavioral deltas across all six operating systems. Web implementations MUST use it to determine which tokens activate for a given `data-platform` context.

| Platform | Primary Shape | Input Method | Glass Trigger | Nav Pattern | Search Pos | Minimize Behavior | Ambient Reflection | Shadow Scale |
|----------|--------------|--------------|---------------|-------------|------------|-------------------|-------------------|--------------|
| **iOS** | Capsule (all sizes) | Touch | Always-on | Floating capsule tab bar (bottom) | Bottom (circle) | Scroll-driven | No | 1.0x |
| **iPadOS** | Capsule (all sizes) | Touch + Pointer | Always-on | Morphing sidebar ↔ tab bar | Top-right / Sidebar | Size-driven | Yes (sidebars) | 1.3x |
| **macOS** | Rounded Rect (S/M), Capsule (L/XL) | Mouse + Keyboard | Always-on | Sidebar + Toolbar groups | Top-right | Window-size driven | Yes (sidebars) | 1.2x |
| **visionOS** | 3D Capsule (z-space) | Gaze + Pinch | Focus-driven | Spatial tabs | Spatial | Gaze-away | Full spatial | Depth-based |
| **watchOS** | Capsule (subtle) | Touch + Digital Crown | Minimal | Digital Crown + Smart Stack | N/A | N/A | No | 0.5x |
| **tvOS** | Capsule (focus) | Siri Remote (focus) | Focus materialization | Top Shelf + Grid | Top | N/A | No | 0.8x |

Glass presence is inversely proportional to screen size and directly proportional to input precision. iOS uses capsules for every interactive element because touch requires large, unambiguous targets.[^1^] watchOS, at the opposite extreme, applies the lightest touch of any platform — changes appear automatically for apps built against watchOS 10+ SDKs with no explicit adoption work.[^258^][^551^]

#### 14.1.1 iOS: Narrow Canvas, Capsule Dominance, Shrinking Navigation

The iOS tab bar — historically full-width and fixed — is now a floating capsule inset from screen edges, creating a visual affordance that it can minimize.[^538^] Tab bars collapse automatically on scroll via `.tabBarMinimizeBehavior(.onScrollDown)`.[^258^][^574^] Search has migrated from the top navigation bar to the bottom of the screen as a separate circular button that morphs into a search field on activation, an ergonomic decision for thumb reachability on large iPhones.[^538^][^348^] The `.interactive()` modifier, exclusive to iOS, adds touch feedback including scaling, bouncing, shimmering, and touch-point illumination.[^16^] Small elements auto-flip between light and dark modes, and devices older than iPhone 11 receive frosted glass fallback.[^16^]

#### 14.1.2 iPadOS: Bridge Device, Sidebar Inset, Window Resizing

iPadOS's signature adaptation is the floating sidebar built with Liquid Glass featuring ambient reflection from nearby colorful content.[^79^] The `backgroundExtensionEffect()` API extends content beneath the sidebar without clipping.[^258^] The sidebar and tab bar together form "a single navigational element that fluidly scales as the canvas of the app grows"[^79^] — on portrait orientation or smaller windows, the sidebar morphs into a tab bar and vice versa.[^567^] iPadOS 26 introduces a menu bar for faster command access,[^258^] and search appears at top-right rather than bottom.[^348^] Shadows are scaled to approximately 1.3x to accommodate the increased canvas size.[^16^]

#### 14.1.3 macOS: Wide Canvas, behindWindow Blending, Shape Differentiation

macOS defines two blending modes via `NSVisualEffectView.BlendingMode`: `behindWindow` (content behind the window shows through) and `withinWindow` (content within the window shows through).[^5^] The choice MUST be based on whether the control sits on window chrome or within the content area. Mini, Small, and Medium controls retain rounded-rectangle shapes to preserve horizontal density; Large and X-Large use capsules.[^314^][^1^] Controls are slightly taller than prior versions for larger click targets.[^314^] AppKit automatically groups toolbar buttons onto a single glass piece via `NSToolbarItemGroup`,[^29^] the menu bar is fully transparent,[^26^] and window corners nest glass controls into concentric rounded geometry.[^79^]

### 14.2 Specialized Platforms

#### 14.2.1 visionOS: Spatial Origin, Depth as Hierarchy

visionOS is the design origin of Liquid Glass, not its recipient.[^534^][^533^] Hierarchy is communicated through depth rather than size or contrast: "You don't just look at the UI, you look through it."[^534^] Glass elements occupy distinct z-space planes — UI at approximately 2 meters, content at 0 meters, overlays at 4 meters. Focus triggers materialization: gazed elements increase opacity and specular response. The tab bar minimizes when the user looks away.[^574^] Parallax responds to head movement. Web implementations targeting spatial contexts MUST use `transform: translateZ()` with perspective containers to approximate depth layering.

#### 14.2.2 watchOS: Minimal Changes, Glanceable Information

watchOS receives the most minimal treatment. Liquid Glass appears in Photos watch face numerals, Smart Stack widgets, notifications, Control Center, and in-app controls.[^548^][^546^] The Photos face uses glass numerals allowing the underlying photograph to show through.[^548^] The Digital Crown provides haptic feedback synchronized to glass-breaking visual effects.[^532^] App icons maintain their circular shape.[^258^] The philosophy is glanceability: glass effects are intentionally restrained to avoid competing with content the user must read in under two seconds.

#### 14.2.3 tvOS: Focus-Based Interaction, Safe Areas, Focus Enlargement

tvOS uses focus as the primary model — Liquid Glass materializes when elements gain focus.[^5^] Image views and buttons adopt glass on focus with spatial enlargement. Apple TV 4K (2nd generation) or newer is required; older hardware keeps its prior appearance.[^566^][^258^] Glass appears in Control Center, the transparent Home Screen dock, media scrub bar, and TV app sidebar.[^568^][^518^] Safe areas of 60pt horizontal and 40pt vertical MUST be maintained for TV overscan compatibility.

### 14.3 CSS Platform Modes

Cross-platform adaptation uses the `data-platform` attribute on the document root. Each platform mode overrides shared custom properties, keeping component code identical while token values shift per context. This aligns with Apple's "expressions, not exceptions" architecture[^65^] — component structure is shared; only tokens change.

#### 14.3.1 data-platform Attribute Switching

JavaScript MUST detect platform context (via user-agent, screen heuristics, or explicit configuration) and set `data-platform` before first paint:

```css
/* =============================================
   LIQUID GLASS — Platform Mode Token Overrides
   ============================================= */

/* Base tokens (iOS as default expression) */
:root {
  --lg-shape-mode: capsule;
  --lg-control-height: 44px;
  --lg-control-height-sm: 36px;
  --lg-control-height-lg: 56px;
  --lg-nav-position: bottom;
  --lg-search-position: bottom;
  --lg-sidebar-enabled: false;
  --lg-sidebar-type: none;
  --lg-ambient-reflection: false;
  --lg-minimize-trigger: scroll;
  --lg-blending-mode: normal;
  --lg-material-trigger: always;
  --lg-shadow-scale: 1;
  --lg-scroll-edge: soft;
  --lg-icon-mask: rounded-rectangle;
  --lg-safe-h: 0px;
  --lg-safe-v: env(safe-area-inset-bottom);
}

/* iOS — narrow canvas, capsule dominance */
[data-platform="ios"] {
  --lg-shape-mode: capsule;
  --lg-control-height: 44px;
  --lg-nav-type: floating-capsule;
  --lg-nav-position: bottom;
  --lg-search-position: bottom;
  --lg-search-shape: circle;
  --lg-sidebar-enabled: false;
  --lg-interactive-scale: 0.96;
  --lg-minimize-trigger: scroll;
  --lg-material-flip-sm: true;
  --lg-shadow-scale: 1;
  --lg-safe-v: env(safe-area-inset-bottom);
}

/* iPadOS — bridge mode, morphing sidebar */
[data-platform="ipados"] {
  --lg-shape-mode: capsule;
  --lg-control-height: 44px;
  --lg-nav-type: morphing-sidebar;
  --lg-sidebar-enabled: true;
  --lg-sidebar-type: floating;
  --lg-ambient-reflection: true;
  --lg-search-position: top-right;
  --lg-minimize-trigger: resize;
  --lg-material-flip-sm: true;
  --lg-shadow-scale: 1.3;
  --lg-menu-bar: true;
}

/* macOS — wide canvas, shape differentiation, blending modes */
[data-platform="macos"] {
  --lg-shape-sm: rounded-rectangle;
  --lg-shape-md: rounded-rectangle;
  --lg-shape-lg: capsule;
  --lg-shape-xl: capsule;
  --lg-control-height: 36px;
  --lg-control-height-sm: 28px;
  --lg-control-height-lg: 44px;
  --lg-control-height-xl: 56px;
  --lg-sidebar-enabled: true;
  --lg-sidebar-type: fixed;
  --lg-ambient-reflection: true;
  --lg-blending-mode: behindWindow;
  --lg-search-position: top-right;
  --lg-toolbar-grouping: auto;
  --lg-scroll-edge: hard;
  --lg-menu-bar: transparent;
}

/* visionOS — spatial depth, focus-driven */
[data-platform="visionos"] {
  --lg-shape-mode: capsule;
  --lg-depth-ui: 2000px;
  --lg-depth-content: 0px;
  --lg-depth-overlay: 4000px;
  --lg-material-trigger: focus;
  --lg-focus-type: gaze;
  --lg-minimize-trigger: gaze-away;
  --lg-specular-response: head-driven;
}

/* watchOS — minimal, glanceable */
[data-platform="watchos"] {
  --lg-shape-mode: capsule;
  --lg-control-height: 36px;
  --lg-material-intensity: minimal;
  --lg-sidebar-enabled: false;
  --lg-nav-type: crown-stack;
  --lg-interactive-feedback: haptic;
  --lg-shadow-scale: 0.5;
  --lg-icon-mask: circle;
}

/* tvOS — focus materialization, safe areas */
[data-platform="tvos"] {
  --lg-shape-mode: capsule;
  --lg-control-height: 60px;
  --lg-control-height-lg: 80px;
  --lg-material-trigger: focus;
  --lg-focus-type: directional;
  --lg-sidebar-enabled: true;
  --lg-safe-h: 60px;
  --lg-safe-v: 40px;
  --lg-shadow-scale: 0.8;
}
```

```js
/* Platform detection — run in <head> before first paint */
(function resolvePlatform() {
  const explicit = window.LIQUID_GLASS_PLATFORM;
  if (explicit) return set(explicit);
  const ua = navigator.userAgent;
  if (/iPad/.test(ua)) return set('ipados');
  if (/iPhone/.test(ua)) return set('ios');
  if (/Mac/.test(ua) && !/iPhone|iPad/.test(ua)) {
    return set(matchMedia('(pointer: coarse)').matches && innerWidth >= 1024
      ? 'ipados' : 'macos');
  }
  if (/Apple TV/.test(ua)) return set('tvos');
  if (/Watch/.test(ua)) return set('watchos');
  set('ios'); // default: largest addressable audience
  function set(p) { document.documentElement.dataset.platform = p; }
})();
```

#### 14.3.2 Shape, Material, and Spacing Token Adaptation

Components MUST consume platform tokens through abstractions rather than hardcoding per-platform branches:

```css
/* Component-level consumption — platform-agnostic */
.lg-button {
  border-radius: var(--lg-shape-current, var(--lg-shape-mode, 9999px));
  height: var(--lg-control-height);
  background: var(--lg-glass-material);
  opacity: var(--lg-material-opacity, 0.65);
}

/* macOS shape size routing */
[data-platform="macos"] .lg-button--sm {
  --lg-shape-current: var(--lg-shape-sm);
}
[data-platform="macos"] .lg-button--lg {
  --lg-shape-current: var(--lg-shape-lg);
}

/* Focus-driven materialization (tvOS + visionOS) */
[data-platform="tvos"] .lg-button,
[data-platform="visionos"] .lg-button {
  --lg-material-opacity: 0.25;
}
[data-platform="tvos"] .lg-button:focus,
[data-platform="visionos"] .lg-button:focus {
  --lg-material-opacity: 0.85;
  transform: scale(1.08);
  transition: all 0.3s var(--lg-spring-focus);
}

/* Shadow scaling per platform */
.lg-glass-panel {
  box-shadow:
    0 4px calc(8px * var(--lg-shadow-scale)) var(--lg-shadow-color),
    0 12px calc(24px * var(--lg-shadow-scale)) var(--lg-shadow-color-deep);
}
```

| Token | iOS | iPadOS | macOS | visionOS | watchOS | tvOS |
|-------|-----|--------|-------|----------|---------|------|
| `--lg-shape-primary` | Capsule | Capsule | RoundedRect (S/M) / Capsule (L/XL) | 3D Capsule | Capsule (subtle) | Capsule |
| `--lg-control-height` | 44px | 44px | 28–56px (size ladder) | 44px | 36px | 60–80px |
| `--lg-material-trigger` | Always | Always | Always | Focus (gaze) | Always | Focus (remote) |
| `--lg-minimize-trigger` | Scroll | Resize | Window-size | Gaze-away | N/A | N/A |
| `--lg-ambient-reflection` | false | true (sidebars) | true (sidebars) | Full spatial | false | false |
| `--lg-shadow-scale` | 1.0 | 1.3 | 1.2 | Depth-based | 0.5 | 0.8 |
| `--lg-search-position` | Bottom | Top-right | Top-right | Spatial | N/A | Top |
| `--lg-icon-mask` | RoundedRect | RoundedRect | RoundedRect | RoundedRect | Circle | RoundedRect |
| `--lg-scroll-edge` | Soft | Soft | Hard | N/A | N/A | N/A |

Components MUST NOT branch on `data-platform` directly. They consume abstracted tokens (`--lg-shape-current`, `--lg-material-opacity`, `--lg-shadow-scale`) whose values are set by the platform mode selectors. Adding a new platform requires only new token overrides, not component changes — preserving the "expressions, not exceptions" contract across the system.[^65^][^1^]

---

## 15. Stage M — Haptics, Gestures & Input

Liquid Glass treats haptic feedback as an essential information channel — every state change, boundary collision, and confirmation event produces a corresponding physical sensation reinforcing the glass metaphor. Apple's Taptic Engine, a linear actuator producing precise short taps rather than the buzzing of traditional ERM motors, forms the hardware foundation [^557^]. On platforms lacking a Taptic Engine, web implementations **MUST** degrade through the Vibration API with graceful silent fallback. This section specifies the haptic-to-UI mapping, gesture thresholds, pointer magnetism mechanics, and touch target minima defining Liquid Glass's input layer.

### 15.1 Haptic Feedback Mapping

#### 15.1.1 Five Impact Styles and Three Notification Types

Apple's haptic vocabulary organizes into three categories: Impact patterns simulating physical collisions, Notification patterns signaling task outcomes, and Selection patterns providing feedback during value changes [^557^]. The five impact styles carry semantic weight — Light for small objects, Medium for medium collisions, Heavy for large objects, Rigid for hard surfaces, Soft for flexible materials — while three notification types (Success, Warning, Error) communicate operation outcomes through distinct rhythmic patterns [^557^]. System UI components including toggles, sliders, pickers, and switches automatically play Apple-designed haptics without explicit developer configuration [^557^]. SwiftUI's iOS 17 `.sensoryFeedback()` modifier extends this vocabulary with semantic types including `.increase`, `.decrease`, `.start`, `.stop`, `.alignment`, and `.levelChange` [^614^][^617^].

| Haptic Pattern | Weight/Type | UI Context | Native API | Web Vibration Equivalent |
|---|---|---|---|---|
| Light Impact | `.light` | Button tap, edge swipe, scroll boundary | `UIImpactFeedbackGenerator(style: .light)` | `[10]` |
| Medium Impact | `.medium` | Prominent button, pull-to-refresh, Haptic Touch | `UIImpactFeedbackGenerator(style: .medium)` | `[20]` |
| Heavy Impact | `.heavy` | Large CTA, destructive confirmation | `UIImpactFeedbackGenerator(style: .heavy)` | `[30]` |
| Rigid Impact | `.rigid` | Keyboard press, snap-to-grid | `UIImpactFeedbackGenerator(style: .rigid)` | `[15]` |
| Soft Impact | `.soft` | Rubber-band edge, spring release | `UIImpactFeedbackGenerator(style: .soft)` | `[25]` |
| Success | `.success` | Validation passed, Face ID, Apple Pay | `UINotificationFeedbackGenerator()` | `[50, 30, 50]` |
| Warning | `.warning` | Destructive alert, undo prompt | `UINotificationFeedbackGenerator()` | `[40, 20, 40]` |
| Error | `.error` | Validation failed, network error | `UINotificationFeedbackGenerator()` | `[30, 20, 30, 20, 30]` |
| Selection | `.selection` | Picker tick, slider change, toggle | `UISelectionFeedbackGenerator()` | `[5]` |

The haptic-to-UI mapping **MUST** be one-to-one: each interaction triggers exactly one pattern. Multiple simultaneous haptics create perceptual noise. Implementations **MUST** enforce a 100ms cooldown between triggers to prevent rapid-fire vibration on scroll-boundary hits.

#### 15.1.2 Vibration API Fallback Strategy

The Web Vibration API exposes `navigator.vibrate(pattern)` accepting vibration/pause durations in milliseconds — substantially less expressive than the Taptic Engine. The protocol defines a degradation ladder mapping each native haptic to the closest Vibration API equivalent while preserving core information content.

```javascript
/** Liquid Glass Haptic Controller — maps iOS patterns to Web Vibration API */
class LiquidGlassHaptics {
  lastTrigger = 0;
  cooldownMs = 100;
  patterns = {
    light: [10], medium: [20], heavy: [30], rigid: [15], soft: [25],
    success: [50, 30, 50], warning: [40, 20, 40],
    error: [30, 20, 30, 20, 30], selection: [5],
  };
  trigger(name) {
    const now = performance.now();
    if (now - this.lastTrigger < this.cooldownMs) return;
    this.lastTrigger = now;
    const pat = this.patterns[name];
    if (pat && 'vibrate' in navigator) navigator.vibrate(pat);
    // Silent fallback on unsupported platforms
  }
  get isAvailable() { return 'vibrate' in navigator; }
}
const glassHaptics = new LiquidGlassHaptics();
// Usage: glassHaptics.trigger('medium');
```

The `navigator.vibrate()` call **MUST** be wrapped in a user-gesture context on iOS Safari, which blocks vibration from non-gesture execution contexts. The `isAvailable` check **MUST NOT** gate UI functionality — haptics are enhancement, not requirement. Silent degradation is mandatory: if vibration is unavailable, the interface functions identically without error.

### 15.2 Gestures & Interactions

#### 15.2.1 Edge Swipe: 1300pt/sec Velocity, 50% Progress Threshold

The interactive pop gesture uses a `UIScreenEdgePanGestureRecognizer` on the leading screen edge [^607^][^612^]. Two numeric thresholds determine completion: a velocity threshold of approximately 1300 points/sec triggers auto-completion regardless of progress if the finger exceeds this speed at release, while a 50% progress threshold serves as the fallback criterion when velocity is below 1300pt/sec [^607^]. These thresholds encode intentional interaction physics — 1300pt/sec corresponds to a decisive flick, filtering accidental edge contact. Web implementations **MUST** adopt identical thresholds for sheet dismissals and modal pop gestures.

#### 15.2.2 Pointer Magnetism: Visual + Movement Mechanisms

Pointer magnetism provides two coordinated effects [^555^]. Visual magnetism is purely cosmetic — controls appear to move toward the cursor when hovered, creating the illusion of centered targeting without changing pointer position. Movement magnetism affects real pointer behavior: on quick trackpad swipes, the system projects the pointer's inertia path, scans in a circular radius around the projected landing point, and snaps to the nearest target in the swipe direction [^555^]. This mechanic **MUST NOT** activate on slow, precise movements. Adaptive precision extends the behavior to snap to discrete intervals, such as 15-minute blocks in Calendar [^555^]. Web implementations **SHOULD** simulate visual magnetism through CSS `:hover` transforms on `pointer: fine` devices; movement magnetism is optional progressive enhancement.

#### 15.2.3 Hover States: Highlight, Lift, and Hover Effects

iPadOS defines three pointer effects for distinct control categories [^555^][^561^]. **Highlight** — default for small controls without backgrounds — morphs the pointer into a rounded rectangle behind the control with parallax content scaling and specular light showing the true pointer position. **Lift** — for buttons with backgrounds — makes the control appear to lift off-screen with shadow while the pointer merges with the control shape. **Hover** — for large objects where morphing would be disruptive — changes appearance through scale or tint while the pointer retains its default shape [^555^].

```css
/* Highlight: small controls (bar buttons, tab items) */
@media (any-hover: hover) and (pointer: fine) {
  .glass-highlight {
    position: relative;
    transition: transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  .glass-highlight::before {
    content: ''; position: absolute; inset: -6px;
    border-radius: var(--radius-m, 10px);
    background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
    opacity: 0; transform: scale(0.9);
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: -1;
  }
  .glass-highlight:hover::before { opacity: 1; transform: scale(1); }
  .glass-highlight:hover { transform: scale(1.04); }
}

/* Lift: buttons with backgrounds */
@media (any-hover: hover) and (pointer: fine) {
  .glass-lift {
    transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),
                box-shadow 0.3s ease;
  }
  .glass-lift:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 32px rgba(0,0,0,0.2);
  }
}
```

The `@media (any-hover: hover) and (pointer: fine)` query **MUST** guard all hover effects — iPadOS Safari matches this only when a trackpad or mouse is connected [^560^]. Applying hover on touch devices produces stuck states. The `pointer: fine` component excludes coarse-pointer environments.

### 15.3 Context Menus & Input

#### 15.3.1 Long-Press and Secondary Click for Expanded Menus

`UIContextMenuInteraction` supports long-press on all modern iOS devices and secondary click (two-finger tap or right-click) on iPad with trackpad [^585^]. Apple discontinued 3D Touch with iPhone 11, replacing it with Haptic Touch responding to duration rather than force [^570^]. On iPhone portrait, context menus stack preview and actions vertically; on iPad, they display side-by-side [^584^][^587^]. Liquid Glass iOS 26 introduces expanded vertical scannable menus for text editing, converting edit menus into single-column lists for improved scannability [^18^]. Web implementations **SHOULD** adopt vertical scannable layouts with 44pt minimum row heights per action.

#### 15.3.2 Pull-to-Refresh: Haptic Coordination

Pull-to-refresh uses `UIRefreshControl` with built-in haptic feedback triggering at the activation threshold — a medium-intensity impact coordinated with the spinner's snap from elastic deformation to continuous rotation [^578^]. The trigger threshold **MUST** be 60pt of vertical overscroll. Below: release aborts; above: refresh commits and haptic fires. This threshold balances discoverability against accidental activation.

#### 15.3.3 Touch Targets: 44×44pt Minimum

Apple's HIG specifies 44×44pt as the minimum touch target, calibrated to match the average fingertip contact area [^410^][^567^]. The visual element **MAY** be smaller than 44pt via padding expansion [^572^]. Research indicates 50px (~10mm) as the most comfortable button size; Apple's visionOS raises the minimum to 60pt for less precise input [^410^].

| Gesture | Trigger Zone | Velocity Threshold | Progress Threshold | Haptic | Availability |
|---|---|---|---|---|---|
| Edge swipe (pop) | Leading edge, 20pt | 1300 pt/sec | 50% | Light impact | iOS 7+ |
| Swipe-to-delete | Horizontal on row | None | Full reveal | Light impact | iOS 11+ |
| Long press | Any control | None | 0.5s | Medium impact | iOS 13+ |
| Pull-to-refresh | Vertical overscroll | None | 60pt travel | Medium impact | iOS 10+ |
| Two-finger swipe | Two fingers on list | None | Per-row | None | iOS 13+ |
| Scroll-down minimize | Finger scroll down | 50 pt/sec | Tab hidden | None | iOS 26+ |
| Scroll-up expand | Finger scroll up | 50 pt/sec | Tab visible | None | iOS 26+ |
| Pinch zoom boundary | Two-finger pinch | None | Min/max scale | Light impact | iOS 10+ |
| Pointer magnetism snap | Trackpad quick swipe | >1300 pt/sec | Circular scan | None | iPadOS 13.4+ |
| Secondary click | Right-click | None | Immediate | Selection | iPadOS 13.4+ |

Liquid Glass iOS 26 introduces scroll-driven tab bars: scrolling down minimizes the bar for content space; scrolling up or tapping restores it [^18^][^574^]. The `.tabBarMinimizeBehavior(.onScrollDown)` modifier activates at 50pt/sec — lower than edge swipe because continuous scrolling involves different intent than discrete dismissal [^16^][^574^]. This minimize gesture **MUST** not interfere with pull-to-refresh, which claims priority within 60pt of the content top.

```css
:root {
  --touch-target-minimum:     44px;  /* Apple HIG hard minimum */
  --touch-target-preferred:   48px;  /* Primary actions */
  --touch-target-comfortable: 56px;  /* Hero buttons */
  --icon-visual-size:         24px;  /* Inside 44pt tap area */
  --icon-touch-area:          44px;
  --spacing-interactive-min:   8px;
  --edge-swipe-trigger-zone:  20px;
  --long-press-duration:      500ms;
  --pull-to-refresh-threshold: 60px;
}
.touch-target {
  min-width: var(--touch-target-minimum);
  min-height: var(--touch-target-minimum);
}
.icon-button {
  width: var(--icon-visual-size); height: var(--icon-visual-size);
  padding: calc((var(--icon-touch-area) - var(--icon-visual-size)) / 2);
  box-sizing: content-box;
}
```

Notably, iPad lacks a Taptic Engine and does not support haptic feedback [^618^], creating a cross-platform inconsistency. The `LiquidGlassHaptics` class handles this through silent degradation — visual and auditory feedback carry the load that haptics provide on iPhone.

---

## 16. Complete Token Scale

### 16.1 Reference Token Architecture

#### 16.1.1 Named role-based tokens for outermost shapes only — all others derived at runtime

Only three radius tokens carry semantic names; every other rounded rectangle derives its geometry at runtime via `childRadius = max(0, parentRadius - gap)` [^41^] [^65^]. This eliminates magic-number proliferation and guarantees nested elements trace to a single radial origin [^70^]. Role-based tokens exist solely for the outermost shape in any concentric chain — the element with no parent to derive from. The naming convention `--radius-{role}` maps to structural position: `window` for root shells, `sheet` for modals, `card` for panels and grouped containers [^65^]. Platform variants (`--radius-card-ios`, `--radius-card-macos`) are selected at build time or via `@supports` gates. Every radius below these three roots MUST be computed.

#### 16.1.2 The token graph: spacing drives shape, shape drives elevation, elevation drives material

The four token categories form a directed dependency: spacing values determine the gap input to the concentric formula, producing resolved shape radii; resolved shapes define container boundaries that set shadow spread and elevation level; elevation selects material thickness through `thickness → opacity → elevation` [^5^]. Spacing tokens are build-time static. Derived radii are runtime-dynamic — recomputed on layout shifts, DOM mutations, and resize events [^65^]. Elevation shadow values are static, but the active elevation assigned depends on runtime context (floating over text vs. solid background) [^79^]. Material tokens are fully adaptive and cannot be captured in a static table.

### 16.2 Token Tables

#### 16.2.1 Radius tokens

Three role-based tokens anchor the shape system. Each carries a base value for circular arcs and a continuous variant for `corner-shape: superellipse(2)` environments where squircle perceptual roundness demands a larger numeric radius [^62^].

| Token | Base | Continuous | Target Element | iOS / iPadOS | macOS |
|---|---|---|---|---|---|
| `--radius-window` | 24pt | 32pt | Root shell, PWA window | Capsule + margin [^15^] | Concentric, window-aligned |
| `--radius-sheet` | 20pt | 28pt | Modal sheets, panels | Capsule with edge margin | Rounded rect / Capsule |
| `--radius-card` | 16pt | 24pt | Cards, grouped containers | Capsule [^58^] | Rounded rect (S/M), Capsule (L+) |
| `--radius-sm` | 12pt | — | Badges, chips | — | — |
| `--radius-xs` | 8pt | — | Minimum visible radius | — | — |

The continuous variant SHOULD differ by one scale step — continuous corners at 24px read as equivalent to circular arcs at 16px [^62^]. The `@supports` gate applying the continuous variant MUST override only `border-radius` and `corner-shape`. Capsule shapes (`radius = height / 2`) bypass this table entirely [^65^].

```css
:root {
  --radius-window: 24pt;   --radius-window-continuous: 32pt;
  --radius-sheet: 20pt;    --radius-sheet-continuous: 28pt;
  --radius-card: 16pt;     --radius-card-continuous: 24pt;
  --radius-sm: 12pt;       --radius-xs: 8pt;
}
@supports (corner-shape: superellipse(2)) {
  :root {
    --radius-window: var(--radius-window-continuous);
    --radius-sheet: var(--radius-sheet-continuous);
    --radius-card: var(--radius-card-continuous);
  }
}
```

#### 16.2.2 Spacing tokens

An 11-step scale on an 8-point base grid with a 4-point sub-grid for internal component spacing [^1^] [^2^]. Inter-component spacing uses only 8-point multiples.

| Token | Value | Usage Context |
|---|---|---|
| `--spacing-xxs` | 4pt | Icon button inset, chip padding |
| `--spacing-xs` | 8pt | Default inter-element gap |
| `--spacing-sm` | 12pt | Small component padding |
| `--spacing-md` | 16pt | Compact screen margin, card padding |
| `--spacing-lg` | 20pt | Regular screen margin, iPad margins |
| `--spacing-xl` | 24pt | Content block separation |
| `--spacing-2xl` | 32pt | Header/footer height |
| `--spacing-3xl` | 40pt | Large container padding |
| `--spacing-4xl` | 48pt | Hero section padding |
| `--spacing-5xl` | 56pt | Prominent action button heights |
| `--spacing-6xl` | 64pt | Major structural spacing |

```css
:root {
  --spacing-unit: 4pt;     --spacing-grid: 8pt;
  --spacing-xxs: 4pt;      --spacing-xs: 8pt;
  --spacing-sm: 12pt;      --spacing-md: 16pt;
  --spacing-lg: 20pt;      --spacing-xl: 24pt;
  --spacing-2xl: 32pt;     --spacing-3xl: 40pt;
  --spacing-4xl: 48pt;     --spacing-5xl: 56pt;
  --spacing-6xl: 64pt;
}
```

The gap input to the concentric formula MUST be the actual measured perpendicular distance, not assumed padding [^41^]. `NSStackView` encodes the 8-point expectation with its default `spacing` of 8.0 points [^19^].

#### 16.2.3 Motion tokens

Spring presets map Apple's iOS 17+ physics model to CSS timing functions [^291^], supplemented by a duration scale. The legacy `response` / `dampingFraction` model coexists; `duration` / `bounce` is the preferred API [^308^].

| Token | CSS Value | Duration | Bounce | Usage |
|---|---|---|---|---|
| `--spring-snappy` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 0.25s | 0.05 | Button, toggle, tab [^286^] |
| `--spring-smooth` | `cubic-bezier(0.25, 0.1, 0.25, 1.0)` | 0.35s | 0 | Navigation, panel expand |
| `--spring-bouncy` | `cubic-bezier(0.68, -0.6, 0.32, 1.6)` | 0.5s | 0.2 | Hero, playful UI |
| `--spring-lively` | `cubic-bezier(0.68, -0.6, 0.32, 1.6)` | 0.32s | 0.15 | Energetic reveals [^11^] |
| `--duration-instant` | 0ms | — | — | Reduced-motion snap |
| `--duration-fast` | 150ms | — | — | Hover feedback |
| `--duration-normal` | 300ms | — | — | Standard transition |
| `--duration-medium` | 400ms | — | — | Modal/sheet |
| `--duration-slow` | 550ms | — | — | Materialization |
| `--duration-dramatic` | 900ms | — | — | Hero transition |

```css
:root {
  --spring-snappy: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-smooth: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  --spring-bouncy: cubic-bezier(0.68, -0.6, 0.32, 1.6);
  --spring-lively: cubic-bezier(0.68, -0.6, 0.32, 1.6);
  --duration-instant: 0ms;     --duration-fast: 150ms;
  --duration-normal: 300ms;    --duration-medium: 400ms;
  --duration-slow: 550ms;      --duration-dramatic: 900ms;
}
```

Gesture-driven animations MUST use a JavaScript spring library (Framer Motion, Motion.dev) for velocity preservation and interruptibility [^334^] [^337^]. All animation code MUST check `prefers-reduced-motion: reduce` and snap instantly when active [^326^].

#### 16.2.4 Elevation tokens

The SAP Fiori for iOS design system — built with Apple — provides the closest public shadow specification [^238^]. Dark mode collapses all levels to a uniform 2px contact shadow.

| Token | Light Mode Value | Usage |
|---|---|---|
| `--elevation-0` | `0px 0px 2px 0px rgba(0,0,0,0.13)` | Sheets, grounded panels |
| `--elevation-1` | `0px 0px 2px 0px rgba(0,0,0,0.13), 0px 1px 4px 0px rgba(0,0,0,0.04)` | Default cards |
| `--elevation-2` | `0px 0px 2px 0px rgba(0,0,0,0.13), 0px 2px 8px 0px rgba(0,0,0,0.04)` | Elevated cards |
| `--elevation-3` | `0px 0px 2px 0px rgba(0,0,0,0.13), 0px 8px 16px 0px rgba(0,0,0,0.04), 0px 16px 32px 0px rgba(0,0,0,0.04)` | Toasts, menus |
| `--elevation-4` | `0px 0px 2px 0px rgba(0,0,0,0.04), 0px 8px 16px 0px rgba(0,0,0,0.04), 0px 10px 100px 0px rgba(0,0,0,0.20)` | Popovers |

```css
:root {
  --elevation-0: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
  --elevation-1: 0px 0px 2px 0px rgba(0, 0, 0, 0.13), 0px 1px 4px 0px rgba(0, 0, 0, 0.04);
  --elevation-2: 0px 0px 2px 0px rgba(0, 0, 0, 0.13), 0px 2px 8px 0px rgba(0, 0, 0, 0.04);
  --elevation-3: 0px 0px 2px 0px rgba(0, 0, 0, 0.13), 0px 8px 16px 0px rgba(0, 0, 0, 0.04), 0px 16px 32px 0px rgba(0, 0, 0, 0.04);
  --elevation-4: 0px 0px 2px 0px rgba(0, 0, 0, 0.04), 0px 8px 16px 0px rgba(0, 0, 0, 0.04), 0px 10px 100px 0px rgba(0, 0, 0, 0.20);
}
@media (prefers-color-scheme: dark) {
  :root {
    --elevation-0: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
    --elevation-1: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
    --elevation-2: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
    --elevation-3: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
    --elevation-4: 0px 0px 2px 0px rgba(0, 0, 0, 0.13);
  }
}
```

Shadow intensity follows a clear progression from 2px contact at Level 0 to 100px blur at 20% opacity for Level 4 popovers [^238^]. Apple's web design system uses one shadow only — `rgba(0, 0, 0, 0.22) 3px 5px 30px 0` — reserved for product photography, never UI [^266^].

---

## 17. Complete Failure Matrix

The Liquid Glass protocol operates on one invariant: **every feature MUST degrade to a valid, accessible rendering when any capability is absent or overridden**. The matrix below consolidates all 22 degradation paths across geometry, color/material, accessibility, motion, and platform adaptation into a single reference. Every row is a protocol requirement.

### 17.1 Comprehensive Failure Matrix

| ID | Scenario | Domain | Trigger | Fallback Behavior | Implementation |
|---|---|---|---|---|---|
| F01 | `corner-shape` unsupported | Geometry | Browser lacks `corner-shape` (Safari, Firefox, pre-Chromium 139) [^103^] | Standard circular `border-radius` with base token; `@supports` gate MAY apply enhanced radius for continuous case [^48^] | `@supports (corner-shape: superellipse(2))` block |
| F02 | Squircle generation unavailable | Geometry | `figma-squircle` fails to load, `clip-path: path()` unsupported, or JS error | Plain `border-radius` with token value; MUST NOT attempt partial Bézier reconstruction [^52^] | `try/catch` around `getSvgPath`; on error set `border-radius` |
| F03 | No radius-bearing ancestor | Geometry | Child declares `data-radius-role="concentric"` but no ancestor carries `--radius` | `parentRadius` = 0; child resolves square corner (`max(0, 0 - gap) = 0`) [^41^] | `getComputedStyle` returns `0px`; `max()` resolves to 0 |
| F04 | `ResizeObserver` unavailable | Geometry | Browser lacks `ResizeObserver` (legacy/embedded) | Static squircle path at mount; no dynamic recomputation [^38^] | Feature-detect `window.ResizeObserver`; skip if absent |
| F05 | Canvas CORS taint | Color | `getImageData()` throws `SecurityError` on cross-origin image [^493^] | Skip extraction; use static color ramp for affected element | `try/catch` around `ctx.getImageData`; catch → abort |
| F06 | Source image load failure | Color | `<img>` fires `error` (404, network timeout, broken URL) | Static color ramp; no extraction attempt [^493^] | Listen for `img.onerror`; set fallback class |
| F07 | Contrast cannot clear 4.5:1 | Color | L-channel search reaches `lMin`/`lMax` before WCAG 4.5:1 clears [^630^] | Static token for that role; hard floor — never ship non-compliant surface [^25^] | Return `null` from `enforceContrast`; apply `--color-static-*` |
| F08 | Extraction timeout | Color | Pipeline exceeds 50 ms mobile guard mid-computation | Abort; apply static ramp [^493^] | `performance.now()` checkpoint; abort if > 50 ms |
| F09 | Zero total weight | Color | All sampled pixels have saturation = 0; `sumWeight === 0` [^631^] | Static color ramp; weighted average undefined | Guard clause returns `null`; pipeline aborts |
| F10 | `backdrop-filter` unsupported | Material | Browser lacks `backdrop-filter` (IE11, legacy Android) [^465^] | Solid semi-transparent background at 85–95% opacity | `@supports` with prefixed and unprefixed detection |
| F11 | `prefers-contrast: more` | Accessibility | OS-level increased contrast enabled [^479^] [^504^] | Bypass extraction entirely; static 7:1 ramp; 2 px borders [^440^] | `@media (prefers-contrast: more)` overrides extraction vars |
| F12 | `prefers-reduced-transparency` | Accessibility | OS-level reduced transparency enabled [^455^] | Remove blur; raise scrim to 92%; keep adaptive hue [^499^] | `@media (prefers-reduced-transparency: reduce)` |
| F13 | `prefers-reduced-motion` | Motion | OS-level reduced motion enabled [^481^] | Instant snap to end-state (0 ms); no interpolation frames [^321^] | `@media (prefers-reduced-motion: reduce)` 0.01 ms override |
| F14 | `inverted-colors` active | Accessibility | System color inversion enabled (iOS/macOS) | Disable backdrop filter; solid neutral background | `@media (inverted-colors: inverted)` override |
| F15 | Bold Text enabled | Accessibility | `UIAccessibility.isBoldTextEnabled` / equivalent [^479^] | Minimum `font-weight: 600` on all text elements | `--bold-text-enabled: 1` drives weight `calc(400 + 200 * var(--flag))` |
| F16 | Button Shapes enabled | Accessibility | `accessibilityShowButtonShapes` / proxy via contrast [^460^] | 2 px solid borders; opaque fills; underlines on actions | `--button-shapes-enabled: 1` drives border calc |
| F17 | Platform detection fails | Platform | `navigator.userAgent` unparseable or `data-platform` unset | Default to iOS token set (largest audience) [^65^] | Detection IIFE final branch: `set('ios')` |
| F18 | `localStorage` quota exceeded | Color | Cache persistence exceeds storage budget | In-memory `Map` continues; no cross-session cache [^493^] | `try/catch` on `localStorage.setItem`; silent continue |
| F19 | Gesture velocity unavailable | Motion | Pointer/touch returns zero/undefined velocity | Default snappy preset (`duration: 0.25, bounce: 0.05`) [^286^] | Velocity check: if `|v| < 1`, use preset |
| F20 | CSS `spring()` unsupported | Motion | `spring()` timing function unavailable in browser | Cubic-bezier or `linear()` piecewise spring [^317^] [^325^] | `CSS.supports()` feature-detect |
| F21 | Glass-on-glass stacking | Composition | Child applies glass on ancestor already bearing `backdrop-filter` | Standard material (non-glass fill + vibrancy) for child [^29^] | JS detect ancestor `backdrop-filter !== none` |
| F22 | Legacy device (pre-iPhone 11) | Platform | Hardware cannot render lensing at performance target | Frosted glass fallback (static blur + reduced refraction) [^16^] | Hardware capability check override |

Three rows are non-negotiable. F07 (contrast cannot clear 4.5:1) is a **hard floor** — shipping a non-compliant surface is a violation [^25^]. F11 (`prefers-contrast: more`) takes **highest priority** and MUST bypass extraction before any other logic executes [^504^]. F13 (`prefers-reduced-motion`) MUST use **instant snap at 0 ms** [^310^]. All three MUST be tested explicitly.

The progressive enhancement principle is enhance never gate. The base rendering — solid backgrounds, standard borders, static colors, no animation — is always valid. Each layer (continuous corners, adaptive color, glass blur, spring physics) adds fidelity when supported and removes silently when absent. The CSS cascade implements this with `@supports` blocks and media queries:

```css
.liquid-glass { background: var(--surface-static); border-radius: var(--radius-base); }
@supports (corner-shape: superellipse(2)) { .liquid-glass { corner-shape: superellipse(2); } }
@supports (backdrop-filter: blur(20px)) {
  .liquid-glass { backdrop-filter: blur(20px) saturate(160%); background: var(--surface-adaptive); }
}
@media (prefers-contrast: more) { .liquid-glass { --adaptive-extraction: disabled; border: 2px solid; } }
@media (prefers-reduced-transparency: reduce) { .liquid-glass { backdrop-filter: none; } }
@media (prefers-reduced-motion: reduce) { .liquid-glass { transition: none !important; } }
```

Every `@supports` block and media query corresponds to a matrix row, making compliance verification a matter of tracing rules back to their failure ID.

---

## 18. Complete Validation Checklist

This checklist consolidates every protocol requirement into a single pre-ship audit. All items **MUST** pass; they are ordered by dependency within each category.

### 18.1 Geometry & Shape

- [ ] No nested element has a hand-authored radius — all derive from Stage B `max(0, parentRadius - gap)` [^41^]
- [ ] No magic-number radius exists outside the named reference scale (`--radius-window`, `--radius-sheet`, `--radius-card`) [^1^]
- [ ] Every continuous-corner surface degrades to valid plain `border-radius` without `corner-shape` or JS [^102^]
- [ ] Concentric derivation applied pairwise per boundary, clamped to ≥ 0 before CSS injection [^47^] [^70^]
- [ ] iOS/iPadOS interactive elements use capsules (`border-radius: 9999px`); macOS Mini/Small/Medium use rounded rectangles [^65^] [^314^]

### 18.2 Color & Material

- [ ] No new hex/RGB literals in `.css` files — only existing static fallback tokens [^258^]
- [ ] All adaptive values flow through Stage 3 contrast enforcement (WCAG ≥ 4.5:1) before injection [^440^]
- [ ] Existing CSS variable names reused; no parallel `--adaptive-*` namespace created [^258^]
- [ ] Static fallback renders correctly with JS disabled [^5^]
- [ ] No glass-on-glass stacking — content layer uses standard materials, navigation uses Liquid Glass only [^79^]
- [ ] Glass material uses `backdrop-filter: blur(20px) saturate(160%)` within 16–24px range; vibrant text colors on all glass [^449^] [^5^]
- [ ] `prefers-contrast: more` disables adaptive extraction, uses static high-contrast ramp [^504^]
- [ ] `prefers-reduced-transparency` removes blur, renders at ~92% opacity, keeps adaptive hue [^479^]
- [ ] `prefers-reduced-motion` makes crossfade 0ms instant swap; no auto-starting animations [^481^]
- [ ] CORS failure on cross-origin image aborts silently to static fallback [^258^]

### 18.3 Typography & Spacing

- [ ] Font stack uses `ui-sans-serif, system-ui, -apple-system`; SF Pro never embedded [^184^]
- [ ] Body text uses Dynamic Type–relative sizing (`rem`), never fixed px [^438^]
- [ ] Body text (17pt) maintains WCAG ≥ 4.5:1; large text (≥ 18pt) ≥ 3:1; line height scales with type size [^440^] [^436^] [^128^]
- [ ] Spacing follows 8-point grid (8, 16, 24, 32, 40, 48, 56, 64pt); margins 16pt Compact / 20pt Regular [^1^] [^4^]

### 18.4 Depth, Shadow & Layering

- [ ] Content and navigation layers strictly separated — no Liquid Glass on lists, tables, or media [^79^]
- [ ] One shadow layer per floating element, opacity adapting to background; `z-index` hierarchy content (0) < chrome (10) < overlays (20) [^79^] [^238^]
- [ ] Regular glass for standard controls; Clear variant only over media with dimming layer and bold foreground [^79^]

### 18.5 Motion & Physics

- [ ] All animations respect `prefers-reduced-motion: reduce` — instant snap, no interpolation [^481^]
- [ ] Spring animations within response 0.3–0.9, dampingFraction 0.5–0.95; crossfades interpolate in HSL [^10^] [^258^]
- [ ] Elastic/bounce interactions fully disabled under reduced motion [^475^]

### 18.6 Components & Controls

- [ ] Button heights match control size: Mini ~20pt, Small ~28pt, Regular ~32pt, Large ~44pt, X-Large ~56pt [^314^]
- [ ] Primary actions use prominent (opaque, tinted); secondary uses glass (translucent); confirmations always prominent [^96^]
- [ ] Toolbar image buttons share grouped glass background; text buttons have separate backgrounds [^258^]
- [ ] Touch feedback (scale, shimmer) on all interactive elements via `.interactive()` or CSS `:active` equivalent [^34^]

### 18.7 Icons & Symbols

- [ ] Toolbar and control icons use SF Symbols or equivalent, weight-matched to adjacent text [^258^]
- [ ] Icon symbols scale with Dynamic Type; transitions animate between semantically related pairs [^438^] [^374^]

### 18.8 Cross-Platform & Touch

- [ ] iOS/iPadOS buttons, tabs, pills use capsules; macOS small/medium controls use rounded rectangles [^1^] [^65^]
- [ ] All touch targets ≥ 44×44pt; focus indicators visible with ≥ 2px offset outlines [^433^] [^440^]
- [ ] No information conveyed by color alone; `inverted-colors` disables `backdrop-filter` [^23^] [^504^]

### 18.9 Haptics & Input

- [ ] Button taps trigger Light impact (or CSS `:active` equivalent); toggles trigger selection feedback [^557^]
- [ ] Destructive actions trigger Warning notification before completion [^557^]
- [ ] Edge swipes use ~1300 pts/sec velocity and 50% progress threshold; hover states on pointer platforms [^607^]