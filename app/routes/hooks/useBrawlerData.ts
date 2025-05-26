import { useEffect, useState } from "react";

export const useBrawlerData = () => {
  const [allBrawlers, setAllBrawlers] = useState<any[]>([]);
  const [brawlerTypes, setBrawlerTypes] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const mapRes = await fetch("/all_brawlers_by_map.json");
        const mapJson = await mapRes.json();

        const typeRes = await fetch("/brawlerTypes.json");
        const typeJson = await typeRes.json();

        // Logs pour debug
        console.log("✅ mapJson sample:", mapJson[0]);
        console.log("✅ typeJson sample:", typeJson[0]);

        setAllBrawlers(mapJson);
        setBrawlerTypes(
          Object.fromEntries(typeJson.map((entry: any) => [entry.Brawler, entry.Type]))
        );
        setIsLoading(false);
      } catch (err) {
        console.error("❌ Erreur pendant fetchData:", err);
      }
    }

    fetchData();
  }, []);

  return { allBrawlers, brawlerTypes, isLoading };
};
