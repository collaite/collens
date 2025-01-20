/**
 * Constants Module
 * This module defines shared constants and types used throughout the witness system.
 * It provides centralized definitions for view types, labels, and other configuration
 * values that need to be consistent across the application.
 */

/**
 * Defines the available view modes for witness documents.
 * Each view provides a different way to interact with or display the witness content.
 *
 * Views:
 * - transcription: Shows the processed text version of the witness
 * - notes: Displays metadata and editorial notes
 * - xml: Shows the raw XML source
 *
 * This constant is used to:
 * - Generate view navigation controls
 * - Validate view selection
 * - Provide consistent labeling
 */
export const WITNESS_VIEWS = [
  { id: 'transcription', label: 'Version' },
  { id: 'notes', label: 'Metadata' },
  { id: 'xml', label: 'XML Source' }
] as const;

/**
 * Type representing the valid view modes for a witness.
 * Derived from the WITNESS_VIEWS constant to ensure type safety and consistency.
 *
 * Usage:
 * - Type checking for view selection
 * - Function parameters requiring view identification
 * - State management for current view
 */
export type WitnessView = typeof WITNESS_VIEWS[number]['id'];
