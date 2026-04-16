import { useEffect, useState, useRef } from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import MusicMap from "@/components/MusicMap";
import type { Song } from "@/types/types";

export default function App() {
  const [data, setData] = useState<Song[]>([]);
  const [colorMode, setColorMode] = useState<"cluster" | "genre">("cluster");

  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/songs.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div ref={screenRef} className="relative h-full w-full">
      <ToggleGroup.Root
        type="single"
        value={colorMode}
        onValueChange={(value) => {
          if (value) setColorMode(value as "cluster" | "genre");
        }}
        className="absolute top-14 left-6 z-10 bg-gray-3 backdrop-blur-md p-1 rounded-full shadow-sm flex gap-1"
        aria-label="Color mode"
      >
        <ToggleGroup.Item
          value="cluster"
          aria-label="Color by cluster"
          className="px-4 py-2 text-xs font-medium rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-8 data-[state=on]:bg-blue-8 data-[state=on]:shadow-sm data-[state=on]:text-white data-[state=off]:text-gray-10 data-[state=off]:hover:text-gray-11"
        >
          Cluster
        </ToggleGroup.Item>

        <ToggleGroup.Item
          value="genre"
          aria-label="Color by genre"
          className="px-4 py-2 text-xs font-medium rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-8 data-[state=on]:bg-blue-8 data-[state=on]:shadow-sm data-[state=on]:text-white data-[state=off]:text-gray-10 data-[state=off]:hover:text-gray-11"
        >
          Genre
        </ToggleGroup.Item>
      </ToggleGroup.Root>

      {data.length > 0 && <MusicMap data={data} colorMode={colorMode} />}
    </div>
  );
}
