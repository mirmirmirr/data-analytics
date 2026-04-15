import seedrandom from "seedrandom";
import type { Song } from "@/types/song";
import { tempoToLines, valenceToColor } from "@/utils/glyps";

type Props = {
  song: Song;
  size?: number;
};

export default function SongGlyph({ song, size = 120 }: Props) {
  const center = size / 2;

  // 🎯 Seeded RNG (stable per song)
  const rng = seedrandom(song.track_id);

  // 🎨 Encodings
  const color = valenceToColor(song.valence);
  const lines = tempoToLines(song.tempo);

  const maxLength = size * (0.25 + song.energy * 0.35);
  const angleStep = (Math.PI * 2) / lines;

  const fillOpacity = 1 - song.instrumentalness;

  // 🎯 Danceability → angular + length consistency
  const angleJitterAmount = (1 - song.danceability) * 0.25;
  const variance = (1 - song.danceability) * maxLength * 0.5;

  // 🎯 Acousticness → wobble + texture
  const wobbleAmount = song.acousticness * 6;

  function getLineLength() {
    const bias = Math.pow(rng(), 1 + song.danceability * 3);
    const offset = (1 - bias) * variance;

    let length = maxLength - offset;

    const noiseAmount = maxLength * 0.08;
    length += (rng() - 0.5) * noiseAmount;

    const spikeChance = 0.08 + (1 - song.danceability) * 0.12;

    if (rng() < spikeChance) {
      const spikeBoost = maxLength * (0.1 + rng() * 0.15);
      length += spikeBoost;
    }

    return length;
  }

  function getStrokeDasharray() {
    if (song.acousticness < 0.2) return "0"; // clean
    if (song.acousticness < 0.5) return "2 2"; // light texture
    if (song.acousticness < 0.8) return "3 4"; // medium
    return "1 6"; // airy / organic
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-${size * 0.125} -${size * 0.125} ${size * 1.25} ${size * 1.25}`}
    >
      <defs>
        <radialGradient id={`bg-${song.track_id}`}>
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="25%" stopColor={color} stopOpacity={0.12} />
          <stop offset="50%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* 🌟 Glow */}
      <circle
        cx={center}
        cy={center}
        r={size * 1.2}
        fill={`url(#bg-${song.track_id})`}
      />

      {/* 🎵 Radial Lines (now CURVED) */}
      {[...Array(lines)].map((_, i) => {
        const baseAngle = i * angleStep;

        const angleJitter = (rng() - 0.5) * angleJitterAmount;
        const angle = baseAngle + angleJitter;

        const length = getLineLength();

        // Start point
        const x1 = center;
        const y1 = center;

        // End point
        const x2 = center + Math.cos(angle) * length;
        const y2 = center + Math.sin(angle) * length;

        // 🎯 Wobble midpoint (organic curve)
        const midRadius = length * 0.6;

        const mx =
          center + Math.cos(angle) * midRadius + (rng() - 0.5) * wobbleAmount;

        const my =
          center + Math.sin(angle) * midRadius + (rng() - 0.5) * wobbleAmount;

        return (
          <path
            key={i}
            d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
            stroke={color}
            strokeWidth={1.5}
            strokeOpacity={0.85}
            fill="none"
            strokeDasharray={getStrokeDasharray()}
          />
        );
      })}

      {/* 🎹 Center */}
      <circle
        cx={center}
        cy={center}
        r={size * 0.08}
        fill={color}
        opacity={fillOpacity}
      />
    </svg>
  );
}
