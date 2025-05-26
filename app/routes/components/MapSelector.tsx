
// 3. MapSelector.tsx
import React from "react";

const modeColors: { [key: string]: string } = {
  bounty: "bg-teal-600",
  brawl_ball: "bg-blue-500",
  knockout: "bg-orange-800",
  hot_zone: "bg-red-700",
  heist: "bg-purple-600",
  gem_grab: "bg-violet-600",
};

const modePrefixes = ["gem_grab", "brawl_ball", "bounty", "hot_zone", "knockout", "heist"];

export function MapSelector({ maps, selectedMap, setSelectedMap }: { maps: string[], selectedMap: string, setSelectedMap: (map: string) => void }) {
  return (
    <div className="flex overflow-x-auto space-x-4 mb-6 pb-2">
      {maps.map((map) => {
        const rawId = map.toLowerCase().replaceAll(" ", "_").replaceAll("'", "");
        const mode = modePrefixes.find((prefix) => rawId.startsWith(prefix)) || "default";
        const mapId = rawId.replace(`${mode}_`, "");
        const colorClass = modeColors[mode] || "bg-gray-700";

        const readableMode = mode.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
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
  );
}
