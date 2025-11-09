# Test Suite Documentation

This directory contains the test suite for COLLaiTE Collens, using Bun's built-in test runner.

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode (auto-rerun on file changes)
bun test:watch

# Run tests with coverage report
bun test:coverage

# Run specific test file
bun test tests/utils/xml-parser.test.ts

# Run tests matching a pattern
bun test --test-name-pattern "parseTEIXML"
```

## Test Structure

### `/tests/utils/` - Utility Function Tests

This directory contains tests for core utility functions used throughout the application.

#### `xml-parser.test.ts`
Tests for TEI XML parsing functionality.

**Covered Functionality:**
- Parsing TEI XML documents with different witness types (1a, 1b, 1c)
- Handling editorial elements: `<add>`, `<del>`, `<subst>`, `<unclear>`, `<supplied>`, `<note>`
- Processing page breaks (`<pb>`) and line breaks (`<lb>`)
- Nested editorial interventions
- Instant revisions
- Whitespace normalization
- Error handling for invalid XML

**Key Test Cases:**
- Simple TEI XML parsing
- Witness type 1a (original text with deletions preserved)
- Witness type 1b (intermediate state with partial edits)
- Witness type 1c (final text with all edits applied)
- Special elements (page breaks, unclear text, supplied text, notes)
- Edge cases (invalid XML, missing body element, whitespace handling)

#### `text-cleaner.test.ts`
Tests for text cleaning and normalization.

**Covered Functionality:**
- Removing XML tags
- Removing page markers
- Normalizing whitespace
- Trimming text
- Preserving special characters

**Key Test Cases:**
- XML tag removal
- Page marker removal
- Whitespace normalization
- Empty string handling
- Complex nested XML
- Special character preservation

#### `stats-utils.test.ts`
Tests for editorial statistics calculation.

**Covered Functionality:**
- Counting additions (`<add>`)
- Counting deletions (`<del>`)
- Counting substitutions (`<subst>`)
- Counting transpositions (`<transpose>`)
- Handling nested edits
- Error handling

**Key Test Cases:**
- Empty input handling
- Single edit type counting
- Multiple edit types
- Nested editorial interventions
- Invalid XML handling
- Complex document structures

#### `label-utils.test.ts`
Tests for witness label generation and type determination.

**Covered Functionality:**
- Converting witness IDs to labels (witness_1 → W1)
- Determining witness type from file names (MS/TS)
- Handling various naming patterns

**Key Test Cases:**
- Single and multi-digit witness numbers
- Manuscript file detection
- Typescript file detection
- Mixed file types
- Empty file arrays
- Case sensitivity

#### `file-utils.test.ts`
Tests for file handling utilities.

**Covered Functionality:**
- Extracting page numbers from file names
- Padding single-digit numbers
- Supporting various naming conventions
- Handling multiple image formats

**Key Test Cases:**
- Simple numbered files (1.png → 01)
- Files with prefixes (page-1.jpg → 01)
- Files with r suffix (01r.jpg → 01)
- Various image extensions (PNG, JPG, JPEG, WebP, TIFF, AVIF)
- Complex file names
- Multiple numbers in filename
- Edge cases (zero padding, no numbers)

#### `header-parser.test.ts`
Tests for TEI header metadata extraction.

**Covered Functionality:**
- Parsing TEI header hierarchical structure
- Extracting metadata (title, author, editor, etc.)
- Formatting tag names
- Handling nested elements
- Separating direct text from child element text

**Key Test Cases:**
- Simple header structures
- Complex nested headers
- Tag name formatting (camelCase → Capitalized Words)
- Multiple children at same level
- Direct text content extraction
- Nesting level preservation
- Whitespace handling
- Invalid XML handling

## Test Coverage

The test suite aims for comprehensive coverage of all utility functions:

- **XML Parser:** ~95% coverage (all main functions and edge cases)
- **Text Cleaner:** 100% coverage (simple utility function)
- **Stats Utils:** ~95% coverage (all statistical calculations)
- **Label Utils:** 100% coverage (all label generation scenarios)
- **File Utils:** ~90% coverage (page number extraction patterns)
- **Header Parser:** ~95% coverage (hierarchical structure parsing)

## Writing New Tests

When adding new tests, follow these guidelines:

### Test File Naming
- Use `.test.ts` extension
- Match the source file name (e.g., `xml-parser.ts` → `xml-parser.test.ts`)
- Place in the same relative directory structure

### Test Structure
```typescript
import { describe, test, expect } from 'bun:test';
import { functionToTest } from '../../src/lib/utils/module-name';

describe('functionToTest', () => {
  test('should handle basic case', () => {
    const result = functionToTest(input);
    expect(result).toBe(expected);
  });

  describe('Edge Cases', () => {
    test('should handle empty input', () => {
      const result = functionToTest('');
      expect(result).toBe('');
    });
  });
});
```

### Best Practices
1. **Descriptive test names:** Use clear, specific descriptions
2. **One assertion per test:** Keep tests focused
3. **Test edge cases:** Empty inputs, invalid data, boundary conditions
4. **Use test data:** Create sample XML/data at the top of describe blocks
5. **Group related tests:** Use nested `describe` blocks
6. **Document test intent:** Add comments for complex test scenarios

### Example Test
```typescript
describe('parseTEIXML', () => {
  const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <text>
    <body>
      <p>Sample text</p>
    </body>
  </text>
</TEI>`;

  test('should parse valid XML', () => {
    const result = parseTEIXML(sampleXML);
    expect(result).toContain('Sample text');
  });

  test('should return empty string for empty input', () => {
    const result = parseTEIXML('');
    expect(result).toBe('');
  });
});
```

## Continuous Integration

Tests should be run:
- Before committing changes
- In CI/CD pipeline before deployment
- After updating dependencies
- When refactoring code

## Troubleshooting

### Tests not running
```bash
# Ensure Bun is installed
bun --version

# Reinstall dependencies
bun install
```

### Test failures
```bash
# Run specific test file for debugging
bun test tests/utils/xml-parser.test.ts

# Run with verbose output
bun test --verbose
```

### Coverage issues
```bash
# Generate coverage report
bun test --coverage

# Check coverage directory for detailed reports
open coverage/index.html
```

## Technology

All tests use **Bun's built-in test runner**, which provides:
- Fast execution
- Jest-compatible API
- Built-in coverage reporting
- Watch mode for development
- No additional dependencies required

The test runner is part of the Bun runtime and requires no additional configuration or frameworks.
