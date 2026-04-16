import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/utils/classname";
import { Cross1Icon, InfoCircledIcon } from "@radix-ui/react-icons";

export default function GlyphLegend({ asIcon = false }: { asIcon?: boolean }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {asIcon ? (
          <button
            className="hover:scale-105 p-2 text-gray-11 hover:text-white hover:bg-gray-4 rounded-full transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Expand group details"
          >
            <InfoCircledIcon className="w-4 h-4" />
          </button>
        ) : (
          <button className="text-sm font-semibold text-gray-400 hover:text-white hover:underline transition-all bg-transparent p-0 border-none outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm">
            More Info
          </button>
        )}
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
