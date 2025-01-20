/**
 * Stats Utils Module
 * This module provides functionality for calculating and analyzing statistics
 * about editorial changes in TEI XML witness documents. It helps track different
 * types of textual modifications and their frequency.
 */

/**
 * Represents statistical information about editorial changes in a witness document.
 * These statistics help understand the extent and nature of modifications made to the text.
 */
export interface WitnessStats {
  /** Number of additions (<add> elements) in the document */
  additions: number;
  /** Number of deletions (<del> elements) in the document */
  deletions: number;
  /** Number of substitutions (<subst> elements) in the document */
  substitutions: number;
  /** Number of transpositions (<transpose> elements) in the document */
  transpositions: number;
}

/**
 * Analyzes a TEI XML document and calculates statistics about editorial changes.
 * This function counts different types of editorial interventions to provide
 * insights into how the text has been modified.
 *
 * Features:
 * - Counts additions (<add>)
 * - Counts deletions (<del>)
 * - Counts substitutions (<subst>)
 * - Counts transpositions (<transpose>)
 *
 * Error Handling:
 * - Returns zero counts if no XML content provided
 * - Handles XML parsing errors gracefully
 * - Returns zero counts on any error
 *
 * @param xmlText - The TEI XML content to analyze
 * @returns WitnessStats object containing counts of different edit types
 *
 * Example XML:
 * <text>
 *   <add>new text</add>
 *   <del>removed text</del>
 *   <subst><del>old</del><add>new</add></subst>
 *   <transpose>moved text</transpose>
 * </text>
 */
export function getWitnessStats(xmlText: string): WitnessStats {
  if (!xmlText) return { additions: 0, deletions: 0, substitutions: 0, transpositions: 0 };

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      return { additions: 0, deletions: 0, substitutions: 0, transpositions: 0 };
    }

    // Count elements
    const additions = xmlDoc.getElementsByTagName('add').length;
    const deletions = xmlDoc.getElementsByTagName('del').length;
    const substitutions = xmlDoc.getElementsByTagName('subst').length;
    const transpositions = xmlDoc.getElementsByTagName('transpose').length;

    return {
      additions,
      deletions,
      substitutions,
      transpositions
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return { additions: 0, deletions: 0, substitutions: 0, transpositions: 0 };
  }
}
