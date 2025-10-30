# pagination Specification

## Purpose
TBD - created by archiving change create-emoji-table-viewer. Update Purpose after archive.
## Requirements
### Requirement: Support configurable page sizes

The application MUST allow users to select from predefined page size options to control how many emojis are displayed per page.

**Page size options**: 128, 256, 512, 1024

#### Scenario: Page size selector displays options

**Given** the application is loaded with emoji data
**When** the pagination controls render
**Then** a page size selector is displayed
**And** the selector shows four options: 128, 256, 512, 1024
**And** the default selected option is 256
**And** the selector is clearly labeled (e.g., "Items per page:")

#### Scenario: Changing page size updates display

**Given** the table displays 256 emojis per page
**When** the user selects "512" from the page size selector
**Then** the table immediately updates to show 512 emojis
**And** the pagination controls update to reflect new total pages
**And** the user remains viewing the same approximate dataset position

**Example**:
```
Before: Page 3 of 20 (256 per page) - showing emojis 513-768
After: Page 2 of 10 (512 per page) - showing emojis 513-1024
```

#### Scenario: Page size persists during session

**Given** the user changes page size to 1024
**When** the user navigates between pages or performs searches
**Then** the page size remains at 1024
**And** the setting is not reset unless explicitly changed

---

### Requirement: Navigate between pages

The application MUST provide controls to navigate through paginated emoji data.

#### Scenario: Pagination controls display current state

**Given** emoji data is loaded and paginated
**When** the pagination controls render
**Then** the current page number is displayed
**And** the total number of pages is displayed
**And** the format is "Page X of Y"
**And** navigation buttons are provided: Previous, Next, First, Last

#### Scenario: Navigate to next page

**Given** the user is on page 2 of 10
**When** the user clicks the "Next" button
**Then** the table updates to display page 3 emojis
**And** the pagination controls update to show "Page 3 of 10"
**And** the table scrolls to the top

#### Scenario: Navigate to previous page

**Given** the user is on page 3 of 10
**When** the user clicks the "Previous" button
**Then** the table updates to display page 2 emojis
**And** the pagination controls update to show "Page 2 of 10"

#### Scenario: Navigate to first page

**Given** the user is on page 5 of 10
**When** the user clicks the "First" button
**Then** the table updates to display page 1 emojis
**And** the pagination controls update to show "Page 1 of 10"

#### Scenario: Navigate to last page

**Given** the user is on page 5 of 10
**When** the user clicks the "Last" button
**Then** the table updates to display page 10 emojis
**And** the pagination controls update to show "Page 10 of 10"

---

### Requirement: Disable navigation buttons appropriately

Navigation buttons MUST be disabled when the action is not applicable.

#### Scenario: Previous and First disabled on first page

**Given** the user is on page 1 of 10
**When** the pagination controls render
**Then** the "Previous" button is disabled
**And** the "First" button is disabled
**And** the "Next" button is enabled
**And** the "Last" button is enabled

#### Scenario: Next and Last disabled on last page

**Given** the user is on page 10 of 10
**When** the pagination controls render
**Then** the "Next" button is disabled
**And** the "Last" button is disabled
**And** the "Previous" button is enabled
**And** the "First" button is enabled

#### Scenario: All navigation enabled on middle pages

**Given** the user is on page 5 of 10
**When** the pagination controls render
**Then** all navigation buttons (Previous, Next, First, Last) are enabled

---

### Requirement: Handle pagination with filtered data

Pagination MUST work correctly when the dataset is filtered by search (see `search` capability).

#### Scenario: Pagination updates after search reduces results

**Given** the user is viewing page 5 of 20 (all emojis)
**When** the user searches for "heart" which returns 100 results
**Then** the pagination resets to page 1
**And** the total pages updates to reflect filtered results
**And** the page size remains unchanged

**Example**:
```
Before search: Page 5 of 20 (256 per page, ~5000 total emojis)
After search: Page 1 of 1 (256 per page, 100 matching emojis)
```

#### Scenario: Pagination updates when search is cleared

**Given** the user has a search filter applied showing 2 pages of results
**When** the user clears the search
**Then** the pagination resets to page 1 of full dataset
**And** the total pages updates to reflect all emojis

---

### Requirement: Display item range information

The application MUST show which items in the dataset are currently visible.

#### Scenario: Item range displayed for current page

**Given** the user is on page 3 with page size 256
**When** the pagination controls render
**Then** the range of items is displayed (e.g., "Showing 513-768 of 5000")
**And** the range accurately reflects the current page offset

#### Scenario: Item range on last page with fewer items

**Given** the user is on the last page with 150 remaining emojis
**And** the page size is 256
**When** the pagination controls render
**Then** the range shows the actual count (e.g., "Showing 4851-5000 of 5000")
**And** not the full page size

---

### Requirement: Keyboard navigation for pagination

Pagination controls MUST be accessible via keyboard.

#### Scenario: Keyboard navigation through pagination buttons

**Given** the pagination controls are rendered
**When** the user presses Tab
**Then** focus moves between pagination buttons in logical order
**And** focused button has visible focus indicator
**And** pressing Enter activates the focused button

