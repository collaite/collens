import type { Folder, FileData } from '$lib/stores/indexeddb-store';

export function getWitnessLabel(witnessId: string): string {
  return `W${witnessId}`;
}

export function getPageNumber(file: FileData): string {
  const match = file.name.match(/(\d+)\.png$/);
  return match ? match[1] : '';
}

export async function loadXMLContent(folder: Folder): Promise<string | null> {
  // Find XML file in the folder
  const xmlFile = folder.files.find((f) => f.name.endsWith('.xml'));
  if (!xmlFile) return null;

  try {
    // Since the file content is stored as a data URL in src, we need to fetch it
    const response = await fetch(xmlFile.src);
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error loading XML content:', error);
    return null;
  }
}

interface HeaderEntry {
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

export function parseTEIXML(xmlText: string, showParsedText: boolean = true): string {
  if (!xmlText) return '';
  if (!showParsedText) return xmlText;

  try {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      return xmlText;
    }

    // Find the body element
    const bodyElement = xmlDoc.querySelector('body');
    if (!bodyElement) {
      console.warn('No body element found in XML');
      return xmlText;
    }

    return processNode(bodyElement);
  } catch (error) {
    console.error('Error parsing XML:', error);
    return xmlText;
  }
}

function processNode(node: Node): string {
  let result = '';

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element;

      switch (element.tagName.toLowerCase()) {
        case 'div':
          if (element.getAttribute('type') === 'page') {
            const pageNum = element.getAttribute('n');
            if (pageNum) {
              result += `\n[Page ${pageNum}]\n`;
            }
          }
          result += processNode(child);
          break;
        case 'del':
          result += `[${processNode(child)}]`;
          break;
        case 'add':
          result += `{${processNode(child)}}`;
          break;
        case 'unclear':
          result += `⟨${processNode(child)}⟩`;
          break;
        case 'supplied':
          result += `<${processNode(child)}>`;
          break;
        case 'note':
          result += `(*${processNode(child)}*)`;
          break;
        case 'lb':
          result += '\n';
          break;
        case 'pb':
          const pageNum = element.getAttribute('n');
          result += pageNum ? `\n[Page ${pageNum}]\n` : '\n[Page Break]\n';
          break;
        default:
          result += processNode(child);
      }
    }
  });

  return result;
}

export const WITNESS_VIEWS = [
  { id: 'transcription', label: 'Transcription' },
  { id: 'notes', label: 'Notes' },
  { id: 'xml', label: 'XML Source' }
] as const;

export type WitnessView = typeof WITNESS_VIEWS[number]['id'];