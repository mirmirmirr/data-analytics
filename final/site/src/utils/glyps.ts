// 🎨 Valence → Color
export function valenceToColor(valence: number, energy = 0): string {
  const hue = 240 - valence * 180;

  const saturation = 60 + energy * 30; // more energy = richer color
  const lightness = 35 + energy * 25;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// 🎧 Tempo → number of lines
export function tempoToLines(tempo: number) {
  const minTempo = 60;
  const maxTempo = 200;

  const minLines = 40;
  const maxLines = 120;

  const normalized = (tempo - minTempo) / (maxTempo - minTempo);
  return Math.round(minLines + normalized * (maxLines - minLines));
}
