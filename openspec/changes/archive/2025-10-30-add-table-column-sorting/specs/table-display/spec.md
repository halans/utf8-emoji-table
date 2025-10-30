# Table Display Capability - Add Column Sorting

**Capability**: `table-display`
**Depends On**: `data-fetching`
**Related To**: `pagination`, `search`, `clipboard-interaction`

## MODIFIED Requirements

### Requirement: Display emoji data in structured table format with sortable columns

The application MUST render emoji data in an HTML table with clearly labeled columns showing all required information, where supported columns can be sorted interactively by the user.

**Required columns** (with sorting support):
1. Unicode Code Point (e.g., "U+1F600") - **Sortable** (alphanumeric)
2. Code Point Count (e.g., "1", "2", "5") - **Sortable** (numeric)
3. Character (rendered emoji) - **Not Sortable** (no meaningful order)
4. UTF-8 Literal (e.g., "\xF0\x9F\x98\x80") - **Sortable** (string)
5. Byte Size (e.g., "4") - **Sortable** (numeric)
6. Character Name (official Unicode name) - **Sortable** (alphabetical)

#### Scenario: Rendering table with sortable column headers

**Given** emoji data has been loaded and parsed
**When** the application renders the initial view
**Then** a table is displayed with six column headers
**And** the headers are labeled: "Code Point", "Count", "Character", "UTF-8", "Bytes", "Name"
**And** sortable column headers have visual indicators (clickable appearance)
**And** the Character column header is not clickable or sortable
**And** sortable headers include ARIA attributes for accessibility
**And** the table initially displays data in default order (by Code Point)

#### Scenario: Sorting by Code Point column

**Given** the emoji table is displayed
**When** the user clicks on the "Code Point" column header
**Then** the table data is sorted by code point in ascending alphanumeric order
**And** the Code Point header shows an ascending sort indicator (▲)
**And** other column headers show no sort indicators
**And** the page resets to page 1 if pagination is active
**When** the user clicks the "Code Point" header again
**Then** the table data is sorted by code point in descending order
**And** the Code Point header shows a descending sort indicator (▼)

#### Scenario: Sorting by numeric columns (Count, Bytes)

**Given** the emoji table is displayed
**When** the user clicks on the "Count" column header
**Then** the table data is sorted by code point count in ascending numeric order
**And** emojis with count 1 appear before emojis with count 2, etc.
**And** the Count header shows an ascending sort indicator
**When** the user clicks on the "Bytes" column header
**Then** the table data is sorted by byte size in ascending numeric order
**And** the Bytes header shows an ascending sort indicator
**And** the Count header no longer shows a sort indicator

#### Scenario: Sorting by Name column (alphabetical)

**Given** the emoji table is displayed
**When** the user clicks on the "Name" column header
**Then** the table data is sorted by emoji name in ascending alphabetical order
**And** names starting with "a" appear before names starting with "b", etc.
**And** sorting is case-insensitive
**And** the Name header shows an ascending sort indicator
**When** the user clicks the "Name" header again
**Then** the table data is sorted by name in descending alphabetical order

#### Scenario: Sorting persists with search filtering

**Given** the table is sorted by "Count" in ascending order
**When** the user enters a search query that filters the results
**Then** the filtered results remain sorted by count in ascending order
**And** the Count header still shows the ascending sort indicator
**And** only emojis matching the search criteria are displayed, in sorted order
**When** the user clears the search query
**Then** all emojis are displayed again, still sorted by count

#### Scenario: Character column is not sortable

**Given** the emoji table is displayed
**When** the user hovers over the "Character" column header
**Then** the cursor does not change to indicate clickability
**And** no sort indicators are shown for the Character column
**When** the user clicks on the "Character" column header
**Then** no sorting action occurs
**And** the current sort state is preserved

#### Scenario: Accessibility support for sorting

**Given** the emoji table is displayed with sortable headers
**When** a screen reader user navigates to a sortable column header
**Then** the header is announced with its sorting capability
**And** the current sort state is announced (e.g., "Code Point, sortable, currently sorted ascending")
**When** the sort state changes
**Then** the new sort state is announced to screen readers
**And** keyboard users can activate sorting using Enter or Space keys

## ADDED Requirements

### Requirement: Visual sort indicators

The application MUST provide clear visual feedback for the current sort state.

#### Scenario: Sort indicators show current state

**Given** the table is not sorted (default state)
**When** the table is displayed
**Then** no sort indicators are visible on any column headers
**When** a sortable column is sorted in ascending order
**Then** an ascending indicator (▲ or equivalent) appears in that column header
**When** a sortable column is sorted in descending order
**Then** a descending indicator (▼ or equivalent) appears in that column header
**And** no other columns show sort indicators

#### Scenario: Hover states for sortable columns

**Given** the emoji table is displayed
**When** the user hovers over a sortable column header
**Then** the header shows a hover state (e.g., highlighted background)
**And** the cursor changes to indicate clickability
**When** the user hovers over the non-sortable Character column
**Then** no hover state is shown
**And** the cursor remains normal

### Requirement: Sort state management

The application MUST maintain consistent sort state throughout user interactions.

#### Scenario: Sort state persists during pagination

**Given** the table is sorted by "Bytes" in descending order
**And** the table has multiple pages of data
**When** the user navigates to page 2
**Then** page 2 data is displayed in the same sort order (Bytes descending)
**And** the Bytes header still shows the descending sort indicator
**When** the user returns to page 1
**Then** page 1 data is still sorted by Bytes in descending order

#### Scenario: Changing sort resets to page 1

**Given** the user is viewing page 3 of the emoji table
**When** the user clicks a column header to change the sort order
**Then** the table resets to page 1
**And** the data is displayed in the new sort order
**And** the pagination controls reflect the current page as 1

#### Scenario: Default sort state

**Given** the application loads for the first time
**When** the emoji table is rendered
**Then** the data is displayed in the original file order (effectively sorted by Code Point)
**And** no sort indicators are visible
**And** the sort state is initialized to allow future sorting operations