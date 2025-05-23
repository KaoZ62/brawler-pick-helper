import { useState } from "react";
import data from "../brawlers_by_map.json";

export default function Home() {
  const maps = [...new Set(data.map((item) => item.Map))];
  const [selectedMap, setSelectedMap] = useState(maps[0]);

  const filteredBrawlers = data
    .filter((b) => b.Map === selectedMap)
    .sort((a, b) => b["Pick Rate"] - a["Pick Rate"]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Top Brawlers by Map</h1>

      {/* MENU DÉFILANT DES MAPS */}
      <div className="flex overflow-x-auto space-x-4 mb-6 pb-2">
        {maps.map((map) => {
          const modePrefixes = [
            "gem_grab",
            "brawl_ball",
            "bounty",
            "hot_zone",
            "knockout",
            "heist",
          ];

          let mapId = map.toLowerCase().replaceAll(" ", "_").replaceAll("'", "");
          modePrefixes.forEach((mode) => {
            if (mapId.startsWith(mode + "_")) {
              mapId = mapId.replace(mode + "_", "");
            }
          });

          return (
            <div
              key={map}
              onClick={() => setSelectedMap(map)}
              className={`min-w-[150px] cursor-pointer rounded border p-2 hover:shadow-lg ${
                selectedMap === map ? "border-blue-500" : "border-gray-300"
              }`}
            >
              <img
                src={`/maps/${mapId}.png`}
                alt={map}
                className="w-full h-24 object-cover rounded mb-2"
              />
              <p className="text-center text-black font-medium text-sm">
                {map.replaceAll("_", " ")}
              </p>
            </div>
          );
        })}
      </div>

      {/* AFFICHAGE DES BRAWLERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrawlers.map((brawler, index) => (
          <div
            key={index}
            className="bg-white rounded shadow p-4 text-black flex items-center gap-4"
          >
            <img
              src={`/brawlers/${brawler.Brawler.toLowerCase().replaceAll(" ", "").replace(".", "").replace("-", "")}.png`}
              alt={brawler.Brawler}
              className="w-20 h-20 object-contain"
            />
            <div>
              <h2 className="text-lg font-semibold">{brawler.Brawler}</h2>
              <p>Pick Rate: {(brawler["Pick Rate"] * 100).toFixed(2)}%</p>
              <p>Win Rate: {(brawler["Win Rate"] * 100).toFixed(2)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
