import { useEffect, useState } from "react";
import brawlerIcons from "../brawlerIcons";

export default function Draft() {
  const [mapData, setMapData] = useState<any[]>([]);
  const [brawlerTypes, setBrawlerTypes] = useState<{ [key: string]: string }>({});
  const [maps, setMaps] = useState<string[]>([]);
  const [selectedMap, setSelectedMap] = useState<string>("");
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<"pick" | "alpha">("pick");

  useEffect(() => {
    async function fetchData() {
      const mapRes = await fetch("/all_brawlers_by_map.json");
      const typeRes = await fetch("/brawlerTypes.json");
      const mapJson = await mapRes.json();
      const typeJson = await typeRes.json();

      setMapData(mapJson);
      setBrawlerTypes(Object.fromEntries(typeJson.map((entry: any) => [entry.Brawler, entry.Type])));

      const uniqueMaps = [...new Set(mapJson.map((item: any) => item.Map))];
      setMaps(uniqueMaps);
      setSelectedMap(uniqueMaps[0]);
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
    .sort((a, b) => {
      if (sortMode === "alpha") {
        return a.Brawler.localeCompare(b.Brawler);
      }
      return b["Pick Rate"] - a["Pick Rate"];
    });

  const toggleBrawler = (brawler: string, team: "A" | "B") => {
    const setTeam = team === "A" ? setTeamA : setTeamB;
    const currentTeam = team === "A" ? teamA : teamB;

    if (currentTeam.includes(brawler)) {
      setTeam(currentTeam.filter((b) => b !== brawler));
    } else if (currentTeam.length < 3) {
      setTeam([...currentTeam, brawler]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Draft Simulator</h1>

      {/* MAP SELECTION */}
      <div className="flex overflow-x-auto space-x-4 mb-6 pb-2">
        {maps.map((map) => (
          <button
            key={map}
            onClick={() => setSelectedMap(map)}
            className={`px-4 py-2 rounded ${
              selectedMap === map ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            {map}
          </button>
        ))}
      </div>

      {/* TEAM A & B */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {["A", "B"].map((team) => {
          const teamData = team === "A" ? teamA : teamB;
          return (
            <div key={team}>
              <h2 className="text-xl font-semibold mb-2">Team {team}</h2>
              <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => {
                  const brawlerName = teamData[i];
                  return (
                    <div
                      key={i}
                      className="w-20 h-20 bg-gray-800 rounded relative group"
                    >
                      {brawlerName && (
                        <>
                          <img
                            src={`/brawlers/${brawlerName.toLowerCase().replaceAll(" ", "").replace(".", "")}.png`}
                            alt={brawlerName}
                            className="object-contain w-full h-full rounded"
                          />
                          <button
                            onClick={() => {
                              const setTeam = team === "A" ? setTeamA : setTeamB;
                              setTeam(teamData.filter((_, index) => index !== i));
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
          );
        })}
      </div>

      {/* TOP 15 */}
      <h2 className="text-lg font-semibold mb-2">Top 15 Picks</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {top15.map((brawler) => {
          const name = brawler.Brawler.trim().toLowerCase();
          const key = Object.keys(brawlerTypes).find((k) => k.toLowerCase() === name);
          const type = key ? brawlerTypes[key].toLowerCase() : null;
          const icon = type ? brawlerIcons[type] : null;

          return (
            <div
              key={brawler.Brawler}
              onClick={() => toggleBrawler(brawler.Brawler, teamA.length < 3 ? "A" : "B")}
              className="cursor-pointer bg-gray-800 rounded p-3 flex items-center gap-3 text-white hover:bg-gray-700"
            >
              <div className="relative w-16 h-16">
                <img
                  src={`/brawlers/${name.replaceAll(" ", "").replaceAll(".", "")}.png`}
                  alt={brawler.Brawler}
                  className="w-full h-full object-contain"
                />
                {icon && (
                  <img
                    src={icon}
                    alt={type}
                    title={type}
                    className="absolute top-0 right-0 w-6 h-6 z-50"
                  />
                )}
              </div>
              <div>
                <div className="font-semibold">{brawler.Brawler}</div>
                <div className="text-xs">Pick: {(brawler["Pick Rate"] * 100).toFixed(2)}%</div>
                <div className="text-xs">Win: {(brawler["Win Rate"] * 100).toFixed(2)}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ALL AVAILABLE BRAWLERS */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Available Brawlers</h2>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as "pick" | "alpha")}
          className="bg-white text-black px-2 py-1 rounded text-sm"
        >
          <option value="pick">📈 Pick Rate</option>
          <option value="alpha">🔤 Alphabetical</option>
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {availableBrawlers.map((brawler) => {
          const name = brawler.Brawler.trim().toLowerCase();
          const key = Object.keys(brawlerTypes).find((k) => k.toLowerCase() === name);
          const type = key ? brawlerTypes[key].toLowerCase() : null;
          const icon = type ? brawlerIcons[type] : null;

          return (
            <div
              key={brawler.Brawler}
              onClick={() => toggleBrawler(brawler.Brawler, teamA.length < 3 ? "A" : "B")}
              className="cursor-pointer bg-gray-800 rounded p-3 flex items-center gap-3 text-white hover:bg-gray-700"
            >
              <div className="relative w-16 h-16">
                <img
                  src={`/brawlers/${name.replaceAll(" ", "").replaceAll(".", "")}.png`}
                  alt={brawler.Brawler}
                  className="w-full h-full object-contain"
                />
                {icon && (
                  <img
                    src={icon}
                    alt={type}
                    title={type}
                    className="absolute top-0 right-0 w-6 h-6 z-50"
                  />
                )}
              </div>
              <div>
                <div className="font-semibold">{brawler.Brawler}</div>
                <div className="text-xs">Pick: {(brawler["Pick Rate"] * 100).toFixed(2)}%</div>
                <div className="text-xs">Win: {(brawler["Win Rate"] * 100).toFixed(2)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
