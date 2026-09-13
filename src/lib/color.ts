const PALETTE = [
  "#0F766E", "#B45309", "#7C3AED", "#BE123C", "#0369A1", "#4D7C0F", "#A21CAF", "#C2410C",
];

export function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
