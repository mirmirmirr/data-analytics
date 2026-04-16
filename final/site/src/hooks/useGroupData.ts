import { useState, useEffect, useMemo } from "react";
import type { Group, GroupDetails } from "@/types/types";

export const getNormalizedId = (str: string | null | undefined) => {
  if (!str) return "";
  return str
    .toString()
    .replace(/cluster\s*/i, "")
    .trim();
};

export function useGroupData(
  type: "cluster" | "genre",
  selectedId?: string | null,
) {
  const [data, setData] = useState<Group[]>([]);
  const [descriptions, setDescriptions] = useState<GroupDetails[]>([]);

  useEffect(() => {
    fetch(type === "genre" ? "/genre.json" : "/cluster.json")
      .then((res) => res.json())
      .then(setData);

    fetch(`/descriptions/${type}.json`)
      .then((res) => res.json())
      .then(setDescriptions);
  }, [type]);

  const selectedData = useMemo(
    () =>
      data.find(
        (d) => getNormalizedId(d.group) === getNormalizedId(selectedId),
      ),
    [data, selectedId],
  );

  const selectedDesc = useMemo(
    () =>
      descriptions.find(
        (d) => getNormalizedId(d.group) === getNormalizedId(selectedId),
      ),
    [descriptions, selectedId],
  );

  return { data, descriptions, selectedData, selectedDesc };
}
