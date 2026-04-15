import type { Song } from "@/types/song";
import GlyphPanel from "@/components/GlyphPanel";
import { valenceToColor } from "@/utils/glyps";

// Helper function to determine if text should be light or dark based on the background color
function getContrastTextColor(hexColor: string) {
  if (!hexColor) return "#FFFFFF";

  const hex = hexColor.replace("#", "");
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#121212" : "#FFFFFF";
}

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
  const songColor = valenceToColor(
    activeSong ? activeSong.valence : 0,
    activeSong ? activeSong.energy : 0,
  );
  const textColor = getContrastTextColor(songColor);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute right-6 top-6 bottom-6 w-80 bg-gray-1 rounded-2xl z-20 flex flex-col overflow-hidden transition-all duration-300"
    >
      {activeTrackId && activeSong ? (
        <div className="py-4 pl-4 pr-2 flex flex-col gap-4 relative h-full overflow-y-auto">
          <div className="flex gap-2">
            <button className="relative mt-1 inline-flex items-center px-2.5 py-1 rounded-full overflow-hidden group cursor-pointer">
              <div
                className="absolute inset-0 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: songColor }}
              />
              <span
                className="relative z-10 text-[10px] uppercase tracking-wider font-bold"
                style={{ color: textColor }}
              >
                Cluster {activeSong.cluster}
              </span>
            </button>

            <button className="relative mt-1 inline-flex items-center px-2.5 py-1 rounded-full overflow-hidden group cursor-pointer">
              <div
                className="absolute inset-0 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: songColor }}
              />
              <span
                className="relative z-10 text-[10px] uppercase tracking-wider font-bold"
                style={{ color: textColor }}
              >
                {activeSong.track_genre}
              </span>
            </button>
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
