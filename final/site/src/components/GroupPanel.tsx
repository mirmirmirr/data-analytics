import * as Dialog from "@radix-ui/react-dialog";
import SongGlyph from "@/components/SongGlyph";
import { cn } from "@/utils/classname";
import { Cross1Icon } from "@radix-ui/react-icons";
import { valenceToColor } from "@/utils/glyps";
import type { Song } from "@/types/song";

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

type GroupPanelProps = {
  type: "cluster" | "genre";
  label: string;
  activeSong: Song;
};

export default function GroupPanel({
  type,
  label,
  activeSong,
}: GroupPanelProps) {
  const songColor = valenceToColor(
    activeSong ? activeSong.valence : 0,
    activeSong ? activeSong.energy : 0,
  );
  const textColor = getContrastTextColor(songColor);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="relative mt-1 inline-flex items-center px-2.5 py-1 rounded-full overflow-hidden group cursor-pointer">
          <div
            className="absolute inset-0 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
            style={{ backgroundColor: songColor }}
          />
          <span
            className="relative z-10 text-[10px] uppercase tracking-wider font-bold"
            style={{ color: textColor }}
          >
            {label}
          </span>
        </button>
      </Dialog.Trigger>

      {/* Modal Overlay via Portal */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-100 bg-black/25 backdrop-blur-sm" />

        <Dialog.Content
          className={cn(
            "fixed inset-0 z-100 m-auto flex flex-col overflow-hidden",
            "bg-gray-2 rounded-2xl shadow-2xl focus:outline-none",
            "h-fit max-w-md",
          )}
        >
          <div className="p-6 pb-4 flex justify-between items-start border-b border-white/10">
            <div>
              <Dialog.Title className="text-2xl font-black tracking-tight title">
                {label}
              </Dialog.Title>
              <Dialog.Description className="text-sm mt-1 text-white">
                A glyph is a visual representation of a song's audio features.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                className={cn(
                  "text-gray-400 transition-all p-2 rounded-full outline-none",
                  "hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 hover:bg-white/10 hover:scale-110",
                )}
                aria-label="Close"
              >
                <Cross1Icon />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable Credits List */}
          <div className="p-6 max-h-[60vh] overflow-y-auto flex flex-col gap-6">
            {}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
