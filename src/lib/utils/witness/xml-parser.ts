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

function processNode(node: Node): string {
  let result = '';

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      // Preserve the text content but normalize whitespace
      const text = child.textContent?.replace(/\s+/g, ' ') || '';
      result += text;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element;

      switch (element.tagName.toLowerCase()) {
        case 'div':
          if (element.getAttribute('type') === 'page') {
            const pageNum = element.getAttribute('n');
            if (pageNum) {
              result += pageNum === '1' ? `[Page ${pageNum}]\n` : `\n\n[Page ${pageNum}]\n`;
            }
          }
          result += processNode(child);
          break;
        case 'del':
          const delInstant = (child as Element).getAttribute('data-instant') === 'true';
          result += delInstant ? `<del-instant>${processNode(child)}</del-instant>` : `[${processNode(child)}]`;
          break;
        case 'add':
          const addInstant = (child as Element).getAttribute('data-instant') === 'true';
          result += addInstant ? `<add-instant>${processNode(child)}</add-instant>` : `{${processNode(child)}}`;
          break;
        case 'unclear':
          result += `⟨${processNode(child)}⟩`;
          break;
        case 'supplied':
          result += `<${processNode(child)}>`;
          break;
        case 'note':
          // Check if the previous sibling is a metamark with ₰
          const prevSibling = element.previousElementSibling;
          const isMetamarkNote = prevSibling?.tagName.toLowerCase() === 'metamark' &&
            prevSibling.textContent?.includes('₰');

          // Include the metamark symbol if it exists
          const metamarkSymbol = isMetamarkNote ? '₰ ' : '';
          result += `((${metamarkSymbol}${processNode(child)}))`;
          break;
        case 'lb':
          // Only add line breaks for explicit <lb> tags
          result += '\n';
          break;
        case 'pb':
          const pageNum = element.getAttribute('n');
          result += pageNum ? (pageNum === '1' ? `[Page ${pageNum}]\n` : `\n\n[Page ${pageNum}]\n`) : '\n[Page Break]\n';
          break;
        case 'p':
          result += `<p>${processNode(child)}</p>`;
          break;
        default:
          result += processNode(child);
      }
    }
  });

  return result;
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
        // Keep instant revisions, undo all other edits
        allEdits.forEach(edit => {
          const isInstant = edit.getAttribute('instant') === 'true';

          if (isInstant) {
            // Keep instant revisions but mark them for special formatting
            edit.setAttribute('data-instant', 'true');
          } else {
            // Handle non-instant edits as before
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
