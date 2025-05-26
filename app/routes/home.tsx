import React, { useState } from "react";

import { useBrawlerData } from "./hooks/useBrawlerData";
import { useMapData } from "./hooks/useMapData";
import { useIsMobile } from "./hooks/useIsMobile";

import BrawlerCard from "./components/BrawlerCard";
import { SortAndFilterControls } from "./components/SortAndFilterControls";
import { MapSelector } from "./components/MapSelector";

import { sortAndFilterBrawlers } from "./utils/sortAndFilterBrawlers";


export default function Home() {
  const { allBrawlers, brawlerTypes, isLoading } = useBrawlerData();
  const { maps, selectedMap, setSelectedMap } = useMapData(allBrawlers);
  const isMobile = useIsMobile();

  const [filterType, setFilterType] = useState("all");
  const [sortMode, setSortMode] = useState<"pick" | "alpha">("pick");

  if (isLoading || allBrawlers.length === 0 || !selectedMap) {
    return <div className="text-white p-6">Loading...</div>;
  }

  const filtered = allBrawlers.filter((b) => b.Map === selectedMap);
  const sortedByPickRate = [...filtered].sort((a, b) => b["Pick Rate"] - a["Pick Rate"]);
  const top15 = sortedByPickRate.slice(0, 15);
  const top15Names = new Set(top15.map((b) => b.Brawler));

  const availableBrawlers = sortedByPickRate
    .filter((b) => !top15Names.has(b.Brawler))
    .filter((b) => {
      if (filterType === "all") return true;
      const name = b.Brawler.trim().toLowerCase();
      const key = Object.keys(brawlerTypes).find((k) => k.toLowerCase() === name);
      const brawlerType = key ? brawlerTypes[key].toLowerCase() : "";
      return brawlerType === filterType;
    })
    .sort((a, b) => {
      if (sortMode === "alpha") {
        return a.Brawler.localeCompare(b.Brawler);
      }
      return b["Pick Rate"] - a["Pick Rate"];
    });

  const cardWidth = isMobile ? "190px" : "270px";
  const cardHeight = isMobile ? "105px" : "100px";
  const iconSize = isMobile ? "20px" : "30px";

  const allTypes = [...new Set(Object.values(brawlerTypes).map((t) => t.toLowerCase()))].sort();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Top Brawlers by Map</h1>

      {/* Map Selector */}
      <MapSelector maps={maps} selectedMap={selectedMap} setSelectedMap={setSelectedMap} />

      {/* Top 15 Picks */}
      <h2 className="text-lg font-semibold mb-2">Top 15 Picks</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {top15.map((brawler, index) => {
          const name = brawler.Brawler.trim().toLowerCase();
          const key = Object.keys(brawlerTypes).find((k) => k.toLowerCase() === name);
          const brawlerType = key ? brawlerTypes[key] : null;

          return (
            <BrawlerCard
              key={index}
              brawler={brawler}
              type={brawlerType}
              width={cardWidth}
              height={cardHeight}
              typeIconSize={iconSize}
            />
          );
        })}
      </div>

      {/* Filter + Sort */}
      <SortAndFilterControls
  sortMode={sortMode}
  setSortMode={setSortMode}
  filterType={filterType}
  setFilterType={setFilterType}
  allTypes={allTypes}
/>

      {/* Remaining Brawlers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
        {availableBrawlers.map((brawler, index) => {
          const name = brawler.Brawler.trim().toLowerCase();
          const key = Object.keys(brawlerTypes).find((k) => k.toLowerCase() === name);
          const brawlerType = key ? brawlerTypes[key] : null;

          return (
            <BrawlerCard
              key={index}
              brawler={brawler}
              type={brawlerType}
              width={cardWidth}
              height={cardHeight}
              typeIconSize={iconSize}
            />
          );
        })}
      </div>
    </div>
  );
}
