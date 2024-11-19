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

// Calculate nesting depth of an element
function getNestingDepth(node: Element): number {
  if (!node.children || node.children.length === 0) {
    return 1;
  }
  const depths = Array.from(node.children).map(child => 1 + getNestingDepth(child));
  return Math.max(...depths);
}

// Filter out edits that are children of other edits
function filterChildEdits(edits: Element[]): Element[] {
  return edits.filter(edit =>
    !edits.some(otherEdit =>
      otherEdit !== edit && otherEdit.contains(edit)
    )
  );
}

export function parseTEIXML(xmlText: string, witnessType: '1a' | '1b' | '1c' = '1c'): string {
  if (!xmlText) return '';

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      return xmlText;
    }

    // Process edits based on witness type
    function processEdits(doc: Document) {
      const addElements = Array.from(doc.getElementsByTagName('add'));
      const delElements = Array.from(doc.getElementsByTagName('del'));
      const allEdits = [...addElements, ...delElements];
      const topLevelEdits = filterChildEdits(allEdits);

      // Remove <subst> elements by unwrapping them
      const substElements = doc.getElementsByTagName('subst');
      while (substElements.length > 0) {
        const subst = substElements[0];
        const parent = subst.parentNode;
        while (subst.firstChild) {
          parent?.insertBefore(subst.firstChild, subst);
        }
        parent?.removeChild(subst);
      }

      // Process edits based on witness type
      if (witnessType === '1a') {
        // Undo all edits
        allEdits.forEach(edit => {
          if (edit.tagName === 'add') {
            edit.parentNode?.removeChild(edit);
          } else if (edit.tagName === 'del') {
            while (edit.firstChild) {
              edit.parentNode?.insertBefore(edit.firstChild, edit);
            }
            edit.parentNode?.removeChild(edit);
          }
        });
      } else if (witnessType === '1b') {
        // Apply instant edits and edits up to nesting level 2
        topLevelEdits.forEach(edit => {
          const depth = getNestingDepth(edit);
          const isInstant = edit.getAttribute('instant') === 'true';

          if (isInstant || depth <= 2) {
            // Apply the edit
            if (edit.tagName === 'add') {
              while (edit.firstChild) {
                edit.parentNode?.insertBefore(edit.firstChild, edit);
              }
              edit.parentNode?.removeChild(edit);
            } else if (edit.tagName === 'del') {
              edit.parentNode?.removeChild(edit);
            }
          } else {
            // Undo the edit
            if (edit.tagName === 'add') {
              edit.parentNode?.removeChild(edit);
            } else if (edit.tagName === 'del') {
              while (edit.firstChild) {
                edit.parentNode?.insertBefore(edit.firstChild, edit);
              }
              edit.parentNode?.removeChild(edit);
            }
          }
        });
      } else if (witnessType === '1c') {
        // Apply all edits
        allEdits.forEach(edit => {
          if (edit.tagName === 'add') {
            while (edit.firstChild) {
              edit.parentNode?.insertBefore(edit.firstChild, edit);
            }
            edit.parentNode?.removeChild(edit);
          } else if (edit.tagName === 'del') {
            edit.parentNode?.removeChild(edit);
          }
        });
      }
    }

    // Process edits before converting to text
    processEdits(xmlDoc);

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
