# Version Comparison Heatmap

## Overview

The Version Comparison Heatmap is a powerful visualization tool that enables researchers to quickly identify and analyze textual variations across multiple witness versions. This feature provides an intuitive, color-coded matrix view that highlights the degree of difference between text segments, making it easy to spot patterns of variation, identify outlier witnesses, and explore specific textual changes.

## Key Features

### Visual Difference Mapping
- **Color-coded intensity**: Cells are colored based on the percentage of textual difference
- **At-a-glance analysis**: Quickly identify which witnesses contain significant variations
- **Pattern recognition**: Spot clusters of similar or divergent text across witnesses

### Interactive Exploration
- **Click-to-compare**: Click any cell to view detailed text comparisons
- **Hover tooltips**: See quick difference percentages without clicking
- **Popover details**: Compare selected text with all other witness versions simultaneously

### Flexible Viewing Options
- **Dual view modes**: Switch between traditional table view and heatmap visualization
- **Orientation control**: Toggle between horizontal and vertical layouts
- **Responsive design**: Adapts to different screen sizes and content lengths

## Using the Heatmap

### Accessing the Feature

1. Navigate to any document with multiple witnesses
2. Go to the CollateX alignment view (`/document/x?id=[document-id]`)
3. Wait for the alignment data to load
4. Click the "Heatmap View" button in the control bar

### View Controls

#### View Mode Toggle
```
[Table View] [Heatmap View]
```
- **Table View**: Traditional alignment table showing text in rows/columns
- **Heatmap View**: Color-coded matrix visualization of differences

#### Orientation Toggle
- **Horizontal**: Witnesses as rows, text positions as columns
- **Vertical**: Text positions as sections, witnesses within each section

### Understanding the Color Scale

The heatmap uses a five-color gradient system to represent textual differences:

| Color | Difference Range | Interpretation |
|-------|-----------------|----------------|
| 🟢 Green | 0% | Identical text across witnesses |
| 🔵 Blue | 1-25% | Minor variations (punctuation, spelling) |
| 🟡 Yellow | 26-50% | Moderate changes (word substitutions) |
| 🟠 Orange | 51-75% | Major revisions (phrase replacements) |
| 🔴 Red | 76-100% | Complete rewrite or missing text |

### Interacting with Cells

#### Hover Interaction
- Hover over any cell to see:
  - Witness identifier (e.g., W1, W3, W14)
  - Average difference percentage
  - Individual difference scores with other witnesses

#### Click Interaction
Clicking a cell opens a detailed comparison popover showing:
1. **Current witness text** (highlighted in primary color)
2. **All other witness versions** with:
   - Witness identifiers
   - Difference percentage badges
   - Full text content for comparison

#### Popover Navigation
- Click outside the popover to close
- Click the X button to dismiss
- Scroll within the popover for long text segments

## Technical Implementation

### Difference Calculation Algorithm

The heatmap uses the **Levenshtein distance algorithm** to calculate text differences:

```typescript
// Example calculation
text1: "The quick brown fox"
text2: "The quick brown wolf"
// Levenshtein distance: 3
// Similarity: 84%
// Difference: 16% (displayed as blue)
```

### Component Architecture

#### Core Components

1. **VersionHeatmap.svelte**
   - Main visualization component
   - Handles user interactions
   - Manages popover state

2. **diff-calculator.ts**
   - Text comparison algorithms
   - Color mapping functions
   - Matrix generation utilities

#### Key Functions

```typescript
// Calculate similarity between two text segments
calculateSimilarity(text1: string, text2: string): number

// Get color for difference percentage
getDifferenceColor(differencePercentage: number): string

// Prepare heatmap data for visualization
prepareHeatmapData(alignmentData: any, columnIndex: number): HeatmapCell[]
```

### Data Structure

The heatmap consumes CollateX alignment data:

```typescript
interface AlignmentData {
  witnesses: string[];        // ["1", "3", "14"]
  table: string[][];         // Text segments by position and witness
}

interface HeatmapCell {
  witnessId: string;
  text: string;
  differenceScores: Map<string, number>;
  averageDifference: number;
  color: string;
}
```

## Use Cases

### Research Applications

1. **Textual Criticism**
   - Identify scribal variations
   - Track editorial changes
   - Analyze transmission patterns

2. **Version Control Analysis**
   - Compare draft versions
   - Track revision history
   - Identify authorial intentions

3. **Collation Quality Check**
   - Verify alignment accuracy
   - Spot potential errors
   - Validate witness relationships

### Workflow Integration

The heatmap integrates seamlessly with existing features:

1. **Witness Management**
   - Toggle witnesses on/off
   - Filter by witness type
   - Adjust comparison scope

2. **Export Options**
   - Export JSON alignment data
   - Save visualization screenshots
   - Generate comparison reports

## Advanced Features

### Outlier Detection

The system automatically identifies witnesses with high average differences:

```typescript
findOutlierWitnesses(matrix: number[][], witnessIds: string[]): {
  id: string;
  averageDifference: number;
}[]
```

### Invariant Highlighting

Text segments that are identical across all witnesses receive special treatment:
- Green border in table view
- Consistent green coloring in heatmap
- Quick identification of stable text

### Performance Optimization

The heatmap is optimized for large datasets:
- Efficient difference calculation with memoization
- Lazy rendering for large matrices
- Truncated text previews with full content on demand

## Customization

### Color Schemes

The color scheme can be customized in `diff-calculator.ts`:

```typescript
export const DIFFERENCE_COLORS = {
  none: '#22c55e',      // Green
  minor: '#3b82f6',     // Blue
  moderate: '#eab308',  // Yellow
  major: '#f97316',     // Orange
  complete: '#ef4444'   // Red
}
```

### Threshold Adjustment

Modify difference thresholds for different research needs:

```typescript
function getDifferenceColor(percentage: number): string {
  if (percentage === 0) return DIFFERENCE_COLORS.none;
  if (percentage <= 25) return DIFFERENCE_COLORS.minor;
  // Adjust thresholds as needed
}
```

## Best Practices

### Effective Usage

1. **Start with overview**: Use vertical orientation for initial survey
2. **Focus on hotspots**: Click red/orange cells first
3. **Compare systematically**: Work through witnesses pair by pair
4. **Document findings**: Export data for further analysis

### Interpretation Guidelines

- **Green dominance**: High textual stability
- **Mixed colors**: Normal variation patterns
- **Red clusters**: Significant textual divergence
- **Isolated colors**: Potential scribal errors or unique readings

## Troubleshooting

### Common Issues

1. **Empty cells**: Witness may lack text at that position
2. **Uniform coloring**: Check if witnesses are properly aligned
3. **Performance lag**: Reduce number of active witnesses

### Tips for Large Datasets

- Start with a subset of witnesses
- Use filters to focus on specific sections
- Export data for offline analysis of complex patterns

## Future Enhancements

Planned improvements include:
- Customizable color schemes
- Statistical analysis overlay
- Export to image formats
- Batch comparison mode
- Integration with annotation tools

## API Reference

### Component Props

```typescript
// VersionHeatmap.svelte
export let alignmentData: AlignmentData;
export let isVerticalOrientation: boolean = true;
```

### Utility Functions

```typescript
// Calculate difference percentage
calculateDifferencePercentage(text1: string, text2: string): number

// Create comparison matrix
createDifferenceMatrix(segments: string[]): number[][]

// Get color with opacity
getDifferenceColorWithOpacity(differencePercentage: number): string
```

### Events

```typescript
// Dispatched when user interacts with heatmap
dispatch('cellClick', { row, col, cell });
dispatch('cellHover', { row, col });
```

## Conclusion

The Version Comparison Heatmap transforms complex textual collation data into an intuitive, interactive visualization. By combining color-coded difference mapping with detailed text comparison tools, researchers can efficiently analyze witness variations and identify patterns that might be missed in traditional table views. This feature represents a significant enhancement to the digital humanities toolkit for textual criticism and version comparison.