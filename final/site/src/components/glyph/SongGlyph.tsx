import type { Song } from "@/types/types";
import Glyph from "@/components/glyph/Glyph";

export default function SongGlyph({
  song,
  size = 120,
}: {
  song: Song;
  size?: number;
}) {
  return (
    <Glyph
      id={song.track_id}
      valence={song.valence}
      energy={song.energy}
      danceability={song.danceability}
      acousticness={song.acousticness}
      instrumentalness={song.instrumentalness}
      tempo={song.tempo}
      size={size}
    />
  );
}
