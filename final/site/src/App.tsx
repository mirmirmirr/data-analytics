import { useEffect, useState, useRef } from "react";
import MusicMap from "@/components/MusicMap";
import type { Song } from "@/types/song";

export default function App() {
  const [data, setData] = useState<Song[]>([]);

  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/songs.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div ref={screenRef} className="relative h-full w-full">
      {data.length > 0 && <MusicMap data={data} />}
    </div>
  );
}
