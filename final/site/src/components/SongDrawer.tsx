import type { Song } from "@/types/song";
import SongGlyph from "@/components/SongGlyph";

type Props = {
  activeTrackId: string | null;
  activeSong: Song | null | undefined;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function SongDrawer({
  activeTrackId,
  activeSong,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute top-0 right-0 h-full w-80 bg-gray-1 backdrop-blur-2xl border-l border-gray-track shadow-2xl z-30 transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto ${
        activeTrackId ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6 flex flex-col gap-6 relative min-h-full">
        {/* Header */}
        <div className="flex justify-between items-center shrink-0">
          <h2 className="text-white font-semibold text-lg tracking-tight">
            Track Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        {activeSong && activeTrackId && (
          <div className="w-full mt-2 flex flex-col gap-6">
            {/* Glyph Container */}
            <div className="flex justify-center items-center rounded-xl border border-white/5 shadow-inner">
              <SongGlyph song={activeSong} size={160} />
            </div>

            {/* Iframe */}
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
        )}

        {/* Footer */}
        <div className="mt-auto pb-4 pt-4 shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Data provided by Spotify API
          </p>
        </div>
      </div>
    </div>
  );
}
