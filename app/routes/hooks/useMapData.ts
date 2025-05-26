import { useEffect, useState } from "react";

export const useMapData = (allBrawlers: any[]) => {
  const [maps, setMaps] = useState<string[]>([]);
  const [selectedMap, setSelectedMap] = useState<string>("");

  const modePrefixes = ["gem_grab", "brawl_ball", "bounty", "hot_zone", "knockout", "heist"];

  useEffect(() => {
    if (!allBrawlers || allBrawlers.length === 0) return;

    const rawMaps = [...new Set(allBrawlers.map((item: any) => item.Map))];
    const orderedMaps = modePrefixes.flatMap((prefix) =>
      rawMaps.filter((map) => map.toLowerCase().startsWith(prefix))
    );

    setMaps(orderedMaps);
    setSelectedMap(orderedMaps[0] || "");
  }, [allBrawlers]);

  return { maps, selectedMap, setSelectedMap };
};
