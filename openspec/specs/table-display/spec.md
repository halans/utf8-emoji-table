# table-display Specification

## Purpose
TBD - created by archiving change create-emoji-table-viewer. Update Purpose after archive.
## Requirements
### Requirement: Display emoji data in structured table format

The application MUST render emoji data in an HTML table with clearly labeled columns showing all required information, including a new code point count column.

**Required columns** (updated):
1. Unicode Code Point (e.g., "U+1F600")
2. Code Point Count (e.g., "1", "2", "5") 
3. Character (rendered emoji)
4. UTF-8 Literal (e.g., "\xF0\x9F\x98\x80")
5. Byte Size (e.g., "4")
6. Character Name (official Unicode name)

#### Scenario: Rendering table with code point count column

**Given** emoji data has been loaded and parsed with code point counts
**When** the application renders the initial view
**Then** a table is displayed with six column headers
**And** the headers are labeled: "Code Point", "Count", "Character", "UTF-8", "Bytes", "Name"
**And** each row contains data from one emoji entry with the count value
**And** emojis are rendered as actual characters in the Character column
**And** code point counts are displayed as integers in the Count column

**Example row**:
| Code Point | Count | Character | UTF-8 | Bytes | Name |
|------------|-------|-----------|-------|-------|------|
| U+1F600 | 1 | 😀 | \xF0\x9F\x98\x80 | 4 | grinning face |

#### Scenario: Code point count accuracy for different emoji types

**Given** emoji data contains simple emojis, skin tone variants, and ZWJ sequences
**When** the table renders
**Then** simple emojis show count of 1 (e.g., "U+1F600" → Count: 1)
**And** skin tone variants show count of 2 (e.g., "U+1F44D U+1F3FB" → Count: 2)
**And** ZWJ sequences show correct count for all code points (e.g., "U+1F468 U+200D U+1F469 U+200D U+1F467" → Count: 5)
**And** all count values are positive integers

#### Scenario: Table displays current page of data with count column

**Given** pagination is active with page size set to 256
**When** the table renders
**Then** exactly 256 emojis are displayed (or fewer if on last page)
**And** each row includes the code point count value
**And** emojis are displayed in the order they appear in the dataset
**And** no emojis are duplicated in the current view

#### Scenario: Empty state when no data available

**Given** no emoji data is available (loading or error state)
**When** the table component attempts to render
**Then** an empty state message is displayed spanning all 6 columns
**And** the message indicates "Loading emoji data..." or "No emojis found"

### Requirement: Table must be responsive and readable

The table MUST be styled for readability across different screen sizes and maintain visual clarity.

#### Scenario: Table layout on desktop screens

**Given** the application is viewed on a screen wider than 1024px
**When** the table renders
**Then** all four columns are visible without horizontal scrolling
**And** column widths are appropriately sized for content
**And** the Character column is sized for emoji display (~40-50px)
**And** the Name column takes remaining space

#### Scenario: Table layout on mobile screens

**Given** the application is viewed on a screen narrower than 768px
**When** the table renders
**Then** the table remains readable
**And** either horizontal scroll is enabled OR
**And** the layout adapts to stack information vertically per emoji

#### Scenario: Visual styling for readability

**Given** the table is rendered
**When** displaying emoji data
**Then** rows have alternating background colors (zebra striping)
**And** hovering over a row highlights it
**And** font is monospace for Code Point and UTF-8 columns
**And** font is sans-serif for Name column
**And** emoji characters are rendered at appropriate size (18-24px)

---

### Requirement: Table updates when data filters change

The table MUST re-render when the underlying dataset changes due to search filtering or pagination.

#### Scenario: Table updates after search filter applied

**Given** the table displays all emojis
**When** the user applies a search filter (see `search` capability)
**Then** the table immediately updates to show only matching emojis
**And** the table maintains proper styling and structure
**And** the update completes within 200ms

#### Scenario: Table updates after page navigation

**Given** the table displays page 1 of emojis
**When** the user navigates to page 2 (see `pagination` capability)
**Then** the table immediately updates to show page 2 emojis
**And** the previous page's emojis are no longer visible
**And** the update completes within 100ms

#### Scenario: Table updates after page size change

**Given** the table displays 256 emojis per page
**When** the user changes page size to 512
**Then** the table updates to display 512 emojis
**And** the current position in the dataset is approximately preserved
**And** the table scrolls to top of new page

### Requirement: Code point count calculation and display

The application MUST calculate and display the number of Unicode code points that comprise each emoji.

#### Scenario: Code point count calculation from parsed data

**Given** emoji data is parsed from Unicode files
**When** an emoji object is created
**Then** the `codePointCount` property is set to the number of individual code points
**And** the count is calculated by splitting the codePoint string on spaces and counting "U+" prefixes
**And** the count is always a positive integer greater than 0

#### Scenario: Count column positioning and styling

**Given** the table is rendered with emoji data
**When** the count column is displayed
**Then** the count column appears between "Code Point" and "Character" columns
**And** count values are right-aligned or center-aligned for readability
**And** count values are displayed as plain integers without additional formatting

