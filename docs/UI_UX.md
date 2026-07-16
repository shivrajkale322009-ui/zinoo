# Druvio User Interface & Experience Design

## 1. Design System Overview

Druvio follows a premium, modern design system built around a white and blue color palette with gold accents. The system prioritizes trust, clarity, and mobile-first responsiveness. All UI elements are designed to convey professionalism while remaining approachable and accessible to Indian users across different socioeconomic backgrounds.

## 2. Color Palette

### 2.1 Primary Colors

| Usage | Variable | Hex | RGB | Usage Notes |
|-------|----------|-----|-----|-------------|
| Brand Primary | `--brand-primary` | #2563eb | 37, 99, 235 | Main brand color, primary CTAs, links |
| Brand Primary Hover | `--brand-primary-hover` | #1d4ed8 | 29, 78, 216 | Hover states, interactive elements |
| Brand Dark | `--brand-dark` | #1e3a8a | 30, 58, 138 | Secondary headings, active states |
| Brand Light | `--brand-light` | #eff6ff | 239, 246, 255 | Backgrounds, subtle highlighting |

### 2.2 Secondary Colors

| Usage | Variable | Hex | RGB | Usage Notes |
|-------|----------|-----|-----|-------------|
| Accent Gold | `--accent-gold` | #f59e0b | 245, 158, 11 | Success, verification, scores |
| Accent Gold Glow | `--accent-gold-glow` | #fbbf24 | 251, 191, 36 | Background glow effects |
| Color Active | `--color-active` | #16a34a | 22, 163, 74 | Active/sold status, success |
| Color Active BG | `--color-active-bg` | #f0fdf4 | 240, 253, 244 | Active element backgrounds |
| Color Sold | `--color-sold` | #64748b | 100, 116, 139 | Sold out, unavailable |
| Color Sold BG | `--color-sold-bg` | #f1f5f9 | 241, 245, 249 | Sold out backgrounds |

### 2.3 Neutral Colors

| Usage | Variable | Hex | RGB |
|-------|----------|-----|-----|
| Text Primary | `--text-primary` | #0f172a | 15, 23, 42 |
| Text Secondary | `--text-secondary` | #475569 | 71, 85, 105 |
| Text Muted | `--text-muted` | #94a3b8 | 148, 163, 184 |
| Border Color | `--border-color` | #e2e8f0 | 226, 232, 240 |
| Border Focus | `--border-focus` | #2563eb | 37, 99, 235 |

## 3. Typography

### 3.1 Font Hierarchy

**Primary Font (Headers):** Outfit
- Used for all headings, titles, and brand text
- Weights: Regular (400), Bold (700), Extra Bold (800)
- Reasoned for modern, clean appearance

**Secondary Font (Body):** Inter
- Used for all body text, descriptions, labels
- Weights: Regular (400), Medium (500), SemiBold (600)
- Chosen for excellent readability across devices

### 3.2 Font Sizing Scale

| Element | Font Size | Line Height | Font Weight | Usage |
|---------|-----------|-------------|-------------|-------|
| H1 (Hero Title) | 32px @md 48px | 1.2 | 800 | Main page titles, landing hero |
| H2 (Section Title) | 24px @md 36px | 1.2 | 700 | Page section headers |
| H3 (Card Title) | 20px @md 24px | 1.2 | 800 | Component titles |
| Body Large | 16px | 1.5 | 400 | Main content, descriptions |
| Body Regular | 14px | 1.5 | 400 | Labels, descriptions, form text |
| Body Small | 12px | 1.5 | 400 | Captions, metadata |
| Body XSmall | 10px | 1.5 | 600 | Badges, status indicators |

### 3.3 Typography Scale on Mobile

| Screen Size | H1 | H2 | H3 | Body | Small |
|-------------|----|----|----|------|-------|
| < 640px | 32px | 24px | 20px | 14px | 10px |
| ≥ 640px | 48px | 36px | 24px | 16px | 12px |

## 4. Spacing Scale

### 4.1 Base Unit

- 1 unit = 4px (consistent with modern design systems)
- Space values in 4px increments: 0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96

### 4.2 Spacing Grid

```
Responsive Grid (Mobile→Desktop):
- Container padding: 14px @mobile, 28px @desktop
- Card padding: 16px @mobile, 20px @desktop
- Section gap: 20px @mobile, 24px @desktop
- Input field padding: 10px 14px
- Button padding: 12px 20px
- Icon spacing: 6px
```

## 5. Component Library

### 5.1 Cards

#### 5.1 Project Cards
**Purpose:** Main representation of plotting projects
**Layout:**
- Hero image (full width, 160px @mobile, 200px @desktop)
- Floating score badge with star icon
- Verified stamp (top-left corner)
- Property details grid (price, plots, distance)

**Visual Elements:**
- Shadow: `var(--shadow-md)`
- Border radius: 16px
- Hover effect: `translateY(-2px)` with shadow enhancement

#### 5.2 Lead Cards
**Purpose:** Display buyer leads in admin dashboard
**Layout:**
- Compact table layout for list views
- Compact cards for mobile optimization
- Status badges with color coding

### 5.2 Buttons

#### 5.2.1 Primary Buttons
- Background: `var(--brand-primary)`
- Text: `#ffffff`
- Border: none
- Border radius: 10px
- Shadow: `var(--shadow-blue)`
- States: normal, hover (darken 10%), active (darken 20%)

#### 5.2.2 Secondary Buttons
- Background: `#ffffff`
- Text: `var(--text-primary)`
- Border: `1.5px solid var(--border-color)`
- Border radius: 10px
- States: normal, hover (background: `var(--bg-input)`)

#### 5.2.3 Ghost Buttons
- Background: transparent
- Text: `var(--text-secondary)`
- Border: none
- States: normal, hover (background: `var(--bg-input)`)

### 5.3 Forms

#### 5.3.1 Input Fields
- Background: `var(--bg-input)`
- Border: `1.5px solid var(--border-color)`
- Border radius: 10px
- Padding: 10px 14px
- Text: `var(--text-primary)`
- Focus state: blue border, subtle glow

#### 5.3.2 Select Dropdowns
- Background: `var(--bg-input)`
- Border: `1.5px solid var(--border-color)`
- Border radius: 10px
- Custom arrow icon

#### 5.3.3 Checkboxes
- Color: `var(--brand-primary)`
- Background: checked state uses brand primary
- Border radius: 4px

### 5.4 Badges

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Success | `#dcfce7` | `#16a34a` | none | Druvio Score badges |
| Warning | `#fef9c3` | `#ca8a04` | none | Book Visit status |
| Info | `#dbeafe` | `#2563eb` | none | Map view status |
| Danger | `#fee2e2` | `#dc2626` | none | Sold Out status |

### 5.5 Modals & Drawers

#### 5.5.1 Filter Drawer
- Slide-up animation from bottom
- Background: `var(--bg-sidebar)`
- Border radius: 24px top
- Shadow: `0 -10px 25px rgba(0,0,0,0.5)`

#### 5.5.2 Booking Modal
- Centered overlay
- Background: `var(--bg-sidebar)`
- Border radius: 20px
- Shadow: `0 25px 50px -5px rgba(0,0,0,0.3)`

## 6. Iconography

### 6.1 Icon Selection
- **Primary source**: Lucide React (consistent set)
- **Style**: Outlined (not filled) for visual hierarchy
- **Size Scale**: 8px-32px based on usage context

### 6.2 Icon Usage
| Size | Context |
|------|----------|
| 20px | Nav bar icons, small buttons |
| 24px | Component icons, card markers |
| 32px | Large buttons, empty states |

## 7. Animations & Transitions

### 7.1 Primary Transitions
- **Fade in**: 0.25s ease-in-out (`fade-in`)
- **Slide up**: 0.35s cubic-bezier (`slide-up`)
- **Scale hover**: 0.2s transform (`translateY(-2px)`)
- **Pulse**: 1.8s infinite (`marker-pulse`) for active markers

### 7.2 Animation Classes
- `.fade-in`: Fade in from translateY(6px)
- `.slide-up`: Slide up from translateY(100%)
- `.spin`: Continuous rotation for loading states

## 8. Layout Patterns

### 8.1 Grid Systems
**Multi-column grids with responsive breakpoints:**

```css
/* Default (mobile) */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }

/* Tablet */
@media (min-width: 640px) {
  .grid-2 { gap: 16px; }
  .grid-3 { gap: 12px; }
}

/* Desktop */
@media (min-width: 920px) {
  .grid-2 { gap: 20px; }
  .grid-3 { gap: 16px; }
}
```

### 8.2 Navigation Patterns
**Bottom tab navigation:**
- Fixed positioning
- Active state with icon + text
- Active indicator color: `var(--brand-primary)`
- Touch target: 44px minimum

## 9. Empty States

### 9.1 No Search Results
- Compass icon (24px, `var(--text-muted)`)
- Clear messaging about filtering
- Prominent action button for resetting filters

### 9.2 No Projects Listed
- Clipboard icon (24px, `var(--text-muted)`)
- Onboarding hints
- Primary action button for adding first project

### 9.3 No Visits Scheduled
- Calendar icon (24px, `var(--text-muted)`)
- Placeholder text with action suggestion

## 10. Error States

### 10.1 Form Validation
- Red border (1.5px solid `#fecaca`)
- Error message in red (`#b91c1c`)
- Alert icon for visual clarity

### 10.2 API Errors
- Full-width alert banner (above content)
- Retry button for transient errors
- Error dismissal capability

### 10.3 Loading States
- Spinner at 50% opacity overlay
- Progress indicator for async operations
- Disabled UI elements during loading

## 11. Responsive Behavior

### 11.1 Breakpoint Strategy
- **Mobile**: < 640px (single column, stacked layout)
- **Tablet**: ≥ 640px & < 920px (2-column grid)
- **Desktop**: ≥ 920px (adaptive grid with wider content areas)

### 11.2 Touch Optimizations
- Minimum tap targets (44px)
- Reduced animation complexity on mobile
- Simplified forms (auto-focus for inputs)
- Visible touch feedback (ripple effect)

## 12. Dark Mode Strategy

### 12.1 Dark Mode Spec
Currently, Druvio follows a light-only approach, but the design system includes preparation for future dark mode:

**Color adjustments for dark mode:**
- Increase contrast ratios
- Adjust background colors for better readability
- Modify shadows for dark background visibility
- Switch green/red colors for darker themes

### 12.2 Implementation Notes
- CSS custom properties enable easy theme switching
- Transition opacity for smooth theme changes
- Set `prefers-color-scheme: dark` media query support
- Build dark-mode toggle component in Phase 10

## 13. Accessibility Features

### 13.1 WCAG 2.1 AA Compliance

**Visual Accessibility:**
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: visible blue ring (2px)
- Icon clarity: high contrast, clear fill/stroke
- Success states: color + icon combination

**Keyboard Navigation:**
- Tab order follows logical flow
- Enter key activates buttons and links
- Escape key closes modals/drawers
- Arrow keys navigate between interactive elements

**Screen Reader Support:**
- ARIA labels for all interactive elements
- Semantic HTML structure
- Role attributes for complex widgets
- Live regions for dynamic content

### 13.2 Testing Checklist
- Color contrast validation
- Keyboard-only navigation testing
- Screen reader testing (VoiceOver, NVDA, JAWS)
- Focus order verification
- Link text clarity
- Form input labels and descriptions

## 14. Component Examples

### 14.1 Project Detail Layout
```html
<div class="project-detail">
  <!-- Hero section with image and overlay -->
  <div class="hero-image">
    <div class="overlay"></div>
    <div class="verified-badge">✓ GPS Verified</div>
    <div class="status-badge status-active">Active</div>
  </div>
  
  <!-- Details section -->
  <div class="details">
    <div class="title-section">
      <h3>Project Name</h3>
      <p><MapPin size={12} /> Location Info</p>
    </div>
    
    <div class="price-section">
      <span>Starting Price</span>
      <strong>₹2.5L</strong>
    </div>
    
    <div class="druvio-score">
      <div class="score-header">
        <Star size={16} fill="var(--accent-gold)" /> Druvio Score
      </div>
      <div class="score-meter">
        <div class="score-bar"></div>
      </div>
    </div>
  </div>
</div>
```

### 14.2 Filter Panel
```html
<div class="filter-panel">
  <div class="filter-section">
    <label>Budget Range</label>
    <div class="range-slider">
      <input type="range" min="800000" max="3000000" step="100000" />
      <span class="range-value">₹30L</span>
    </div>
  </div>
  
  <div class="filter-section">
    <label>Status Filters</label>
    <div class="checkbox-group">
      <label><input type="checkbox" /> Bank Loan Pre-Approved</label>
      <label><input type="checkbox" /> NA Plot Only</label>
    </div>
  </div>
</div>
```

## 15. Animation Guidelines

### 15.1 Micro-interactions
- Button press effect: subtle scale and shadow
- Card hover: slight lift and shadow emphasis
- Form field focus: border color and glow
- Menu opening: slide-up with easing

### 15.2 Loading States
- Spinner: circular rotation continuous
- Progress bar: width animation
- Ghost loading squares: shimmer effect

### 15.3 Success States
- Checkmark animation: scale and fade
- Toast notification: slide-up from bottom
- Form submission: loading to success modal

## 16. Component Overlays

### 16.1 Navigation Overlays
- Bottom tab bar (mobile)
- Side navigation (desktop)
- Breadcrumbs (desktop)
- Context menus (right-click)

### 16.2 Modal Overlays
- Filter drawer (slide-up)
- Booking modals (center)
- Phone verification modal
- Project detail panels (slide-over)

### 16.3 toast Notifications
- Auto-dismissing (3-5 seconds)
- Actionable notifications with buttons
- Error toasts with dismiss buttons

## 17. Future Design Considerations

### 17.1 Component Evolution
- **Phase 2**: Dark mode toggle, improved animations
- **Phase 3**: Component variants (compact, detailed)
- **Phase 4**: Accessibility enhancements

### 17.2 Responsive Evolution
- **Phase 2**: Tablet-specific layouts
- **Phase 3**: Desktop-optimized comparison view
- **Phase 4**: Cross-device state management

This UI/UX design ensures a premium user experience that builds trust through consistency, accessibility, and clear visual hierarchy. The white and blue theme creates a sense of professionalism and cleanliness, while the gold accents highlight verification and success states.

The design system is built to scale with the product's growth, maintaining consistency across all screens and interaction patterns while adapting to various user needs and contexts.