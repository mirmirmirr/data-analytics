import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";

type Props = {
  uniqueGroups: (string | number)[];
  colors: string[];
  selectedGroup: string | null;
  setSelectedGroup: Dispatch<SetStateAction<string | null>>;
  colorMode: "cluster" | "genre";
  onClose?: () => void; // Added so swiping down closes it in the parent state
};

export default function LegendPanel({
  uniqueGroups,
  colors,
  selectedGroup,
  setSelectedGroup,
  colorMode,
  onClose,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Extracted the inner list so we don't write it twice
  const content = (
    <>
      <h3 className="text-gray-12 font-semibold text-start pl-2 mb-2">
        {colorMode === "cluster" ? "Clusters" : "Genres"}
      </h3>

      <div className="flex flex-wrap md:flex-col overflow-y-auto pr-2 custom-scrollbar">
        {uniqueGroups.map((groupId, index) => {
          const isActive =
            selectedGroup === null || selectedGroup === String(groupId);
          const color = colors[index % colors.length];

          return (
            <button
              key={groupId}
              onClick={() => {
                setSelectedGroup((prev) =>
                  prev === String(groupId) ? null : String(groupId),
                );
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                isActive ? "hover:bg-white/10" : "opacity-30 hover:opacity-75"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="md:text-xs text-gray-11 truncate">
                {colorMode === "cluster" ? "Cluster " : ""}
                {groupId}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );

  if (!isMounted) return null;

  if (!isMobile) {
    return (
      <div className="absolute left-6 bottom-50 w-40 bg-gray-1 rounded-2xl z-20 flex flex-col h-fit p-4 gap-2">
        {content}
      </div>
    );
  }

  return (
    <Drawer.Root
      modal={false}
      open={true}
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose();
        }
      }}
    >
      <Drawer.Portal>
        <Drawer.Content className="z-50 fixed flex flex-col bg-gray-1 rounded-t-2xl bottom-0 left-0 right-0 h-70 -mx-px focus:outline-none">
          <Drawer.Handle className="w-10! h-1.5! bg-gray-4 rounded-full mx-auto m-2 mb-4" />
          <div className="flex-1 overflow-y-auto p-6 pt-2">{content}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
