import { useState } from "react";
import mapData from "../all_brawlers_by_map.json";
import rawBrawlerTypes from "../brawlerTypes.json";
import brawlerIcons from "../brawlerIcons";

const brawlerTypeDict: { [key: string]: string } = Object.fromEntries(
  rawBrawlerTypes.map((entry) => [entry.Brawler, entry.Type])
);

export default function Draft() {
  const maps = [...new Set(mapData.map((item) => item.Map))];
  const [selectedMap, setSelectedMap] = useState(maps[0]);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<"pick" | "alpha">("pick");

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

  const filtered = mapData.filter((b) => b.Map === selectedMap);
  type BrawlerEntry = (typeof mapData)[0];

  const brawlerMap = new Map<string, BrawlerEntry>();
  filtered.forEach((b) => {
    const current = brawlerMap.get(b.Brawler);
    if (!current || b["Pick Rate"] > current["Pick Rate"]) {
      brawlerMap.set(b.Brawler, b);
    }
  });
  const uniqueFiltered = Array.from(brawlerMap.values());

  const sortedByPickRate = [...uniqueFiltered].sort(
    (a, b) => b["Pick Rate"] - a["Pick Rate"]
  );

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
                selectedMap === map ? "border-blue-500" : "border-gray-700"
              }`}
            >
              <div className={`${colorClass} text-white text-center py-2 text-sm font-semibold`}>
                <div>{readableMode}</div>
                <div className="text-xs font-normal">{mapName}</div>
              </div>
              <img
                src={`/maps/${mapId}.png`}
                alt={map}
                className="w-full object-contain"
                style={{ maxHeight: "200px" }}
              />
            </div>
          );
        })}
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
          const key = Object.keys(brawlerTypeDict).find((k) => k.toLowerCase() === name);
          const type = key ? brawlerTypeDict[key].toLowerCase() : null;
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
    const key = Object.keys(brawlerTypeDict).find((k) => k.toLowerCase() === name);
    const type = key ? brawlerTypeDict[key].toLowerCase() : null;
    const icon = type ? brawlerIcons[type] : null;

    return (
      <div
        key={brawler.Brawler}
        onClick={() => toggleBrawler(brawler.Brawler, teamA.length < 3 ? "A" : "B")}
        className="cursor-pointer bg-gray-800 rounded p-3 flex items-center gap-3 text-white hover:bg-gray-700"
      >
        <div className="relative w-16 h-16">
          <img
            src={`/brawlers/${brawler.Brawler.toLowerCase().replaceAll(" ", "").replaceAll(".", "")}.png`}
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
