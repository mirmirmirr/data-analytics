import * as Dialog from "@radix-ui/react-dialog";
import type { Song } from "@/types/types";
import SongGlyph from "@/components/glyph/SongGlyph";
import { cn } from "@/utils/classname";
import { Cross1Icon } from "@radix-ui/react-icons";

type GlyphPanelProps = {
  song: Song;
};

export default function GlyphPanel({ song }: GlyphPanelProps) {
  return (
    <Dialog.Root>
      <div className="flex flex-col bg-gray-3 rounded-xl p-6 gap-4 w-full">
        <div className="flex justify-between items-center w-full">
          <h3 className="text-base font-bold text-white tracking-tight">
            Glyph Visualization
          </h3>

          <Dialog.Trigger asChild>
            <button className="text-sm font-semibold text-gray-400 hover:text-white hover:underline transition-all bg-transparent p-0 border-none outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm">
              More Info
            </button>
          </Dialog.Trigger>
        </div>

        <div className="flex justify-center items-center">
          <SongGlyph song={song} size={250} />
        </div>
      </div>

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
              <Dialog.Title className="text-2xl font-black tracking-tight">
                Glyph Visualizations
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
            insert glyph legend and explanation here
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
