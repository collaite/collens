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
          result += '\n[Page Break]\n';
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
  { id: 'notes', label: 'Notes' }
] as const;

export type WitnessView = typeof WITNESS_VIEWS[number]['id'];
