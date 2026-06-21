# Liquid Glass Platform — Complete Protocol for Apple Ecosystem Implementation

## 1. Problem Statement & Design Philosophy (~800 words)
### 1.1 The Curvature Discontinuity Problem
#### 1.1.1 border-radius creates abrupt curvature jumps (0 to 1/r) at splice points — the root cause of "off" corners
#### 1.1.2 Apple's continuous corners are bespoke Bézier patchwork, not pure superellipse — research found systematic discrepancies
### 1.2 The Two-Layer Architecture
#### 1.2.1 Navigation layer (Liquid Glass) floats above content layer — strict separation is the unifying architectural principle
#### 1.2.2 visionOS-first design: Liquid Glass flows backward from spatial computing to flat screens
### 1.3 What This Protocol Covers
#### 1.3.1 Both halves of the Apple feel: curvature-continuous corners + concentric nesting + adaptive color/material + complete design system
#### 1.3.2 Framework-agnostic: any web project, CSS custom property token system

## 2. Non-Negotiable Constraints (~600 words)
### 2.1 Token Governance
#### 2.1.1 No arbitrary magic-number pixel radii — named role-based reference tokens only
#### 2.1.2 No hand-authored nested radii — all derived via concentric formula
### 2.2 Progressive Enhancement
#### 2.2.1 MUST enhance never gate: native CSS where supported, silent fallback everywhere
#### 2.2.2 All derived radii clamped to floor of 0 — negative resolves to square corner
### 2.3 Accessibility First
#### 2.3.1 WCAG 4.5:1 contrast ratio enforced mathematically, never eyeballed
#### 2.3.2 All animations respect prefers-reduced-motion as instant snap
#### 2.3.3 All glass materials have non-glass accessible equivalents

## 3. Stage A — Corner Curvature: Squircle Generation (~1500 words, 3 tables)
### 3.1 Primary Path: Native CSS corner-shape
#### 3.1.1 border-radius controls extent, corner-shape controls curve kind — separation of concerns
#### 3.1.2 superellipse(1) ≡ round, superellipse(2) ≡ squircle — closest native-CSS approximation to Apple
#### 3.1.3 Chromium 139+ support only — Safari signaled intent, no implementation yet
#### 3.1.4 @supports gate for different radius values when continuous curvature is available
### 3.2 Universal Fallback: Generated Squircle Path
#### 3.2.1 SVG path via bezier-and-arc construction parameterized by cornerRadius + cornerSmoothing
#### 3.2.2 Use published Figma algorithm — MUST NOT re-derive Bézier math independently
#### 3.2.3 Default cornerSmoothing: 0.6 (community-measured Apple approximation, not official)
#### 3.2.4 Recompute on resize via ResizeObserver — squircle geometry is dimension-dependent
### 3.3 The Three Shape Types
#### 3.3.1 Fixed: constant radius regardless of container size — predictable geometry
#### 3.3.2 Capsule: radius = height / 2 — dominant on iOS for buttons, bars, switches
#### 3.3.3 Concentric: radius derived from parent via formula — nested layout alignment

## 4. Stage B — Concentric Radius Derivation (~1000 words, 2 tables)
### 4.1 The Concentric Formula
#### 4.1.1 childRadius = max(0, parentRadius - gap) — applied pairwise at every boundary
#### 4.1.2 gap = actual measured perpendicular distance, normally padding but MUST be real offset
#### 4.1.3 If gap >= parentRadius, child resolves to 0 — correct geometry, not degraded
### 4.2 Platform-Specific Shape Usage
#### 4.2.1 iOS/iPadOS: capsules dominate — buttons, bars, switches all capsule-shaped
#### 4.2.2 macOS: Mini/Small/Medium = rounded rectangles, Large/X-Large = capsules
#### 4.2.3 Root-shell radius: derivation chain starts from true physical edge inward
### 4.3 Runtime Resolver Implementation
#### 4.3.1 Walk from radius-bearing roots downward, measure offset, write resolved --radius
#### 4.3.2 Grandchild radius derived from immediate parent's resolved radius, not recomputed from root

## 5. Stage C — Typography System (~2000 words, 4 tables)
### 5.1 The SF Pro Font Stack
#### 5.1.1 CSS font-family declaration: -apple-system, BlinkMacSystemFont, SF Pro, system-ui fallbacks
#### 5.1.2 Optical sizing: SF Pro Text (<=19pt) vs Display (>=20pt) — transitions 17-28pt via opsz axis
#### 5.1.3 9 weights: Ultralight 100 through Black 900, with CSS font-weight mappings
#### 5.1.4 SF Pro Rounded, SF Compact, SF Mono — usage contexts and web availability
### 5.2 Dynamic Type Scale
#### 5.2.1 12 size classes: Large Title (34pt) through Caption 2 (11pt) with full size/weight/leading/tracking table
#### 5.2.2 CSS clamp() for fluid scaling between minimum and maximum readable sizes
#### 5.2.3 @ScaledMetric equivalent: CSS custom properties that scale with base font size
### 5.3 Text on Glass Materials
#### 5.3.1 4-tier vibrancy: label (default), secondaryLabel, tertiaryLabel, quaternaryLabel
#### 5.3.2 CSS text-shadow and mix-blend-mode equivalents for vibrant text rendering
#### 5.3.3 Liquid Glass bolder text rendering — increased weight for improved clarity

## 6. Stage D — Spacing & Layout Grid (~1500 words, 3 tables)
### 6.1 The 8-Point Grid
#### 6.1.1 Base scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64pt with CSS custom property tokens
#### 6.1.2 4pt sub-grid for internal component spacing; 8pt for inter-component spacing
### 6.2 Safe Areas & Layout Margins
#### 6.2.1 iPhone safe areas: top 59pt (Dynamic Island), bottom 34pt (Home Indicator)
#### 6.2.2 Layout margins: 16pt Compact width / 20pt Regular width — size-class responsive
#### 6.2.3 CSS env(safe-area-inset-*) usage with padding/margin fallbacks
### 6.3 Hardware-Software Concentric Alignment
#### 6.3.1 Device edge handling: capsules with extra margin near edges; concentric at window edges
#### 6.3.2 Readable content guides: max-width 672pt on iPad landscape, 52% container rule

## 7. Stage E — Depth, Shadows & Elevation (~1500 words, 2 tables)
### 7.1 The Adaptive Depth System
#### 7.1.1 Apple's depth is adaptive not fixed — shadow opacity changes based on background content
#### 7.1.2 Material thickness correlates with elevation: thicker = more opaque = higher importance
#### 7.1.3 Glass-on-glass stacking is explicit anti-pattern
### 7.2 Shadow Specifications
#### 7.2.1 Apple uses exactly ONE drop-shadow for product photography only — never on UI
#### 7.2.2 CSS shadow values for 5 elevation levels derived from SAP Fiori iOS proxy
#### 7.2.3 Ambient occlusion: darker edge shading around glass elements (iOS 27+)
### 7.3 Z-Index Hierarchy
#### 7.3.1 Three-layer architecture: base content (0), navigation (2000+), overlay (3000+)
#### 7.3.2 CSS custom property tokens for z-index with semantic naming

## 8. Stage F — Motion, Physics & Animation (~2000 words, 3 tables)
### 8.1 Spring Animation Parameters
#### 8.1.1 Legacy model: response 0.55, dampingFraction 0.825, blendDuration 0
#### 8.1.2 Modern iOS 17+ model: duration + bounce parameters with conversion formulas
#### 8.1.3 CSS cubic-bezier and spring-easing equivalents for web implementation
### 8.2 Timing Curves by Context
#### 8.2.1 .snappy(duration: 0.25) — fast, clean, modern iOS feel
#### 8.2.2 .smooth(duration: 0.35) — soft UI transitions
#### 8.2.3 .spring(response: 0.32, dampingFraction: 0.72) — lively, Apple Music feel
### 8.3 Liquid Glass Specific Animations
#### 8.3.1 Materialization: elements appear by modulating light bending, not fading
#### 8.3.2 Morphing: dynamic transformation between control states via glassEffectID
#### 8.3.3 Crossfade color transitions: 600ms HSL-interpolated (from existing protocol)
### 8.4 Interruptible Transitions & Gestures
#### 8.4.1 Springs preserve velocity when retargeted — gesture-driven animations
#### 8.4.2 prefers-reduced-motion: instant snap to end-state, no interpolation frames

## 9. Stage G — Component Library (~2500 words, 4 tables)
### 9.1 Buttons
#### 9.1.1 Two styles: .glass (translucent secondary) and .glassProminent (opaque primary)
#### 9.1.2 Five sizes: Mini (~20pt), Small (~28pt), Regular (~32pt), Large (~44pt), X-Large (~56pt+)
#### 9.1.3 Platform shapes: capsule on iOS/iPadOS, rounded-rectangle on macOS small sizes
### 9.2 Switches, Sliders & Pickers
#### 9.2.1 Switch: glass droplet thumb transformation on touch
#### 9.2.2 Slider: liquid glass thumb, elastic stretch, momentum preservation, tick marks
#### 9.2.3 Picker: 7 styles (wheel, menu, segmented, inline, navigationLink, palette, radioGroup)
### 9.3 Navigation Bars, Tab Bars & Search
#### 9.3.1 Tab bars: capsule-shaped, floating, inset, minimize on scroll via tabBarMinimizeBehavior
#### 9.3.2 Search: bottom placement on iPhone, morph animation from circle to search field
#### 9.3.3 Toolbar grouping: items grouped via API automatically share glass backgrounds
### 9.4 Sheets, Alerts & Text Input
#### 9.4.1 Sheets: Liquid Glass background, increased corner radius, inset edges
#### 9.4.2 Alerts: in-place expansion from trigger button — springs directly from action
#### 9.4.3 Text fields: Liquid Glass magnifier loupe, expanded vertical context menus

## 10. Stage H — SF Symbols & Iconography (~1500 words, 2 tables)
### 10.1 The Symbol System
#### 10.1.1 6,900+ symbols across 7 versions, 9 weights, 3 scales (Small/Medium/Large)
#### 10.1.2 CSS implementation: SVG symbol library with weight/scale tokens
### 10.2 Rendering Modes
#### 10.2.1 Monochrome, Hierarchical, Palette, Multicolor, Automatic — selection guidance
#### 10.2.2 SF Symbols 7: gradient rendering with single-source linear gradients
### 10.3 Animations & Integration
#### 10.3.1 Draw On/Off animations, Magic Replace with enclosure matching
#### 10.3.2 Symbol-first navigation: bars rely on symbols over text, dedicated Search tab

## 11. Stage I — Glass Material System (~2000 words, 3 tables)
### 11.1 Liquid Glass Variants
#### 11.1.1 .regular: full adaptivity, medium transparency, default for toolbars/buttons/nav
#### 11.1.2 .clear: high transparency, NO adaptive behaviors, requires dimming layer, media-rich only
#### 11.1.3 .identity: no effect, conditional disable for accessibility/feature flags
### 11.2 Standard Materials (Content Layer)
#### 11.2.1 Four levels: ultraThin, thin, regular (default), thick — translucency hierarchy
#### 11.2.2 Thicker = more opaque = better text contrast; thinner = more context visible
#### 11.2.3 CSS backdrop-filter equivalents: blur(20px) saturate(160%) base
### 11.3 Composition Architecture
#### 11.3.1 4-layer stack: Highlights → Content → Material (Liquid Glass) → Shadow
#### 11.3.2 GlassEffectContainer for grouped elements: shared sampling, single render pass
#### 11.3.3 Content-aware shadows: opacity increases over text, decreases over solid backgrounds

## 12. Stage J — Adaptive Color & Glass Composition (~2000 words, 2 tables)
### 12.1 Source Image Sampling
#### 12.1.1 Canvas-based extraction: 24x24 downscale, discard outer 15% margin
#### 12.1.2 Weighted average: weight(pixel) = 0.3 + 0.7 * saturation(pixel) — prevents washout
### 12.2 Perceptual Normalization & Contrast Enforcement
#### 12.2.1 HSL clamping: L in [10-20%] dark / [80-92%] light for secondary; S <= 45%
#### 12.2.2 Binary-search L channel in 1% steps until WCAG 4.5:1 clears — hard floor not warning
### 12.3 Glass Material Composition & Transition
#### 12.3.1 Layer stack: adaptive color base + backdrop-filter blur(20px) saturate(160%) + scrim at 12-18%
#### 12.3.2 prefers-reduced-transparency: skip blur, raise scrim to 92% opacity
#### 12.3.3 Crossfade: 600ms ease-in-out, JS-driven HSL interpolation — CSS custom properties don't transition natively
### 12.4 Caching & Failure Handling
#### 12.4.1 In-memory Map keyed by image URL hash + optional localStorage LRU (200 entries)
#### 12.4.2 Silent fallback to static tokens on any failure — CORS, 404, timeout >50ms, contrast can't clear

## 13. Stage K — Accessibility & Inclusion (~2000 words, 2 tables)
### 13.1 The Accessibility Matrix
#### 13.1.1 VoiceOver: label, hint, value, trait attributes; custom rotor items
#### 13.1.2 Dynamic Type: 12 size classes with CSS clamp() fluid scaling
#### 13.1.3 prefers-contrast: more → disable adaptive extraction entirely, static ramp only
### 13.2 Liquid Glass Specific Concerns
#### 13.2.1 2025 AppleVis Report: Liquid Glass caused significant negative UX for low-vision users
#### 13.2.2 Unified "visual profile" concept: bundle all accessibility settings system-wide with per-app override
#### 13.2.3 Every glass effect MUST have non-glass equivalent — not reduced glass, genuinely accessible
### 13.3 Implementation Requirements
#### 13.3.1 @media (prefers-reduced-motion), (prefers-reduced-transparency), (prefers-contrast: more) CSS implementations
#### 13.3.2 Button Shapes, Bold Text, Increase Contrast — all require dedicated CSS overrides
#### 13.3.3 44pt minimum touch targets maintained regardless of glass styling

## 14. Stage L — Cross-Platform Adaptation (~1500 words, 2 tables)
### 14.1 Platform Matrix
#### 14.1.1 iOS: narrow/vertical, capsules dominate, bottom search, shrinking tab bars
#### 14.1.2 iPadOS: bridge device, sidebar inset with glass, window resizing
#### 14.1.3 macOS: wide canvas, behindWindow blending, rounded rectangles for small sizes
### 14.2 Specialized Platforms
#### 14.2.1 visionOS: spatial origin, depth as hierarchy, focus triggers materialization
#### 14.2.2 watchOS: minimal changes, glanceable info, digital crown
#### 14.2.3 tvOS: focus-based, 60pt/80pt safe areas, focus enlargement triggers glass
### 14.3 CSS Platform Modes
#### 14.3.1 data-platform attribute switching for per-platform tokens
#### 14.3.2 Shape, material, and spacing tokens adapt per platform context

## 15. Stage M — Haptics, Gestures & Input (~1500 words, 2 tables)
### 15.1 Haptic Feedback Mapping
#### 15.1.1 5 impact styles (Light/Medium/Heavy/Rigid/Soft) + 3 notifications (Success/Warning/Error)
#### 15.1.2 Vibration API web equivalents with fallback strategy
### 15.2 Gestures & Interactions
#### 15.2.1 Edge swipe: 1300pt/sec velocity threshold, 50% progress threshold
#### 15.2.2 Pointer magnetism: visual + movement mechanisms, inertia projection
#### 15.2.3 Hover states: 3 pointer effects (Highlight/Lift/Hover) with CSS :hover equivalents
### 15.3 Context Menus & Input
#### 15.3.1 Long-press/secondary click triggers expanded vertical scannable menu
#### 15.3.2 Pull-to-refresh: medium impact haptic coordinated with spinner
#### 15.3.3 Touch targets: 44x44pt minimum, button heights per size class

## 16. Complete Token Scale (~1000 words, 4 tables)
### 16.1 Reference Token Architecture
#### 16.1.1 Named role-based tokens for outermost shapes only — all others derived at runtime
#### 16.1.2 The token graph: spacing drives shape, shape drives elevation, elevation drives material
### 16.2 Token Tables
#### 16.2.1 Radius tokens: --radius-window, --radius-sheet, --radius-card with platform variants
#### 16.2.2 Spacing tokens: --spacing-xs through --spacing-xxhuge on 8pt grid
#### 16.2.3 Motion tokens: --motion-spring-snappy, --motion-spring-smooth, --motion-duration-*
#### 16.2.4 Elevation tokens: --elevation-0 through --elevation-4 with shadow values

## 17. Complete Failure Matrix (~800 words, 1 table)
### 17.1 Failure Scenarios & Behaviors
#### 17.1.1 corner-shape unsupported → silent fallback to border-radius
#### 17.1.2 Squircle generation fails → further fallback to plain border-radius
#### 17.1.3 Canvas CORS taint → skip extraction, use static ramp
#### 17.1.4 Contrast can't clear 4.5:1 → use static token for that role (hard floor)
#### 17.1.5 prefers-contrast: more → bypass extraction entirely
#### 17.1.6 prefers-reduced-transparency → remove blur, keep adaptive hue
#### 17.1.7 prefers-reduced-motion → instant swap, 0ms
#### 17.1.8 No radius-bearing ancestor → treat parent as 0, child resolves square

## 18. Complete Validation Checklist (~600 words)
### 18.1 Geometry & Shape
#### 18.1.1 No nested element has hand-authored radius — all derived from Stage B
#### 18.1.2 No magic-number radius outside named reference scale
#### 18.1.3 Every continuous-corner surface degrades to valid plain rounded corner
### 18.2 Color & Material
#### 18.2.1 No new hex/RGB literals in .css files
#### 18.2.2 All adaptive values flow through contrast enforcement before injection
#### 18.2.3 Static fallback renders correctly with JS disabled
### 18.3 Motion & Accessibility
#### 18.3.1 All animations respect prefers-reduced-motion
#### 18.3.2 prefers-contrast: more fully disables extraction
#### 18.3.3 prefers-reduced-transparency removes blur, keeps adaptive hue
### 18.4 Cross-Platform & Components
#### 18.4.1 Platform-specific shape usage follows iOS=capsule, macOS=rounded-rect guidelines
#### 18.4.2 Glass-on-glass stacking nowhere in interface
#### 18.4.3 All touch targets >= 44pt

# References
## liquid-glass-protocol.agent.outline.md
- **Type**: Report outline
- **Description**: This outline file
- **Path**: /mnt/agents/output/liquid-glass-protocol.agent.outline.md

## Research Dimension Files
- **Type**: Deep research outputs
- **Description**: 12 dimension files covering all aspects of Liquid Glass
- **Path**: /mnt/agents/output/research/liquid_glass_dim01.md through dim12.md

## Cross Verification
- **Type**: Research validation
- **Description**: Confidence tiers and conflict resolution
- **Path**: /mnt/agents/output/research/liquid_glass_cross_verification.md

## Insights
- **Type**: Cross-dimension synthesis
- **Description**: 8 strategic insights from research
- **Path**: /mnt/agents/output/research/liquid_glass_insight.md

## Original Protocol
- **Type**: Source material
- **Description**: PR.MD — original corner + color protocols
- **Path**: /mnt/agents/upload/PR.MD
