import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/utils/classname";
import { Cross1Icon } from "@radix-ui/react-icons";
import { valenceToColor } from "@/utils/glyps";
import type { Group, GroupDetails, Song } from "@/types/types";
import GroupGlyph from "@/components/glyph/GroupGlyph";

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

// Helper to match "Cluster 1" with "1" between the two JSON files
const getNormalizedId = (str: string | undefined) => {
  if (!str) return "";
  return str
    .toString()
    .replace(/cluster\s*/i, "")
    .trim();
};

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
  const [data, setData] = useState<Group[]>([]);
  const [descriptions, setDescriptions] = useState<GroupDetails[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(label);

  useEffect(() => {
    fetch(type === "genre" ? "/genre.json" : "/cluster.json")
      .then((res) => res.json())
      .then(setData);

    fetch(`/descriptions/${type}.json`)
      .then((res) => res.json())
      .then(setDescriptions);
  }, [type]);

  // Reset the selected group to the triggered label whenever the modal is opened from a different label
  useEffect(() => {
    setSelectedGroupId(label);
  }, [label]);

  const songColor = valenceToColor(
    activeSong ? activeSong.valence : 0,
    activeSong ? activeSong.energy : 0,
  );
  const textColor = getContrastTextColor(songColor);

  const selectedData = data.find(
    (d) => getNormalizedId(d.group) === getNormalizedId(selectedGroupId),
  );
  const selectedDesc = descriptions.find(
    (d) => getNormalizedId(d.group) === getNormalizedId(selectedGroupId),
  );

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

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm" />

        <Dialog.Content
          className={cn(
            "fixed inset-0 z-100 m-auto flex overflow-hidden",
            "bg-gray-1 rounded-xl shadow-2xl focus:outline-none",
            "h-[85vh] w-[90vw] max-w-5xl",
          )}
        >
          {/* Sidebar: All Glyphs */}
          <div className="w-1/4 bg-gray-2 flex flex-col overflow-hidden rounded-xl m-4">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white tracking-wide">
                All {type === "cluster" ? "Clusters" : "Genres"}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {data.map((item, index) => {
                const isSelected =
                  getNormalizedId(item.group) ===
                  getNormalizedId(selectedGroupId);
                const itemDesc = descriptions.find(
                  (d) =>
                    getNormalizedId(d.group) === getNormalizedId(item.group),
                );

                return (
                  <button
                    key={`${item.group}-${index}`}
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
                );
              })}
            </div>
          </div>

          {/* Main Content: Selected Group Details (Styled like Spotify Credits) */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-gray-1 relative">
            {/* Header Section */}
            <div className="sticky top-0 z-10 bg-gray-1 flex flex-row gap-8 items-start justify-between border-b border-white/10 p-6 pb-2">
              <div className="flex gap-4 items-start">
                {selectedData && (
                  <div className="shrink-0">
                    <GroupGlyph cluster={selectedData} size={200} />
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
              <Dialog.Close asChild>
                <button
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-full cursor-pointer hover:bg-white/10 outline-none hover:scale-105"
                  aria-label="Close"
                >
                  <Cross1Icon className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Scrollable Details Section */}
            <div className="p-6 space-y-8">
              {/* Genres */}
              {selectedData?.seen_in && selectedData.seen_in.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-white mb-4">
                    {type == "cluster"
                      ? "Top 5 Prominent Genres"
                      : "Top 5 Clusters Seen In"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedData.seen_in.map((g) => (
                      <span
                        key={g}
                        className="px-4 py-1.5 bg-gray-4 hover:bg-gray-6 transition-colors rounded-full text-[14px] font-medium text-white capitalize"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {/* Audio Features (Mimicking the Artist/Producer lists) */}
              {selectedData && (
                <section>
                  <h3 className="text-lg font-bold text-white mb-4">
                    Audio Features
                  </h3>
                  <div className="space-y-4">
                    <FeatureRow
                      label="Energy"
                      value={selectedData.energy_mean}
                      isPercentage
                    />
                    <FeatureRow
                      label="Danceability"
                      value={selectedData.danceability_mean}
                      isPercentage
                    />
                    <FeatureRow
                      label="Valence"
                      value={selectedData.valence_mean}
                      isPercentage
                    />
                    <FeatureRow
                      label="Acousticness"
                      value={selectedData.acousticness_mean}
                      isPercentage
                    />
                    <FeatureRow
                      label="Instrumentalness"
                      value={selectedData.instrumentalness_mean}
                      isPercentage
                    />
                    <FeatureRow
                      label="Tempo"
                      value={selectedData.tempo_mean}
                      suffix=" BPM"
                    />
                  </div>
                </section>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Component to mimic the list rows in the Spotify screenshot
function FeatureRow({
  label,
  value,
  isPercentage = false,
  suffix = "",
}: {
  label: string;
  value: number;
  isPercentage?: boolean;
  suffix?: string;
}) {
  const displayValue = isPercentage
    ? `${(value * 100).toFixed(0)}%`
    : `${value.toFixed(0)}${suffix}`;

  return (
    <div className="flex justify-between items-center group">
      <div>
        <p className="text-[15px] text-white font-medium">{label}</p>
        <p className="text-[14px] text-[#A7A7A7]">Mean Value</p>
      </div>
      <div className="text-[15px] font-medium text-white px-3 py-1 bg-gray-4 rounded-md group-hover:bg-gray-6 transition-colors">
        {displayValue}
      </div>
    </div>
  );
}
