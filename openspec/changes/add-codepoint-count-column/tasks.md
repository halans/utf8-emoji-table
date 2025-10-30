# Implementation Tasks

**Change ID:** `add-codepoint-count-column`

## Tasks

### 1. Update Parser Logic
- [ ] **File**: `src/parser.js`
- [ ] **Description**: Add `codePointCount` property to emoji objects in all parser functions
- [ ] **Details**: 
  - Modify `parseEmojiTest()` to calculate count from `codePoints` array length
  - Modify `parseEmojiSequences()` to calculate count from `codePoints` array length  
  - Modify `parseEmojiZWJSequences()` to calculate count from `codePoints` array length
  - Ensure count is accurate for all emoji types

### 2. Update HTML Table Structure  
- [ ] **File**: `src/index.html`
- [ ] **Description**: Add new table header for "Count" column
- [ ] **Details**:
  - Insert `<th>Count</th>` between "Code Point" and "Character" headers
  - Update any CSS selectors that depend on column position if needed

### 3. Update Table Rendering Logic
- [ ] **File**: `src/app.js` 
- [ ] **Description**: Include code point count in table row generation
- [ ] **Details**:
  - Modify `renderTable()` function to include new `<td>` for `codePointCount`
  - Position the count column between code point and character columns
  - Update empty state colspan from 5 to 6 columns

### 4. Update Styling (if needed)
- [ ] **File**: `src/styles.css`
- [ ] **Description**: Adjust table styling for new column
- [ ] **Details**:
  - Add styles for `.count` class if specific styling needed
  - Ensure table remains responsive with additional column
  - Update any grid or flexbox layouts that reference column count

### 5. Test the Implementation
- [ ] **File**: `tests/parser.test.js`
- [ ] **Description**: Add tests for code point count calculation
- [ ] **Details**:
  - Test simple emojis (count = 1)
  - Test skin tone variants (count = 2) 
  - Test ZWJ sequences (count > 2)
  - Verify count accuracy across all file formats

### 6. Update Documentation
- [ ] **File**: `README.md`
- [ ] **Description**: Update feature description to mention code point count
- [ ] **Details**:
  - Add "Code Point Count" to the list of displayed data
  - Update any screenshots or examples if present

## Validation Checklist

- [ ] All emoji objects have `codePointCount` property
- [ ] Count values are accurate for test data samples
- [ ] Table displays 6 columns with proper headers
- [ ] Empty state shows correct colspan
- [ ] No visual layout issues with additional column
- [ ] Search and pagination work unchanged
- [ ] Copy functionality remains intact