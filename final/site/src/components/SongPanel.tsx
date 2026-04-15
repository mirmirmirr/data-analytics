import type { Song } from "@/types/song";
import SongGlyph from "@/components/SongGlyph";

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
        <div className="p-5 flex flex-col gap-6 relative h-full overflow-y-auto">
          <div className="flex justify-between items-center shrink-0">
            <h2 className="text-white font-semibold text-lg tracking-tight">
              Track Details
            </h2>
          </div>

          <div className="w-full mt-2 flex flex-col gap-6">
            <div className="flex justify-center items-center">
              <SongGlyph song={activeSong} size={250} />
            </div>

            <iframe
              style={{ borderRadius: "12px" }}
              src={`https://open.spotify.com/embed/track/${activeTrackId}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen={false}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="shadow-lg shrink-0"
            ></iframe>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 text-gray-400"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <p className="text-sm text-gray-300 font-medium">
            Hover over a point on the map to explore track details.
          </p>
        </div>
      )}
    </div>
  );
}
