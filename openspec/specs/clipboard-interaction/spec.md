# clipboard-interaction Specification

## Purpose
TBD - created by archiving change create-emoji-table-viewer. Update Purpose after archive.
## Requirements
### Requirement: Copy emoji to clipboard on click

The application MUST copy the emoji character to the system clipboard when the user clicks on the Character column.

#### Scenario: Click emoji character to copy

**Given** the table displays emoji data
**When** the user clicks on an emoji character in the Character column
**Then** the emoji is copied to the system clipboard
**And** the user can paste the emoji into other applications
**And** only the emoji character is copied (not code point or name)

**Example**:
```
User clicks: 😀
Clipboard contains: 😀
User pastes: 😀 (exact character)
```

#### Scenario: Copy uses Clipboard API on modern browsers

**Given** the browser supports the Clipboard API (navigator.clipboard)
**When** the user clicks an emoji to copy
**Then** the application uses `navigator.clipboard.writeText()` method
**And** the copy operation is asynchronous

#### Scenario: Copy uses fallback on older browsers

**Given** the browser does not support the Clipboard API
**When** the user clicks an emoji to copy
**Then** the application uses the `document.execCommand('copy')` fallback
**And** the copy still succeeds

---

### Requirement: Display visual feedback after copy

The application MUST provide immediate visual feedback to confirm the copy operation succeeded.

#### Scenario: Success indicator appears after copy

**Given** the user clicks an emoji to copy
**When** the copy operation succeeds
**Then** a checkmark icon or "Copied!" text appears near the clicked emoji
**And** the indicator is visible for 1.5 seconds
**And** the indicator automatically disappears after the duration
**And** the indicator does not block other emojis

#### Scenario: Row highlight during copy feedback

**Given** the user clicks an emoji to copy
**When** the copy operation succeeds
**Then** the row containing the emoji is highlighted with a distinct color
**And** the highlight fades out using a CSS transition
**And** the transition duration is 1.5 seconds

#### Scenario: Multiple rapid copies

**Given** the user clicks multiple emojis in quick succession
**When** each copy operation completes
**Then** each emoji shows its own feedback indicator
**And** previous indicators are replaced or dismissed
**And** the clipboard contains only the most recently clicked emoji

---

### Requirement: Handle copy errors gracefully

The application MUST handle copy operation failures without breaking the user experience.

#### Scenario: Copy fails due to browser permissions

**Given** the browser denies clipboard access
**When** the user clicks an emoji to copy
**Then** an error message is displayed to the user
**And** the message explains that clipboard permission is required
**And** the message suggests manually selecting and copying the emoji

#### Scenario: Copy fails on insecure context (HTTP)

**Given** the application is loaded over HTTP (not HTTPS)
**When** the user clicks an emoji to copy
**Then** the fallback copy method is attempted
**Or** an error message explains HTTPS is required for clipboard access

---

### Requirement: Indicate clickable emojis visually

The Character column MUST provide visual cues that emojis are clickable.

#### Scenario: Hover state on emoji character

**Given** the table displays emoji data
**When** the user hovers over an emoji in the Character column
**Then** the cursor changes to a pointer
**And** the emoji or cell has a hover effect (background change, border, etc.)
**And** the visual change indicates interactivity

#### Scenario: Keyboard accessibility for copy

**Given** the table is navigable via keyboard
**When** the user focuses on an emoji cell using Tab key
**And** presses Enter or Space
**Then** the emoji is copied to clipboard
**And** visual feedback is shown as if clicked

#### Scenario: Screen reader accessibility

**Given** a screen reader user navigates the table
**When** focus is on an emoji character cell
**Then** the screen reader announces "Click to copy [emoji name]"
**And** the role is indicated as "button" or "clickable"

