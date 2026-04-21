import { useEffect, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cn } from "@/utils/classname";
import { Cross1Icon } from "@radix-ui/react-icons";
import { valenceToColor } from "@/utils/glyps";
import type { Song } from "@/types/types";
import GroupGlyph from "@/components/glyph/GroupGlyph";
import { useGroupData, getNormalizedId } from "@/hooks/useGroupData";
import { GroupTags, GroupFeatures } from "@/components/GroupShared";
import GlyphLegend from "@/components/GlyphLegend";

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
  activeSong?: Song | null;
  customTrigger?: React.ReactNode;
};

export default function GroupPanel({
  type,
  label,
  activeSong,
  customTrigger,
}: GroupPanelProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentType, setCurrentType] = useState<"cluster" | "genre">(type);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(label);

  const { data, descriptions, selectedData, selectedDesc } = useGroupData(
    currentType,
    selectedGroupId,
  );

  // Sync state when opened from a new trigger
  useEffect(() => {
    setSelectedGroupId(label);
    setCurrentType(type);
  }, [label, type]);

  // Handle mobile check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // When switching between cluster/genre, if the old selected ID doesn't exist
  // in the new data list, select the first item in the new list automatically
  useEffect(() => {
    if (data.length > 0 && !selectedData) {
      const firstItemGroup = descriptions[0]?.group || data[0].group;
      setSelectedGroupId(firstItemGroup);
    }
  }, [currentType, data, selectedData, descriptions]);

  const songColor = valenceToColor(
    activeSong ? activeSong.valence : 0,
    activeSong ? activeSong.energy : 0,
  );
  const textColor = getContrastTextColor(songColor);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
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
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm" />

        <Dialog.Content
          className={cn(
            "fixed inset-0 z-100 m-auto flex overflow-hidden",
            "bg-gray-1 rounded-2xl shadow-2xl focus:outline-none",
            "h-[85vh] w-[90vw] max-w-5xl",
          )}
        >
          <Dialog.Close asChild>
            <button
              className="absolute z-50 top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-white transition-colors p-2.5 rounded-full cursor-pointer bg-black/20 hover:bg-white/10 outline-none hover:scale-110"
              aria-label="Close"
            >
              <Cross1Icon className="w-5 h-5" />
            </button>
          </Dialog.Close>

          <div className="w-full md:w-1/4 md:bg-gray-2 flex flex-col overflow-hidden rounded-xl md:m-4">
            <div className="border-b border-white/10 w-full flex flex-col gap-2 relative p-4">
              <h3 className="text-md text-white font-bold">Group Details</h3>
              <ToggleGroup.Root
                type="single"
                value={currentType}
                onValueChange={(value) => {
                  if (value) {
                    setCurrentType(value as "cluster" | "genre");
                    setSelectedGroupId("");
                  }
                }}
                className="flex w-full gap-2"
                aria-label="Toggle group type"
              >
                <ToggleGroup.Item
                  value="cluster"
                  aria-label="View clusters"
                  className="hover:cursor-pointer text-xs py-1.5 px-3 rounded-full font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-8 data-[state=on]:bg-blue-8 data-[state=on]:shadow-sm data-[state=on]:text-white data-[state=off]:text-gray-10 data-[state=off]:hover:text-gray-11"
                >
                  Clusters
                </ToggleGroup.Item>
                <ToggleGroup.Item
                  value="genre"
                  aria-label="View genres"
                  className="hover:cursor-pointer text-xs py-1.5 px-3 rounded-full font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-8 data-[state=on]:bg-blue-8 data-[state=on]:shadow-sm data-[state=on]:text-white data-[state=off]:text-gray-10 data-[state=off]:hover:text-gray-11"
                >
                  Genres
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </div>

            <Accordion.Root
              className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
              type="single"
              defaultValue="item-1"
              collapsible
            >
              {data.map((item, index) => {
                const isSelected =
                  getNormalizedId(item.group) ===
                  getNormalizedId(selectedGroupId);
                const itemDesc = descriptions.find(
                  (d) =>
                    getNormalizedId(d.group) === getNormalizedId(item.group),
                );

                return (
                  <Accordion.Item
                    key={`${item.group}-${index}`}
                    value={`${item.group}-${index}`}
                  >
                    <Accordion.Trigger asChild>
                      <button
                        onClick={() =>
                          setSelectedGroupId(itemDesc?.group || item.group)
                        }
                        className={cn(
                          "w-full flex items-center gap-4 p-3 rounded-md transition-all text-left group cursor-pointer",
                          isSelected
                            ? "bg-white/10"
                            : "hover:bg-white/5 opacity-70 hover:opacity-100",
                        )}
                      >
                        <div className="shrink-0 p-1.5 rounded-md">
                          <GroupGlyph cluster={item} size={32} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate text-white">
                            {itemDesc?.group || item.group}
                          </div>
                          <div className="text-xs text-gray-11 truncate mt-0.5">
                            {itemDesc?.title || `Group ${item.group}`}
                          </div>
                        </div>
                      </button>
                    </Accordion.Trigger>

                    {isMobile && (
                      <Accordion.Content asChild>
                        <div className="flex gap-4 items-start flex-col px-4">
                          <div className="pt-4">
                            <Dialog.Description className="text-xs font-medium text-gray-11 mt-1">
                              {selectedDesc?.title || "Unknown Group"}
                            </Dialog.Description>
                            <Dialog.Title className="text-2xl! font-extrabold! text-white">
                              {selectedDesc?.group ||
                                selectedData?.group ||
                                label}
                            </Dialog.Title>
                            <p className=" text-gray-11 text-xs mt-2!">
                              {selectedDesc?.description}
                            </p>
                          </div>
                          {selectedData && (
                            <div className="shrink-0 flex justify-center items-center hover:cursor-pointer relative w-full">
                              <GroupGlyph cluster={selectedData} size={200} />
                            </div>
                          )}

                          <div className="space-y-8">
                            {selectedData && (
                              <GroupTags
                                data={selectedData}
                                type={currentType}
                              />
                            )}
                            {selectedData && (
                              <div className="relative">
                                <div className="absolute top-0 right-0 z-30">
                                  <GlyphLegend asIcon />
                                </div>
                                <GroupFeatures data={selectedData} />
                              </div>
                            )}
                          </div>
                        </div>
                      </Accordion.Content>
                    )}
                  </Accordion.Item>
                );
              })}
            </Accordion.Root>
          </div>

          {/* Main Content: Selected Group Details (Styled like Spotify Credits) */}
          <div className="hidden md:flex flex-1 flex-col overflow-y-auto bg-gray-1 relative">
            <div className="sticky top-4 z-10 bg-gray-1 flex flex-row gap-8 items-start justify-between border-b border-white/10 p-6 pb-2">
              <div className="flex gap-4 items-start">
                {selectedData && (
                  <div className="shrink-0 relative">
                    <GroupGlyph cluster={selectedData} size={200} />
                    <div className="absolute top-0 right-0 z-30">
                      <GlyphLegend asIcon />
                    </div>
                  </div>
                )}
                <div>
                  <Dialog.Description className="text-xs font-medium text-gray-11 mt-1">
                    {selectedDesc?.title || "Unknown Group"}
                  </Dialog.Description>
                  <Dialog.Title className="text-7xl! font-extrabold! text-white">
                    {selectedDesc?.group || selectedData?.group || label}
                  </Dialog.Title>
                  <p className=" text-gray-11 text-xs mt-2!">
                    {selectedDesc?.description}
                  </p>
                  <p className=" text-gray-11 text-xs mt-2!">
                    {selectedDesc?.insight}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {selectedData && (
                <GroupTags data={selectedData} type={currentType} />
              )}
              {selectedData && <GroupFeatures data={selectedData} />}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
