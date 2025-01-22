/**
 * Cleans up parsed TEI XML content by removing XML tags while preserving text content.
 *
 * @param content - The parsed TEI XML content to clean
 * @returns Text content without XML tags
 */
export function cleanTextForComparison(content: string): string {
  return content
    // Remove all XML tags while preserving their content
    .replace(/<[^>]+>/g, '')
    // Remove page markers
    .replace(/\[Page \d+\]/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}
