# Design Document: Emoji Table Viewer

## Architecture Overview

This is a client-side web application with no backend requirements. The architecture follows a simple, progressive enhancement approach:

```
┌─────────────────────────────────────────┐
│         Browser (Client-Side)           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   UI Layer (HTML/CSS/JS)          │ │
│  │   - Table rendering               │ │
│  │   - Search interface              │ │
│  │   - Pagination controls           │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
│  ┌───────────────▼───────────────────┐ │
│  │   Data Layer                      │ │
│  │   - Unicode file parser           │ │
│  │   - Data normalization            │ │
│  │   - In-memory storage             │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
└──────────────────┼──────────────────────┘
                   │ fetch()
                   ▼
         ┌─────────────────┐
         │  unicode.org    │
         │  emoji files    │
         └─────────────────┘
```

## Technology Selection

### Core Technologies
- **HTML5**: Semantic markup for table structure
- **Vanilla JavaScript (ES6+)**: No framework dependency for simplicity
- **CSS3**: Grid/Flexbox for responsive layout

**Rationale**: Starting with vanilla technologies keeps the application lightweight, fast, and easy to understand. Framework integration can be added later if needed.

### Alternative Considered
- **React/Vue**: Would add build complexity and dependencies
- **Decision**: Defer to future enhancement unless user specifically requests

## Data Flow

### 1. Application Initialization
```
Load HTML → Initialize app → Fetch Unicode files → Parse data → Render first page
```

### 2. User Interactions
```
Search input → Filter dataset → Re-render table
Page size change → Update pagination → Re-render table
Page navigation → Calculate offset → Re-render table
Click emoji → Copy to clipboard → Show feedback indicator
```

## Key Design Decisions

### Data Fetching Strategy

**Decision**: Fetch all files on initial load and cache in memory

**Alternatives Considered**:
1. On-demand fetching per page
2. Service worker caching
3. Bundled data files

**Rationale**:
- Emoji files are relatively small (~100-500KB combined)
- One-time fetch provides instant search and pagination
- Simplifies implementation without build step
- Can add caching layer later if needed

**CORS Handling**:
- Primary: Direct fetch (works if CORS enabled)
- Fallback: Use CORS proxy service (e.g., `https://corsproxy.io/`)
- Future: Consider bundling data files for offline use

### Data Structure

```javascript
{
  emojis: [
    {
      codePoint: "U+1F600",      // Unicode code point
      character: "😀",            // Rendered emoji
      utf8: "\\xF0\\x9F\\x98\\x80", // UTF-8 byte sequence
      name: "GRINNING FACE",     // Official Unicode name
      source: "emoji-test.txt"   // Source file
    },
    // ...
  ]
}
```

**Rationale**: Flat array enables simple filtering and pagination with Array methods.

### Table Rendering

**Decision**: Re-render entire visible page on state changes

**Alternatives Considered**:
1. Virtual scrolling library
2. Incremental DOM updates
3. Canvas-based rendering

**Rationale**:
- Maximum 1024 rows is manageable for DOM rendering
- Simple implementation without dependencies
- Can optimize with virtual scrolling later if performance issues arise

### Pagination Implementation

**Page size options**: 128, 256, 512, 1024

**State management**:
```javascript
{
  currentPage: 1,
  pageSize: 256,
  totalItems: computed from filtered data
}
```

**Rationale**: Fixed power-of-2 sizes provide predictable performance characteristics and clean UX.

### Search Implementation

**Decision**: Client-side filtering with case-insensitive substring matching

**Search scope**:
- Character (emoji itself)
- Name (official Unicode name)

**Algorithm**:
```javascript
emojis.filter(e =>
  e.character.includes(query) ||
  e.name.toLowerCase().includes(query.toLowerCase())
)
```

**Rationale**: Simple implementation; dataset size (~3000-4000 emojis) allows instant filtering.

**Future Enhancement**: Add debouncing for search input (300ms delay).

### Clipboard Interaction

**Decision**: Use Clipboard API with fallback

```javascript
async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback: execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
```

**Visual feedback**:
- Show checkmark icon for 1.5 seconds after copy
- Highlight the copied row with CSS transition

**Rationale**: Modern API with graceful degradation ensures wide browser support.

## File Structure

```
/
├── index.html           # Main HTML structure
├── styles.css          # All styles
├── app.js             # Main application logic
├── parser.js          # Unicode file parser
└── README.md          # Usage documentation
```

**Rationale**: Minimal file structure for simplicity; no build step required.

## Unicode File Parsing

### File Formats

**emoji-test.txt**:
```
# Status codes and emoji data
1F600 ; fully-qualified # 😀 E1.0 grinning face
```

**emoji-sequences.txt**:
```
# Emoji sequences
1F468 200D 2764 FE0F 200D 1F468 ; RGI_Emoji_ZWJ_Sequence ; couple with heart: man, man
```

**emoji-zwj-sequences.txt**:
```
# ZWJ sequences
1F468 200D 1F373 ; RGI_Emoji_ZWJ_Sequence ; man cook
```

### Parser Strategy

1. Fetch file as text
2. Split by lines
3. Filter out comments and empty lines
4. Parse each line with regex patterns specific to file format
5. Extract code points, convert to character
6. Generate UTF-8 representation
7. Extract name
8. Normalize into common data structure

**Error Handling**: Log parsing errors but continue with valid entries; display warning to user if significant data loss.

## Performance Considerations

### Initial Load
- **Target**: < 3 seconds on 3G connection
- **Approach**: Show loading indicator; fetch files in parallel

### Rendering
- **Target**: < 100ms to render any page
- **Approach**: Render only visible rows; use DocumentFragment for batch DOM insertion

### Search
- **Target**: < 200ms for search results
- **Approach**: Filter in-memory array; debounce input

### Memory
- **Estimate**: ~3-5MB for all emoji data in memory
- **Acceptable**: Well within browser limits

## Browser Compatibility

**Target**: Modern browsers (last 2 versions)
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features**:
- ES6+ (arrow functions, async/await, template literals)
- Fetch API
- Clipboard API (with fallback)
- CSS Grid/Flexbox

## Security Considerations

1. **XSS Prevention**: All user input (search) is used in filtering, not rendered as HTML
2. **HTTPS Requirement**: Clipboard API requires secure context
3. **CSP**: No inline scripts; can implement strict CSP
4. **Data Source**: Fetching from official unicode.org domain

## Accessibility

- Semantic HTML table structure
- ARIA labels for interactive elements
- Keyboard navigation support (Tab, Enter for copy)
- High contrast mode support
- Screen reader announcements for copy feedback

## Future Enhancements (Out of Scope)

1. Dark mode toggle
2. Export table to CSV/JSON
3. Bookmark/favorite emojis
4. Emoji categories/grouping
5. Skin tone filtering
6. Version history (Unicode versions)
7. PWA with offline support
