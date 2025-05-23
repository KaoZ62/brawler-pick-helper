import { useState } from "react";
import data from "../brawlers_by_map.json";
import brawlerIcons from "../brawlerIcons.ts";
import rawBrawlerTypes from "../brawlerTypes.json";

const brawlerTypes: { [key: string]: string } = Object.fromEntries(
  rawBrawlerTypes.map((entry) => [entry.Brawler, entry.Type])
);

export default function Home() {
  const maps = [...new Set(data.map((item) => item.Map))];
  const [selectedMap, setSelectedMap] = useState(maps[0]);

  const modeColors: { [key: string]: string } = {
    bounty: "bg-teal-600",
    brawl_ball: "bg-blue-500",
    knockout: "bg-orange-800",
    hot_zone: "bg-red-700",
    heist: "bg-purple-600",
    gem_grab: "bg-violet-600",
  };

  const filteredBrawlers = data
    .filter((b) => b.Map === selectedMap)
    .sort((a, b) => b["Pick Rate"] - a["Pick Rate"]);

  return (
    <div className="min-h-screen bg-black p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Top Brawlers by Map</h1>

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

          const rawId = map
            .toLowerCase()
            .replaceAll(" ", "_")
            .replaceAll("'", "");
          const mode =
            modePrefixes.find((prefix) => rawId.startsWith(prefix)) ||
            "default";
          const mapId = rawId.replace(`${mode}_`, "");
          const colorClass = modeColors[mode] || "bg-gray-700";

          const readableMode = mode
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          const mapName = map
            .replaceAll("_", " ")
            .replace(readableMode, "")
            .trim();

          return (
            <div
              key={map}
              onClick={() => setSelectedMap(map)}
              className={`min-w-[160px] cursor-pointer rounded overflow-hidden border shadow-lg hover:shadow-xl ${
                selectedMap === map ? "border-blue-500" : "border-gray-300"
              }`}
            >
              <div
                className={`${colorClass} text-white py-2 px-2 text-sm font-semibold flex items-center gap-2`}
              >
                <img
                  src={`/icons/${mode}.png`}
                  alt={readableMode}
                  className="w-5 h-5 object-contain"
                />
                <div className="flex flex-col leading-tight">
                  <span>{readableMode}</span>
                  <span className="text-xs font-normal">{mapName}</span>
                </div>
              </div>
              <img
                src={`/maps/${mapId}.png`}
                alt={map}
                className="w-full object-contain"
                style={{ height: "auto", maxHeight: "200px" }}
              />
            </div>
          );
        })}
      </div>

      {/* AFFICHAGE DES BRAWLERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrawlers.map((brawler, index) => {
          const brawlerId = brawler.Brawler
            .toLowerCase()
            .replaceAll(" ", "")
            .replace(".", "")
            .replace("-", "");
          const name = brawler.Brawler.trim().toLowerCase();
          const key = Object.keys(brawlerTypes).find(k => k.toLowerCase() === name);
          const brawlerType = key ? brawlerTypes[key].toLowerCase() : null;
          const typeIcon = brawlerIcons[brawlerType];

          return (
            <div
              key={index}
              className="bg-black rounded shadow p-4 text-gray-100 flex items-center gap-4 border border-gray-700"
            >
              <div className="relative w-20 h-20 bg-yellow-300">
                <img
                  src={`/brawlers/${brawlerId}.png`}
                  alt={brawler.Brawler}
                  className="w-full h-full object-contain"
                />
                {typeIcon && (
                  <img
  src={typeIcon}
  alt={brawlerType}
  title={brawlerType}
  className="absolute top-0 right-0 w-6 h-6 z-50"
/>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {brawler.Brawler}
                </h2>
                <p>
                  Pick Rate: {(brawler["Pick Rate"] * 100).toFixed(2)}%
                </p>
                <p>
                  Win Rate: {(brawler["Win Rate"] * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
