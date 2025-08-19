# Heatmap Usage Examples

## Example 1: Basic Text Comparison

### Scenario
Comparing three witnesses of a medieval manuscript where W1 is the original, W3 is a later copy, and W14 is a modern transcription.

### Sample Data
```javascript
const witnesses = {
  W1: "Een mooie vrouwenhand, elegant niettegenstaande",
  W3: "Een mooie vrouwenhand, elegant niettegenstaande", 
  W14: "Een mooie vrouwenhand elegant niettegenstaande de vergroting"
};
```

### Heatmap Visualization
- **W1 ↔ W3**: Green (0% difference) - Identical text
- **W1 ↔ W14**: Blue (15% difference) - Minor punctuation change and addition
- **W3 ↔ W14**: Blue (15% difference) - Same variations

### Interpretation
The text shows high stability between W1 and W3, with W14 introducing minor editorial changes.

## Example 2: Identifying Major Revisions

### Scenario
Analyzing different draft versions of a literary work.

### Sample Alignment Data
```typescript
const alignmentData = {
  witnesses: ["1", "3", "14"],
  table: [
    ["Het begin", "Het begin", "In het begin"],  // Position 1
    ["was moeilijk", "was moeilijk", "was het moeilijk"],  // Position 2
    ["maar het lukte", "maar het werkte", "en het slaagde"]  // Position 3
  ]
};
```

### Expected Heatmap Colors

#### Position 1:
- W1 ↔ W3: Green (identical)
- W1 ↔ W14: Blue (minor addition)
- W3 ↔ W14: Blue (minor addition)

#### Position 2:
- W1 ↔ W3: Green (identical)
- W1 ↔ W14: Blue (word insertion)
- W3 ↔ W14: Blue (word insertion)

#### Position 3:
- W1 ↔ W3: Yellow (word substitution "lukte" → "werkte")
- W1 ↔ W14: Orange (phrase change "maar het lukte" → "en het slaagde")
- W3 ↔ W14: Orange (different verbs and conjunctions)

## Example 3: Working with the Popover

### Click Interaction Flow

1. **User clicks on an orange cell** (W1, Position 3)

2. **Popover displays**:
```
┌─────────────────────────────────────┐
│ Text Comparison - Position 3        │
│                                     │
│ W1 (Current)                       │
│ "maar het lukte"                   │
│                                     │
│ W3                    [45% different]│
│ "maar het werkte"                  │
│                                     │
│ W14                   [68% different]│
│ "en het slaagde"                   │
└─────────────────────────────────────┘
```

3. **Analysis reveals**:
   - Conjunction change: "maar" → "en"
   - Verb variations: "lukte" → "werkte" → "slaagde"
   - Progressive semantic shift in meaning

## Example 4: Vertical vs Horizontal Orientation

### Horizontal Layout (Best for few witnesses)
```
        Pos1    Pos2    Pos3    Pos4    Pos5
W1      [...]   [...]   [...]   [...]   [...]
W3      [...]   [...]   [...]   [...]   [...]
W14     [...]   [...]   [...]   [...]   [...]
```

**Use when**:
- Comparing 2-5 witnesses
- Need to track individual witness patterns
- Following a specific witness through the text

### Vertical Layout (Best for many positions)
```
Position 1
[W1] [W3] [W14] [W15] [W22]

Position 2
[W1] [W3] [W14] [W15] [W22]

Position 3
[W1] [W3] [W14] [W15] [W22]
```

**Use when**:
- Analyzing specific text segments
- Comparing many witnesses (5+)
- Focusing on variation points

## Example 5: Research Workflow

### Step-by-Step Analysis

1. **Initial Overview**
   ```typescript
   // Load document and enable all witnesses
   loadDocument('manuscript_001');
   witnessesStore.enableAll();
   ```

2. **Switch to Heatmap View**
   ```typescript
   viewMode = 'heatmap';
   isVerticalOrientation = true;
   ```

3. **Identify Hotspots**
   - Scan for red/orange cells
   - Note positions with high variation

4. **Detailed Investigation**
   ```typescript
   // Click on high-variation cells
   handleCellClick(event, row: 2, col: 5, cell);
   // Popover shows detailed comparison
   ```

5. **Filter and Refocus**
   ```typescript
   // Disable outlier witnesses for cleaner view
   witnessesStore.toggleWitness('W22');
   // Refresh heatmap
   fetchCollation();
   ```

6. **Export Findings**
   ```typescript
   // Export alignment data
   exportJSON(alignmentData);
   ```

## Example 6: Color Interpretation Guide

### Reading the Heatmap

```
Legend:
🟢 = "The quick brown fox"    vs  "The quick brown fox"     (0% diff)
🔵 = "The quick brown fox"    vs  "The quick, brown fox"    (5% diff)
🟡 = "The quick brown fox"    vs  "A quick brown fox"       (35% diff)
🟠 = "The quick brown fox"    vs  "The slow brown wolf"     (60% diff)
🔴 = "The quick brown fox"    vs  "A lazy dog sleeps"       (95% diff)
```

### Pattern Recognition

#### Stable Text Pattern
```
🟢 🟢 🟢 🟢 🟢
🟢 🟢 🟢 🟢 🟢
🟢 🟢 🟢 🟢 🟢
```
**Interpretation**: High fidelity copying, minimal variation

#### Progressive Variation Pattern
```
🟢 🔵 🔵 🟡 🟡
🟢 🟢 🔵 🟡 🟠
🟢 🟢 🟢 🔵 🟡
```
**Interpretation**: Gradual divergence over text transmission

#### Outlier Pattern
```
🟢 🟢 🔴 🟢 🟢
🟢 🟢 🔴 🟢 🟢
🔴 🔴 🟢 🔴 🔴
```
**Interpretation**: W3 contains unique readings or errors

## Example 7: Advanced Filtering

### Focusing on Specific Variations

```typescript
// Custom filter for major differences only
function filterMajorDifferences(cells: HeatmapCell[]) {
  return cells.filter(cell => cell.averageDifference > 50);
}

// Highlight invariant sections
function highlightInvariant(columnIndex: number) {
  const column = alignmentData.table[columnIndex];
  const uniqueValues = new Set(column.filter(v => v.length > 0));
  return uniqueValues.size === 1;
}
```

## Example 8: Performance Optimization

### Handling Large Datasets

```typescript
// For 20+ witnesses, use progressive loading
const BATCH_SIZE = 10;

async function loadWitnessesBatched() {
  const allWitnesses = $witnessesStore;
  
  for (let i = 0; i < allWitnesses.length; i += BATCH_SIZE) {
    const batch = allWitnesses.slice(i, i + BATCH_SIZE);
    
    // Enable batch
    batch.forEach(w => witnessesStore.toggleWitness(w.id, true));
    
    // Fetch and analyze
    await fetchCollation();
    
    // Process results
    analyzeHeatmapData();
    
    // Optional: disable batch before next
    if (i + BATCH_SIZE < allWitnesses.length) {
      batch.forEach(w => witnessesStore.toggleWitness(w.id, false));
    }
  }
}
```

## Example 9: Integration with Other Tools

### Combining with CollateX Export

```typescript
// Get heatmap insights
const outliers = findOutlierWitnesses(differenceMatrix, witnessIds);

// Export enhanced data
const enhancedExport = {
  ...alignmentData,
  heatmapAnalysis: {
    outliers,
    averageDifferences: calculateAverages(),
    hotspots: identifyHotspots(),
    timestamp: new Date().toISOString()
  }
};

// Save for external analysis
downloadJSON(enhancedExport, 'collation_with_heatmap_analysis.json');
```

## Example 10: Custom Visualizations

### Creating Summary Statistics

```typescript
function generateHeatmapStats(alignmentData: AlignmentData) {
  const stats = {
    totalPositions: alignmentData.table.length,
    witnessCount: alignmentData.witnesses.length,
    invariantPositions: 0,
    highVariationPositions: 0,
    averageVariation: 0
  };
  
  alignmentData.table.forEach((column, index) => {
    const matrix = createDifferenceMatrix(column);
    const avgDiff = calculateAverageFromMatrix(matrix);
    
    if (avgDiff === 0) stats.invariantPositions++;
    if (avgDiff > 50) stats.highVariationPositions++;
    stats.averageVariation += avgDiff;
  });
  
  stats.averageVariation /= stats.totalPositions;
  
  return stats;
}
```

### Visual Summary Display

```svelte
<div class="stats shadow">
  <div class="stat">
    <div class="stat-title">Total Positions</div>
    <div class="stat-value">{stats.totalPositions}</div>
  </div>
  
  <div class="stat">
    <div class="stat-title">Invariant</div>
    <div class="stat-value text-success">{stats.invariantPositions}</div>
    <div class="stat-desc">{(stats.invariantPositions / stats.totalPositions * 100).toFixed(1)}%</div>
  </div>
  
  <div class="stat">
    <div class="stat-title">High Variation</div>
    <div class="stat-value text-warning">{stats.highVariationPositions}</div>
    <div class="stat-desc">>&nbsp;50% difference</div>
  </div>
</div>
```

## Tips and Best Practices

1. **Start broad, then narrow**: Begin with all witnesses to identify patterns, then filter
2. **Use both orientations**: Switch between layouts for different perspectives
3. **Document findings**: Screenshot interesting patterns for reports
4. **Combine views**: Use table view for reading, heatmap for analysis
5. **Check extremes**: Investigate both green (identical) and red (different) clusters
6. **Validate surprises**: Unexpected colors may indicate alignment issues
7. **Export regularly**: Save data at key analysis points
8. **Compare systematically**: Work through witness pairs methodically
9. **Note context**: Consider historical/editorial context when interpreting variations
10. **Collaborate**: Share heatmap screenshots for team discussions