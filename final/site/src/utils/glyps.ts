// 🎨 Valence → Color
export function valenceToColor(valence: number) {
  // blue (220) → yellow (60)
  const hue = 220 - valence * 160;
  return `hsl(${hue}, 80%, 60%)`;
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
