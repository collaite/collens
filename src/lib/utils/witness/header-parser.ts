/**
 * Header Parser Module
 * This module is responsible for parsing and processing TEI headers in XML documents.
 * It extracts structured information about the document's metadata, including titles,
 * authors, revisions, and other bibliographic information.
 */

/**
 * Represents a single entry in the TEI header hierarchy.
 * Headers are organized in a tree structure where each entry can have children,
 * allowing for representation of nested metadata elements.
 */
export interface HeaderEntry {
  /** The formatted name of the XML tag */
  tag: string;
  /** The direct text content of the element, excluding child element content */
  content: string;
  /** The nesting level in the header hierarchy (0 for root level) */
  level: number;
  /** Child header entries, representing nested elements */
  children: HeaderEntry[];
}

/**
 * Parses the TEI header section of an XML document into a structured format.
 * This function processes the hierarchical structure of the TEI header while
 * preserving the relationships between elements and their content.
 *
 * Features:
 * - Extracts and formats tag names for readability
 * - Preserves hierarchical structure of header elements
 * - Separates direct text content from child element content
 * - Handles nested metadata elements
 *
 * Error Handling:
 * - Returns empty array if no XML content provided
 * - Handles XML parsing errors gracefully
 * - Warns if no teiHeader element found
 *
 * @param xmlText - The TEI XML content to parse
 * @returns Array of HeaderEntry objects representing the header structure
 *
 * Example header structure:
 * <teiHeader>
 *   <fileDesc>
 *     <titleStmt>
 *       <title>Document Title</title>
 *     </titleStmt>
 *   </fileDesc>
 * </teiHeader>
 */
export function parseTEIHeader(xmlText: string): HeaderEntry[] {
  if (!xmlText) return [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      return [];
    }

    const teiHeader = xmlDoc.querySelector('teiHeader');
    if (!teiHeader) {
      console.warn('No teiHeader element found in XML');
      return [];
    }

    /**
     * Recursively processes a header node and its children to build the header hierarchy.
     *
     * @param node - The XML element to process
     * @param level - The current nesting level (0 for root level)
     * @returns Array of HeaderEntry objects for the current node and its children
     */
    function processHeaderNode(node: Element, level: number = 0): HeaderEntry[] {
      const entries: HeaderEntry[] = [];

      // Process each child element
      Array.from(node.children).forEach(child => {
        const entry: HeaderEntry = {
          tag: formatTagName(child.tagName),
          content: getDirectTextContent(child),
          level,
          children: processHeaderNode(child, level + 1)
        };
        entries.push(entry);
      });

      return entries;
    }

    /**
     * Formats an XML tag name into a more readable form.
     * Example: "fileDesc" becomes "File Desc"
     *
     * @param tagName - The XML tag name to format
     * @returns Formatted tag name with proper spacing and capitalization
     */
    function formatTagName(tagName: string): string {
      return tagName
        .replace(/([A-Z])/g, ' $1')  // Add space before capitals
        .split(/(?=[A-Z])/)  // Split on capital letters
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize first letter
        .join(' ')  // Join with spaces
        .trim();
    }

    /**
     * Extracts only the direct text content of an element, excluding text from child elements.
     * This ensures we don't duplicate text content in the hierarchy.
     *
     * @param node - The XML element to extract text from
     * @returns Concatenated and trimmed text content
     */
    function getDirectTextContent(node: Element): string {
      // Get only direct text nodes, excluding text from child elements
      return Array.from(node.childNodes)
        .filter(child => child.nodeType === Node.TEXT_NODE)
        .map(child => child.textContent?.trim())
        .filter(text => text && text.length > 0)  // Filter out empty strings
        .join(' ')
        .trim();
    }

    // Start processing from the teiHeader's children
    return processHeaderNode(teiHeader);
  } catch (error) {
    console.error('Error parsing XML:', error);
    return [];
  }
}
