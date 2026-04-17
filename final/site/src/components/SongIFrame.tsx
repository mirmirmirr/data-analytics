import { useEffect, useState } from "react";
import { cn } from "@/utils/classname";

export default function SongIFrame({
  activeTrackId,
}: {
  activeTrackId: string | null;
}) {
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  useEffect(() => {
    if (activeTrackId) {
      setIsIframeLoading(true);
    }
  }, [activeTrackId]);

  return (
    <div className="relative w-full h-80 shrink-0 bg-gray-3 rounded-xl overflow-hidden">
      {/* Skeleton Layer */}
      {isIframeLoading && (
        <div className="absolute inset-0 z-10 p-5 flex flex-col animate-pulse bg-[#282828]">
          {/* Top Right Spotify Icon Placeholder */}
          <div className="absolute top-5 right-5 w-5 h-5 rounded-full bg-white/10" />

          {/* Album Art Placeholder */}
          <div className="w-30 bg-white/10 rounded-lg mx-auto mt-8 shadow-xl aspect-square" />

          {/* Text Info */}
          <div className="mt-4 flex flex-col gap-2 w-full">
            {/* Title */}
            <div className="h-6 bg-white/20 rounded w-1/2" />

            {/* Artist Line (with 'E' badge placeholder) */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white/10 rounded-[3px] shrink-0" />
              <div className="h-4 bg-white/10 rounded w-2/3" />
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="mt-4 flex items-center justify-between w-full">
            {/* Progress Bar */}
            <div className="h-1 bg-white/20 rounded-full w-1/3" />

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              {/* Time */}
              <div className="h-3 bg-white/10 rounded w-8" />

              {/* Ellipsis (...) */}
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <div className="w-1 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Play Button */}
              <div className="w-10 h-10 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Iframe Layer */}
      <iframe
        style={{ borderRadius: "12px" }}
        src={`https://open.spotify.com/embed/track/${activeTrackId}?utm_source=generator&theme=0`}
        width="100%"
        height="352"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className={cn(
          "shadow-lg absolute inset-0 transition-opacity duration-500",
          isIframeLoading ? "opacity-0" : "opacity-100",
        )}
        onLoad={() => setIsIframeLoading(false)}
      />
    </div>
  );
}
