import { useEffect, useState, useRef } from "react";
import MusicMap from "@/components/MusicMap";
import type { Song } from "@/types/song";

export default function App() {
  const [data, setData] = useState<Song[]>([]);

  // 👈 Add state to track the active mode
  const [colorMode, setColorMode] = useState<"cluster" | "genre">("cluster");

  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/songs.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div ref={screenRef} className="relative h-full w-full">
      {/* 👈 Toggle UI overlay */}
      <div className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-md p-1 rounded-lg shadow-sm border border-gray-200 flex gap-1">
        <button
          onClick={() => setColorMode("cluster")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            colorMode === "cluster"
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          By Cluster
        </button>
        <button
          onClick={() => setColorMode("genre")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            colorMode === "genre"
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          By Genre
        </button>
      </div>

      {data.length > 0 && <MusicMap data={data} colorMode={colorMode} />}
    </div>
  );
}
