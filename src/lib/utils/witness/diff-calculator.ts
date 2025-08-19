/**
 * Difference Calculator Module
 * Provides utilities for calculating text differences and similarity scores
 * between witness versions for heatmap visualization.
 */

/**
 * Calculates the Levenshtein distance between two strings.
 * This is the minimum number of single-character edits required to change one string into another.
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculates a normalized similarity score between two strings.
 * Returns a value between 0 (completely different) and 1 (identical).
 */
export function calculateSimilarity(text1: string, text2: string): number {
  // Handle edge cases
  if (text1 === text2) return 1;
  if (!text1 || !text2) return 0;
  
  const distance = levenshteinDistance(text1, text2);
  const maxLength = Math.max(text1.length, text2.length);
  
  // Normalize the distance to a similarity score
  return 1 - (distance / maxLength);
}

/**
 * Calculates the difference percentage between two strings.
 * Returns a value between 0 (identical) and 100 (completely different).
 */
export function calculateDifferencePercentage(text1: string, text2: string): number {
  const similarity = calculateSimilarity(text1, text2);
  return Math.round((1 - similarity) * 100);
}

/**
 * Color scheme for difference visualization
 */
export const DIFFERENCE_COLORS = {
  none: '#22c55e',      // Green - No change
  minor: '#3b82f6',     // Blue - Minor changes (0-25%)
  moderate: '#eab308',  // Yellow - Moderate changes (25-50%)
  major: '#f97316',     // Orange - Major changes (50-75%)
  complete: '#ef4444'   // Red - Complete rewrite (75-100%)
} as const;

/**
 * Returns the appropriate color based on the difference percentage.
 */
export function getDifferenceColor(differencePercentage: number): string {
  if (differencePercentage === 0) return DIFFERENCE_COLORS.none;
  if (differencePercentage <= 25) return DIFFERENCE_COLORS.minor;
  if (differencePercentage <= 50) return DIFFERENCE_COLORS.moderate;
  if (differencePercentage <= 75) return DIFFERENCE_COLORS.major;
  return DIFFERENCE_COLORS.complete;
}

/**
 * Returns the color with opacity based on the difference percentage.
 * Higher differences result in more opaque colors.
 */
export function getDifferenceColorWithOpacity(differencePercentage: number): string {
  const color = getDifferenceColor(differencePercentage);
  const opacity = Math.min(0.3 + (differencePercentage / 100) * 0.7, 1);
  
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Compares text segments from multiple witnesses and returns a matrix of differences.
 * @param segments Array of text segments from different witnesses
 * @returns Matrix where [i][j] represents the difference percentage between witness i and j
 */
export function createDifferenceMatrix(segments: string[]): number[][] {
  const n = segments.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const diff = calculateDifferencePercentage(segments[i], segments[j]);
      matrix[i][j] = diff;
      matrix[j][i] = diff;
    }
  }
  
  return matrix;
}

/**
 * Finds the witnesses with the most differences from others.
 * Useful for highlighting outliers in the heatmap.
 */
export function findOutlierWitnesses(matrix: number[][], witnessIds: string[]): {
  id: string;
  averageDifference: number;
}[] {
  const outliers = witnessIds.map((id, index) => {
    const differences = matrix[index].filter((_, i) => i !== index);
    const avgDiff = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    return { id, averageDifference: avgDiff };
  });
  
  return outliers.sort((a, b) => b.averageDifference - a.averageDifference);
}

/**
 * Interface for heatmap cell data
 */
export interface HeatmapCell {
  witnessId: string;
  text: string;
  differenceScores: Map<string, number>;
  averageDifference: number;
  color: string;
}

/**
 * Prepares data for heatmap visualization from CollateX alignment data.
 */
export function prepareHeatmapData(
  alignmentData: any,
  columnIndex: number
): HeatmapCell[] {
  const column = alignmentData.table[columnIndex];
  const witnesses = alignmentData.witnesses;
  
  // Create difference matrix for this column
  const matrix = createDifferenceMatrix(column);
  
  // Prepare cell data
  const cells: HeatmapCell[] = witnesses.map((witnessId: string, index: number) => {
    const text = column[index];
    const differenceScores = new Map<string, number>();
    
    // Calculate differences with other witnesses
    let totalDifference = 0;
    let comparisonCount = 0;
    
    witnesses.forEach((otherId: string, otherIndex: number) => {
      if (index !== otherIndex && column[otherIndex]) {
        const diff = matrix[index][otherIndex];
        differenceScores.set(otherId, diff);
        totalDifference += diff;
        comparisonCount++;
      }
    });
    
    const averageDifference = comparisonCount > 0 ? totalDifference / comparisonCount : 0;
    
    return {
      witnessId,
      text,
      differenceScores,
      averageDifference,
      color: getDifferenceColorWithOpacity(averageDifference)
    };
  });
  
  return cells;
}