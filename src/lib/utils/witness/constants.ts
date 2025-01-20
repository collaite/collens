export const WITNESS_VIEWS = [
  { id: 'transcription', label: 'Version' },
  { id: 'notes', label: 'Metadata' },
  { id: 'xml', label: 'XML Source' }
] as const;

export type WitnessView = typeof WITNESS_VIEWS[number]['id'];
