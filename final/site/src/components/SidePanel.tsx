import { useState, useEffect } from "react";
import type { Song } from "@/types/types";
import { SizeIcon } from "@radix-ui/react-icons";
import GroupPanel from "@/components/GroupPanel";
import SongGlyph from "@/components/glyph/SongGlyph";
import GroupGlyph from "@/components/glyph/GroupGlyph";
import { useGroupData } from "@/hooks/useGroupData";
import { GroupTags, GroupFeatures } from "@/components/GroupShared";
import GlyphLegend from "@/components/GlyphLegend";
import { Drawer } from "vaul";
import { cn } from "@/utils/classname";
import SongIFrame from "@/components/SongIFrame";

type Props = {
  type: "cluster" | "genre";
  selectedGroup: string | null;
  activeTrackId: string | null;
  activeSong: Song | null | undefined;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

const snapPoints = [0.15, 0.5, 0.9];

export default function SidePanel({
  type,
  selectedGroup: selectedGroupId,
  activeTrackId,
  activeSong,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const { selectedData, selectedDesc } = useGroupData(type, selectedGroupId);

  // Responsive state to switch between Desktop Side Panel and Mobile Vaul Drawer
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  // Controlled snap points for the Vaul drawer (fractions of screen height)
  const [snap, setSnap] = useState<number | string | null>(snapPoints[2]);

  useEffect(() => {
    setIsMounted(true);
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);

    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  // Snap mobile drawer when data changes
  useEffect(() => {
    if (selectedGroupId || activeTrackId) {
      setSnap(snapPoints[1]);
    }
  }, [selectedGroupId, activeTrackId]);

  // Extract the inner content so we don't duplicate code between the Desktop Div and Mobile Drawer
  const panelContent = (
    <>
      {selectedGroupId ? (
        <>
          {/* EXPAND BUTTON */}
          <div className="absolute top-2 right-4 z-30">
            <GroupPanel
              type={type}
              label={
                selectedDesc?.group || selectedData?.group || selectedGroupId
              }
              activeSong={activeSong}
              customTrigger={
                <button
                  className="p-2 text-gray-11 hover:scale-105 hover:text-white hover:bg-gray-4 rounded-full transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Expand group details"
                >
                  <SizeIcon className="w-4 h-4" />
                </button>
              }
            />
          </div>

          {/* Existing Content */}
          <div className="pb-4 pl-4 pr-2 flex flex-col gap-4 relative h-full overflow-y-auto text-start custom-scrollbar">
            <div className="flex flex-col">
              {selectedData && (
                <div className="shrink-0 flex justify-center items-center hover:cursor-pointer relative">
                  <GroupGlyph cluster={selectedData} size={300} />
                  <div className="absolute top-2 right-6 z-30">
                    <GlyphLegend asIcon />
                  </div>
                </div>
              )}

              <div className="sticky top-0 z-10 bg-gray-1 gap-2 pr-10">
                <h2 className="text-2xl! font-extrabold! text-white leading-1.5!">
                  {selectedDesc?.group || selectedData?.group}
                </h2>
                <h4 className="mt-2! text-gray-11">
                  {selectedDesc?.title || "Unknown Group"}
                </h4>
              </div>
            </div>

            <div className="flex flex-col bg-gray-3 rounded-xl p-6 gap-4 w-full">
              <p className="text-gray-11 text-xs">
                {selectedDesc?.description}
              </p>
              <p className="text-gray-11 text-xs">{selectedDesc?.insight}</p>
            </div>

            {selectedData?.seen_in && selectedData.seen_in.length > 0 && (
              <div className="flex flex-col bg-gray-3 rounded-xl p-6 gap-4 w-full">
                <GroupTags data={selectedData} type={type} />
              </div>
            )}

            {selectedData && (
              <div className="flex flex-col bg-gray-3 rounded-xl p-6 gap-4 w-full relative">
                <div className="absolute top-6.5 right-6 z-30">
                  <GlyphLegend />
                </div>
                <GroupFeatures data={selectedData} />
              </div>
            )}
          </div>
        </>
      ) : activeTrackId && activeSong ? (
        <div className="py-4 pl-4 pr-2 flex flex-col gap-4 relative h-full overflow-y-auto custom-scrollbar">
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
            <SongIFrame activeTrackId={activeTrackId} />

            <div className="flex flex-col bg-gray-3 rounded-xl p-6 gap-4 w-full">
              <div className="flex justify-between items-center w-full">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Glyph Visualization
                </h3>

                <GlyphLegend />
              </div>

              <div className="flex justify-center items-center">
                <SongGlyph song={activeSong} size={250} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full pt-2 mt:pt-8 p-8 text-start custom-scrollbar">
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
    </>
  );

  if (!isMounted) return null;

  if (!isMobile) {
    return (
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="absolute right-6 top-6 bottom-6 w-80 bg-gray-1 rounded-2xl z-20 flex flex-col overflow-hidden transition-all duration-300 shadow-xl"
      >
        {panelContent}
      </div>
    );
  }

  return (
    <Drawer.Root
      modal={false}
      open={true}
      dismissible={false}
      snapPoints={[0.15, 0.5, 0.9]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Portal>
        <Drawer.Content
          data-testid="content"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="z-50 fixed flex flex-col bg-gray-1 rounded-t-2xl bottom-0 left-0 right-0 h-full max-h-[97%] -mx-px focus:outline-none"
        >
          <Drawer.Handle className="w-10! h-1.5 bg-gray-4 rounded-full mx-auto m-2" />
          <div
            className={cn("flex flex-col max-w-md mx-auto w-full", {
              "overflow-y-auto": snap === 1,
              "overflow-hidden": snap !== 1,
            })}
          >
            {panelContent}
            <div className="h-8" />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
