import type { Song } from "@/types/song";
import GlyphPanel from "@/components/GlyphPanel";
import GroupPanel from "@/components/GroupPanel";

type Props = {
  activeTrackId: string | null;
  activeSong: Song | null | undefined;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function SidePanel({
  activeTrackId,
  activeSong,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute right-6 top-6 bottom-6 w-80 bg-gray-1 rounded-2xl z-20 flex flex-col overflow-hidden transition-all duration-300"
    >
      {activeTrackId && activeSong ? (
        <div className="py-4 pl-4 pr-2 flex flex-col gap-4 relative h-full overflow-y-auto">
          <div className="flex gap-2">
            <GroupPanel
              type="cluster"
              label={"Cluster " + activeSong.cluster}
              activeSong={activeSong}
            />
            <GroupPanel
              type="genre"
              label={activeSong.track_genre}
              activeSong={activeSong}
            />
          </div>

          <div className="w-full flex flex-col gap-6">
            <iframe
              style={{ borderRadius: "12px" }}
              src={`https://open.spotify.com/embed/track/${activeTrackId}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              allowFullScreen={false}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="shadow-lg shrink-0"
            />

            <GlyphPanel song={activeSong} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full p-8 text-start">
          <h3 className="text-3xl font-bold text-white tracking-tight">
            Music Map
          </h3>
          <p className="text-sm text-gray-11">
            Music isn’t organized in neat categories—it exists on a spectrum.
          </p>
          <section className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-gray-11">
              This map visualizes songs based on their audio features, placing
              similar tracks closer together to reveal hidden patterns in sound.
            </p>
            <ul className="text-sm text-gray-11 flex flex-col gap-2">
              <li>
                <b className="text-white">Clusters</b> group songs by their
                actual characteristics, showing natural structures in the data.
              </li>
              <li>
                <b className="text-white">Genres</b> overlay traditional labels,
                exposing where those categories align—or break down.
              </li>
            </ul>
            <p className="text-sm text-gray-11 italic">
              Hover to explore individual tracks and see how they fit within
              this evolving landscape of music.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
