export interface WitnessStats {
  additions: number;
  deletions: number;
  substitutions: number;
  transpositions: number;
}

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
