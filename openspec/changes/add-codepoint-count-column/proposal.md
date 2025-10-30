# Add Code Point Count Column

**Change ID:** `add-codepoint-count-column`
**Status:** Draft
**Created:** 2025-10-30

## Why

Users need to understand the complexity of emoji compositions by seeing how many individual Unicode code points make up each emoji. This helps distinguish simple emojis (1 code point) from complex sequences like skin tone modifiers, gender variants, and ZWJ sequences (multiple code points).

## What Changes

- Add a new "Code Point Count" column to the emoji table between "Code Point" and "Character" columns
- Calculate and display the number of individual Unicode code points for each emoji
- Update table display spec to include the new column
- Modify parser logic to extract and count code points from the raw Unicode data

## Impact

- **Affected specs**: Modified capability - `table-display` 
- **Affected code**: 
  - `index.html` - Add new table header
  - `app.js` - Update table rendering with new column
  - `parser.js` - Add code point count calculation to emoji objects

## Goals

1. Display the count of Unicode code points for each emoji
2. Help users understand emoji complexity (simple vs. compound emojis)
3. Maintain table layout and performance with the additional column
4. Provide accurate code point counts for all emoji types (test, sequences, ZWJ)

## Non-Goals

- Breaking down individual code points in the display (keep existing "Code Point" format)
- Sorting or filtering by code point count (existing search/pagination sufficient)
- Detailed analysis of code point types (modifiers, joiners, etc.)

## Scope

This change modifies one existing capability:

1. **Table Display** (`table-display`): Add new column showing code point count between existing "Code Point" and "Character" columns

## Technical Details

### Current Table Structure
| Code Point | Character | UTF-8 | Bytes | Name |
|------------|-----------|-------|-------|------|

### New Table Structure  
| Code Point | Count | Character | UTF-8 | Bytes | Name |
|------------|-------|-----------|-------|-------|------|

### Examples
- Simple emoji: "U+1F600" → Count: 1
- Skin tone variant: "U+1F44D U+1F3FB" → Count: 2  
- ZWJ sequence: "U+1F468 U+200D U+1F469 U+200D U+1F467" → Count: 5

The count will be extracted from the existing `codePoint` field by splitting on spaces and counting the resulting "U+" prefixed values.