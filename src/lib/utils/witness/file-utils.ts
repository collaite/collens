import type { Folder, FileData } from '$lib/stores/indexeddb-store';

export function getPageNumber(file: FileData): string {
  // Try to match different number patterns in filenames
  const patterns = [
    /(\d+)\.(?:png|jpg|jpeg|webp|tiff|avif)$/i,  // Simple numbered files like "1.png"
    /-(\d+)r?\./i,  // Files like "something-01r.jpg" or "something-1.jpg"
    /(\d+)/  // Fallback: just get the first number in the filename
  ];

  for (const pattern of patterns) {
    const match = file.name.match(pattern);
    if (match) {
      // Pad single digit numbers with leading zero for correct string sorting
      const num = match[1];
      return num.length === 1 ? '0' + num : num;
    }
  }
  return '';
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
