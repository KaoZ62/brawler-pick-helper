import { useState } from "react";

import { useBrawlerData } from "./hooks/useBrawlerData";
import { useMapData } from "./hooks/useMapData";
import { useIsMobile } from "./hooks/useIsMobile";

import BrawlerCard from "./components/BrawlerCard";
import { SortAndFilterControls } from "./components/SortAndFilterControls";
import { MapSelector } from "./components/MapSelector";

import { sortAndFilterBrawlers } from "./utils/sortAndFilterBrawlers";

export default function Draft() {
  const { allBrawlers, brawlerTypes, isLoading } = useBrawlerData();
  const { maps, selectedMap, setSelectedMap } = useMapData(allBrawlers);
  const isMobile = useIsMobile();

  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortMode, setSortMode] = useState<"pick" | "alpha">("pick");
  const [selectedForTeam, setSelectedForTeam] = useState<string | null>(null);

  if (isLoading || !selectedMap || allBrawlers.length === 0) {
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
  const iconSize = isMobile ? "20px" : "25px";

  const addToTeam = (brawler: string, team: "A" | "B") => {
    if (team === "A" && teamA.length < 3) setTeamA([...teamA, brawler]);
    if (team === "B" && teamB.length < 3) setTeamB([...teamB, brawler]);
    setSelectedForTeam(null);
  };

  const removeFromTeam = (brawler: string, team: "A" | "B") => {
    const setTeam = team === "A" ? setTeamA : setTeamB;
    const currentTeam = team === "A" ? teamA : teamB;
    setTeam(currentTeam.filter((b) => b !== brawler));
  };

  const allTypes = [...new Set(Object.values(brawlerTypes).map(type => type.toLowerCase()))].sort();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Draft Simulator</h1>

      <MapSelector maps={maps} selectedMap={selectedMap} setSelectedMap={setSelectedMap} />

      <div className="flex justify-between mb-6">
        {[{ label: "Équipe A", team: teamA, teamKey: "A" }, { label: "Équipe B", team: teamB, teamKey: "B" }].map(({ label, team, teamKey }) => (
          <div key={label} className="w-1/2 px-2">
            <h2 className="text-xl font-semibold mb-2">{label}</h2>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => {
                const brawlerName = team[i];
                return (
                  <div
                    key={i}
                    className="w-20 h-20 bg-gray-800 rounded relative group"
                    onClick={() => isMobile && brawlerName && removeFromTeam(brawlerName, teamKey as "A" | "B")}
                  >
                    {brawlerName && (
                      <>
                        <img
                          src={`/brawlers/${brawlerName.toLowerCase().replaceAll(" ", "").replace(".", "")}.png`}
                          alt={brawlerName}
                          className="object-contain w-full h-full rounded"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromTeam(brawlerName, teamKey as "A" | "B");
                          }}
                          className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center z-10"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-2">Top 15 Picks</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {top15.map((brawler, index) => {
          const name = brawler.Brawler.trim().toLowerCase();
          const key = Object.keys(brawlerTypes).find(k => k.toLowerCase() === name);
          const brawlerType = key ? brawlerTypes[key] : null;

          return (
            <div key={index} onClick={() => setSelectedForTeam(brawler.Brawler)} className="cursor-pointer">
              <BrawlerCard brawler={brawler} type={brawlerType} width={cardWidth} height={cardHeight} typeIconSize={iconSize} />
            </div>
          );
        })}
      </div>

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
      <div key={index} onClick={() => setSelectedForTeam(brawler.Brawler)} className="cursor-pointer">
        <BrawlerCard
          brawler={brawler}
          type={brawlerType}
          width={cardWidth}
          height={cardHeight}
          typeIconSize={iconSize}
        />
      </div>
    );
  })}
</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {availableBrawlers.map((brawler, index) => {
          const name = brawler.Brawler.trim().toLowerCase();
          const key = Object.keys(brawlerTypes).find(k => k.toLowerCase() === name);
          const brawlerType = key ? brawlerTypes[key] : null;

          return (
            <div key={index} onClick={() => setSelectedForTeam(brawler.Brawler)} className="cursor-pointer">
              <BrawlerCard brawler={brawler} type={brawlerType} width={cardWidth} height={cardHeight} typeIconSize={iconSize} />
            </div>
          );
        })}
      </div>

      {selectedForTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">Ajouter {selectedForTeam} à :</h3>
            <div className="flex justify-around">
              <button onClick={() => addToTeam(selectedForTeam, "A")} className="bg-blue-500 text-white px-4 py-2 rounded">Équipe A</button>
              <button onClick={() => addToTeam(selectedForTeam, "B")} className="bg-red-500 text-white px-4 py-2 rounded">Équipe B</button>
            </div>
            <button onClick={() => setSelectedForTeam(null)} className="mt-4 block text-center text-gray-600 underline">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
