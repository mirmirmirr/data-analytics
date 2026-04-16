import type { Group } from "@/types/types";
import Glyph from "@/components/glyph/Glyph";

export default function GroupGlyph({
  cluster,
  size = 120,
}: {
  cluster: Group;
  size?: number;
}) {
  return (
    <Glyph
      id={cluster.group}
      valence={cluster.valence_mean}
      energy={cluster.energy_mean}
      danceability={cluster.danceability_mean}
      acousticness={cluster.acousticness_mean}
      instrumentalness={cluster.instrumentalness_mean}
      tempo={cluster.tempo_mean}
      size={size}
    />
  );
}
