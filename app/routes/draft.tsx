import { useEffect, useState } from "react";
import brawlerIcons from "../brawlerIcons";
import BrawlerCard from "./components/BrawlerCard";

export default function Draft() {
  const [mapData, setMapData] = useState<any[]>([]);
  const [brawlerTypes, setBrawlerTypes] = useState<{ [key: string]: string }>({});
  const [maps, setMaps] = useState<string[]>([]);
  const [selectedMap, setSelectedMap] = useState<string>("");
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortMode, setSortMode] = useState<"pick" | "alpha">("pick");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedForTeam, setSelectedForTeam] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const modeColors: { [key: string]: string } = {
    bounty: "bg-teal-600",
    brawl_ball: "bg-blue-500",
    knockout: "bg-orange-800",
    hot_zone: "bg-red-700",
    heist: "bg-purple-600",
    gem_grab: "bg-violet-600",
  };

  const modePrefixes = [
    "gem_grab",
    "brawl_ball",
    "bounty",
    "hot_zone",
    "knockout",
    "heist",
  ];

  useEffect(() => {
    async function fetchData() {
      const mapRes = await fetch("/all_brawlers_by_map.json");
      const typeRes = await fetch("/brawlerTypes.json");
      const mapJson = await mapRes.json();
      const typeJson = await typeRes.json();

      setMapData(mapJson);
      setBrawlerTypes(
        Object.fromEntries(typeJson.map((entry: any) => [entry.Brawler, entry.Type]))
      );

      const rawMaps = [...new Set(mapJson.map((item: any) => item.Map))];
      const orderedMaps = modePrefixes.flatMap((prefix) =>
        rawMaps.filter((map) => map.toLowerCase().startsWith(prefix))
      );

      setMaps(orderedMaps);
      setSelectedMap(orderedMaps[0]);
    }

    fetchData();
  }, []);

  if (!selectedMap || mapData.length === 0) return <div className="text-white p-6">Loading...</div>;

  const filtered = mapData.filter((b) => b.Map === selectedMap);
  const brawlerMap = new Map<string, any>();
  filtered.forEach((b) => {
    const current = brawlerMap.get(b.Brawler);
    if (!current || b["Pick Rate"] > current["Pick Rate"]) {
      brawlerMap.set(b.Brawler, b);
    }
  });

  const uniqueFiltered = Array.from(brawlerMap.values());
  const sortedByPickRate = [...uniqueFiltered].sort((a, b) => b["Pick Rate"] - a["Pick Rate"]);
  const top15 = sortedByPickRate.slice(0, 15);
  const top15Names = new Set(top15.map((b) => b.Brawler));

  const availableBrawlers = sortedByPickRate
    .filter((b) => !top15Names.has(b.Brawler))
    .filter((b) => {
      if (filterType === "all") return true;
      const name = b.Brawler.trim().toLowerCase();
      const key = Object.keys(brawlerTypes).find(k => k.toLowerCase() === name);
      const brawlerType = key ? brawlerTypes[key].toLowerCase() : "";
      return brawlerType === filterType;
    })
    .sort((a, b) => {
      if (sortMode === "alpha") {
        return a.Brawler.localeCompare(b.Brawler);
      }
      return b["Pick Rate"] - a["Pick Rate"];
    });

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

      {/* MAP SELECTION */}
      <div className="flex overflow-x-auto space-x-4 mb-6 pb-2">
        {maps.map((map) => {
          const rawId = map.toLowerCase().replaceAll(" ", "_").replaceAll("'", "");
          const mode = modePrefixes.find((prefix) => rawId.startsWith(prefix)) || "default";
          const mapId = rawId.replace(`${mode}_`, "");
          const colorClass = modeColors[mode] || "bg-gray-700";

          const readableMode = mode
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          const mapName = map.replaceAll("_", " ").replace(readableMode, "").trim();

          return (
            <div
              key={map}
              onClick={() => setSelectedMap(map)}
              className={`min-w-[160px] cursor-pointer rounded overflow-hidden border shadow-lg hover:shadow-xl ${
                selectedMap === map ? "border-blue-500" : "border-gray-300"
              }`}
            >
              <div className={`${colorClass} text-white py-2 px-2 text-sm font-semibold flex items-center gap-2`}>
                <img src={`/icons/${mode}.png`} alt={readableMode} className="w-5 h-5 object-contain" />
                <div className="flex flex-col leading-tight">
                  <span>{readableMode}</span>
                  <span className="text-xs font-normal">{mapName}</span>
                </div>
              </div>
              <img src={`/maps/${mapId}.png`} alt={map} className="w-full object-contain" style={{ height: "auto", maxHeight: "250px" }} />
            </div>
          );
        })}
      </div>

      {/* TEAM TITLES + SLOTS */}
      <div className="flex justify-between mb-6">
        {[
          { label: "Équipe A", team: teamA, teamKey: "A" },
          { label: "Équipe B", team: teamB, teamKey: "B" },
        ].map(({ label, team, teamKey }) => (
          <div key={label} className="w-1/2 px-2">
            <h2 className="text-xl font-semibold mb-2">{label}</h2>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => {
                const brawlerName = team[i];
                return (
                  <div
                    key={i}
                    className="w-20 h-20 bg-gray-800 rounded relative group"
                    onClick={() => {
                      if (isMobile && brawlerName) {
                        removeFromTeam(brawlerName, teamKey as "A" | "B");
                      }
                    }}
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

      {/* TOP 15 PICKS */}
      <h2 className="text-lg font-semibold mb-2">Top 15 Picks</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {top15.map((brawler, index) => {
          const name = brawler.Brawler.trim().toLowerCase();
          const key = Object.keys(brawlerTypes).find(k => k.toLowerCase() === name);
          const brawlerType = key ? brawlerTypes[key] : null;

          return (
            <div key={index} onClick={() => setSelectedForTeam(brawler.Brawler)} className="cursor-pointer">
              <BrawlerCard
                brawler={brawler}
                type={brawlerType}
                width={isMobile ? "190px" : "270px"}
                height={isMobile ? "105px" : "100px"}
                typeIconSize={isMobile ? "20px" : "25px"}
              />
            </div>
          );
        })}
      </div>

      {/* FILTER AND SORT DROPDOWNS */}
      <div className="flex justify-end gap-2 mb-2">
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as "pick" | "alpha")}
          className="bg-white text-black px-2 py-1 rounded text-sm"
        >
          <option value="pick">📈 Pick Rate</option>
          <option value="alpha">🔤 Alphabetical</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white text-black px-2 py-1 rounded text-sm"
        >
          <option value="all">🔁 All Types</option>
          {allTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* AVAILABLE BRAWLERS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {availableBrawlers.map((brawler, index) => {
          const name = brawler.Brawler.trim().toLowerCase();
          const key = Object.keys(brawlerTypes).find(k => k.toLowerCase() === name);
          const brawlerType = key ? brawlerTypes[key] : null;

          return (
            <div key={index} onClick={() => setSelectedForTeam(brawler.Brawler)} className="cursor-pointer">
              <BrawlerCard
                brawler={brawler}
                type={brawlerType}
                width={isMobile ? "190px" : "270px"}
                height={isMobile ? "105px" : "100px"}
                typeIconSize={isMobile ? "20px" : "25px"}
              />
            </div>
          );
        })}
      </div>

      {/* TEAM SELECT MODAL */}
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