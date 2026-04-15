import type { Dispatch, SetStateAction } from "react";

type Props = {
  uniqueGroups: (string | number)[];
  colors: string[];
  selectedGroup: string | null;
  setSelectedGroup: Dispatch<SetStateAction<string | null>>;
  colorMode: "cluster" | "genre";
};

export default function LegendPanel({
  uniqueGroups,
  colors,
  selectedGroup,
  setSelectedGroup,
  colorMode,
}: Props) {
  return (
    <div className="absolute left-6 bottom-50 w-40 bg-gray-1 rounded-2xl z-20 flex flex-col h-fit p-4 gap-2">
      <h3 className="text-gray-12 font-semibold text-start pl-2">
        {colorMode === "cluster" ? "Clusters" : "Genres"}
      </h3>

      <div className="flex flex-col overflow-y-auto pr-2">
        {uniqueGroups.map((groupId, index) => {
          const isActive =
            selectedGroup === null || selectedGroup === String(groupId);
          const color = colors[index % colors.length];

          return (
            <button
              key={groupId}
              onClick={() =>
                setSelectedGroup((prev) =>
                  prev === String(groupId) ? null : String(groupId),
                )
              }
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                isActive ? "hover:bg-white/10" : "opacity-30 hover:opacity-75"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-medium text-gray-11 truncate">
                {colorMode === "cluster" ? "Cluster " : ""}
                {groupId}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
