export interface HeaderEntry {
  tag: string;
  content: string;
  level: number;
  children: HeaderEntry[];
}

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

    function formatTagName(tagName: string): string {
      return tagName
        .replace(/([A-Z])/g, ' $1')  // Add space before capitals
        .split(/(?=[A-Z])/)  // Split on capital letters
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize first letter
        .join(' ')  // Join with spaces
        .trim();
    }

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
