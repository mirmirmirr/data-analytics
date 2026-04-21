import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/utils/classname";
import { Cross1Icon, InfoCircledIcon } from "@radix-ui/react-icons";

const audioFeatures = [
  {
    title: "Tempo",
    desc: "Tempo shows how fast the song is, with more lines indicating a quicker beat.",
    svg: "/glyph/tempo.svg",
  },
  {
    title: "Acousticness",
    desc: "Acousticness shows whether a song sounds natural or electronic, with wavy lines feeling more organic.",
    svg: "/glyph/acousticness.svg",
  },
  {
    title: "Energy",
    desc: "Energy shows how intense the song feels, with longer lines representing more power.",
    svg: "/glyph/energy.svg",
  },
  {
    title: "Danceability",
    desc: "Danceability shows how steady the rhythm is, with smoother lines indicating a more consistent beat.",
    svg: "/glyph/danceability.svg",
  },
  {
    title: "Instrumentalness",
    desc: "Instrumentalness shows if a song has vocals, with larger circles for vocals and a smaller ones for instrumental music.",
    svg: "/glyph/instrumentalness.svg",
  },
  {
    title: "Valence",
    desc: "Valence shows the song’s mood, with cooler colors feeling sadder and warmer colors feeling happier..",
    svg: "/glyph/valence.svg",
  },
];

export default function GlyphLegend({ asIcon = false }: { asIcon?: boolean }) {
  const [activeSvg, setActiveSvg] = useState<string | null>(null);

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
          <button className="text-sm text-gray-400 hover:text-white hover:underline transition-all bg-transparent p-0 border-none outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm">
            More Info
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm" />

        <Dialog.Content
          className={cn(
            "fixed inset-0 z-100 m-auto flex flex-col overflow-hidden",
            "bg-[#181818] rounded-2xl shadow-2xl focus:outline-none",
            "h-fit w-7/8 md:w-4xl",
          )}
        >
          {/* Header */}
          <div className="p-6 pb-4 flex justify-between items-start border-b border-white/10 shrink-0">
            <div>
              <Dialog.Title className="text-md! md:text-2xl font-bold tracking-tight text-white">
                Glyph Visualizations and Audio Features
              </Dialog.Title>
              <Dialog.Description className="text-xs md:text-sm mt-1 text-gray-11">
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

          {/* Main Content Area */}
          <div className="flex flex-col md:flex-row overflow-hidden min-h-0 p-3">
            <div className="w-full md:w-3/5 flex md:h-full items-center justify-center shrink-0 my-auto p-4">
              <img
                src={activeSvg || "/glyph/legend.svg"}
                alt="Glyph Legend"
                className="object-contain drop-shadow-xl transition-all"
              />
            </div>

            <div className="w-full md:w-2/5 overflow-y-auto md:pl-0 flex flex-col max-h-[20vh] md:max-h-full overflow-auto">
              {audioFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-1 pr-4 p-3 rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
                  onMouseEnter={() => setActiveSvg(feature.svg)}
                  onMouseLeave={() => setActiveSvg(null)}
                >
                  <span className="font-heading text-sm text-white">
                    {feature.title}
                  </span>
                  <span className="text-xs text-gray-11">{feature.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
