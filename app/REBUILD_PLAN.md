# ComfyShare Frontend Rebuild Plan

## Status: IN PROGRESS

Rebuilding the entire frontend to match Writebook's EXACT UI, down to specific CSS classes, layout structure, and interactions.

## ✅ Completed

1. **CSS System** - Copied all 26 CSS files from Writebook
2. **Assets** - Copied all SVG icons and images
3. **Layout Component** - Created grid-based AppLayout component

## 🚧 In Progress

### Core Layout (Priority 1)
- [ ] AppLayout with exact grid areas (header, toolbar, sidebar, main, footer)
- [ ] Responsive breakpoints (70ch desktop/mobile toggle)
- [ ] Sidebar sliding behavior with checkbox toggle

### Components (Priority 2)
- [ ] **Buttons**: Circular icon buttons (.btn, .btn--circle, .btn--negative, etc.)
- [ ] **Navigation**: Breadcrumbs with inline editing
- [ ] **Forms**: Exact input styles, toggle switches, file uploads
- [ ] **Dialogs**: Search modal, lightbox for images

### Pages (Priority 3)

#### 1. Library/Home Page
- [ ] Grid layout with book covers (repeat(auto-fit, minmax(150px, 1fr)))
- [ ] Themed book covers with color variants
- [ ] "New book" button
- [ ] Product wordmark header

#### 2. Book Show/TOC Page
- [ ] Two-column layout (cover sidebar + TOC grid)
- [ ] Grid/List view toggle
- [ ] TOC thumbnails (6:9 aspect ratio)
  - Pages: HTML preview
  - Sections: Centered text with theme
  - Pictures: Image display
- [ ] Toolbar with create buttons
- [ ] Arrange/Delete mode toggles
- [ ] Blank slate when empty

#### 3. Book Edit/Settings Page
- [ ] Two-column form (cover + metadata)
- [ ] Theme color selector (7 theme buttons)
- [ ] Cover upload with preview
- [ ] Translation buttons (🌐)
- [ ] Access control toggle

#### 4. Page Edit
- [ ] House markdown editor (contenteditable)
- [ ] Floating toolbar with markdown buttons
- [ ] Edit/Read mode toggle
- [ ] Save button with states (clean/dirty/saving)
- [ ] History button
- [ ] Sidebar TOC
- [ ] Previous/Next navigation

#### 5. Page Read/View
- [ ] Rendered markdown with syntax highlighting
- [ ] Sidebar TOC with current page indicator
- [ ] Previous/Next navigation
- [ ] Fullscreen toggle
- [ ] Search dialog

#### 6. Section Edit
- [ ] Dark/Light theme toggle
- [ ] Centered textarea for title
- [ ] Full-page themed background

#### 7. Picture Edit
- [ ] Large file upload area with preview
- [ ] Caption input
- [ ] Translation support

## Specific UI Details to Match

### Button System
```css
.btn                    // Base: 2.65em height, 1px border
.btn--circle           // Icon-only: 1:1 aspect, centered
.btn--link             // Blue background
.btn--negative         // Red background
.btn--positive         // Green background
.btn--reversed         // Black/white inverted
.btn--placeholder      // Invisible spacing button
```

### Layout Grid
```css
body {
  display: grid;
  grid-template-areas:
    "sidebar header"
    "sidebar toolbar"
    "sidebar main"
    "sidebar footer";
}
```

### TOC Leaf Structure
```html
<li class="toc__leaf">
  <div class="toc__thumbnail">    // 6:9 aspect ratio
    // Preview content
  </div>
  <a class="toc__title">          // With dotted line in list view
    <span>Title</span>
  </a>
  <small class="toc__wordcount">  // Pages only
    1,234 words
  </small>
</li>
```

### Breadcrumbs
```html
<div class="breadcrumbs">
  <a>Library</a>
  <span>▸</span>
  <strong>Current Page</strong>
</div>
```

### Toolbar Structure
```html
<div class="page-toolbar fill-selected align-center gap-half">
  <label class="btn">
    <input type="checkbox" class="switch__input">
    <img src="book.svg">
  </label>

  <span class="separator"></span>

  <house-md-toolbar>
    <button><img src="text-bold.svg"></button>
    <!-- etc -->
  </house-md-toolbar>

  <button class="btn page-toolbar__save">
    <img src="check.svg">
  </button>
</div>
```

## Key Features to Implement

1. **House Markdown Editor**
   - Contenteditable div
   - Markdown toolbar integration
   - Real-time preview toggle
   - File upload for images

2. **Drag & Drop Arrangement**
   - Arrange mode checkbox
   - Sortable.js or dnd-kit integration
   - Visual placeholder
   - Drag handle visibility

3. **Search Dialog**
   - Full-page modal
   - Search input with icon
   - Results list with highlights
   - Close button

4. **Lightbox**
   - Image zoom on click
   - Backdrop blur
   - Close on backdrop click or ESC

5. **Sidebar Toggle**
   - Checkbox-based (no JavaScript needed)
   - CSS transitions for sliding
   - Responsive: hidden mobile, sliding desktop

## Firebase Integration Notes

Data model remains the same, but UI component structure changes completely to match Writebook's patterns:

- Replace Tailwind utility classes with Writebook's BEM-style classes
- Use Writebook's exact HTML structure
- Implement contenteditable for markdown (not textarea)
- Add dual-mode visibility (edit/read) with CSS classes

## Timeline

- **Phase 1** (Current): Layout + Basic Pages (Library, Book Show)
- **Phase 2**: Editors (Page, Section, Picture)
- **Phase 3**: Advanced Features (Search, Drag-drop, Lightbox)
- **Phase 4**: Polish + Testing

## Assets Needed

Already copied from Writebook:
- ✅ 80+ SVG icons
- ✅ 7 themed cover images
- ✅ Empty cover placeholder
- ✅ All CSS files

## Notes

- NO Tailwind utilities in components (only Writebook classes)
- Exact CSS class names from exploration
- Exact HTML structure from view files
- Modern CSS features (grid, container queries, custom properties)
- Accessibility maintained (ARIA labels, semantic HTML)
