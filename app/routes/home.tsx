""import { useEffect, useState } from "react";
import brawlerIcons from "../brawlerIcons.ts";
import BrawlerCard from "./components/BrawlerCard";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [brawlerTypes, setBrawlerTypes] = useState<{ [key: string]: string }>({});
  const [selectedMap, setSelectedMap] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const mapRes = await fetch("/brawlers_by_map.json");
      const mapJson = await mapRes.json();
      const typeRes = await fetch("/brawlerTypes.json");
      const typeJson = await typeRes.json();

      setData(mapJson);
      setBrawlerTypes(Object.fromEntries(typeJson.map((entry: any) => [entry.Brawler, entry.Type])));
      setSelectedMap(mapJson[0]?.Map || "");
    }
    fetchData();
  }, []);

  const modePrefixes = [
    "gem_grab",
    "brawl_ball",
    "bounty",
    "hot_zone",
    "knockout",
    "heist",
  ];

  const rawMaps = [...new Set(data.map((item) => item.Map))];
  const maps = modePrefixes.flatMap((prefix) =>
    rawMaps.filter((map) => map.toLowerCase().startsWith(prefix))
  );

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

  const cardWidth = isMobile ? "180px" : "270px";
  const cardHeight = isMobile ? "80px" : "100px";
  const iconSize = isMobile ? "24px" : "30px";

  return (
    <div className="min-h-screen bg-black p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Top Brawlers by Map</h1>

      {/* MENU DÉFILANT DES MAPS */}
      <div className="flex overflow-x-auto space-x-4 mb-6 pb-2">
        {maps.map((map) => {
          const rawId = map
            .toLowerCase()
            .replaceAll(" ", "_")
            .replaceAll("'", "");
          const mode =
            modePrefixes.find((prefix) => rawId.startsWith(prefix)) || "default";
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
                style={{ height: "auto", maxHeight: "250px" }}
              />
            </div>
          );
        })}
      </div>

      {/* AFFICHAGE DES BRAWLERS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
        {filteredBrawlers.map((brawler, index) => {
          const name = brawler.Brawler.trim().toLowerCase();
          const key = Object.keys(brawlerTypes).find(k => k.toLowerCase() === name);
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
