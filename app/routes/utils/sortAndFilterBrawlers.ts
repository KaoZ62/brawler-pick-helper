// 4. sortAndFilterBrawlers.ts
export function sortAndFilterBrawlers(data, selectedMap, brawlerTypes, top15Names, filterType, sortMode) {
  return data
    .filter((b) => b.Map === selectedMap && !top15Names.has(b.Brawler))
    .filter((b) => {
      if (filterType === "all") return true;
      const name = b.Brawler.trim().toLowerCase();
      const key = Object.keys(brawlerTypes).find((k) => k.toLowerCase() === name);
      const brawlerType = key ? brawlerTypes[key].toLowerCase() : "";
      return brawlerType === filterType;
    })
    .sort((a, b) => {
      if (sortMode === "alpha") return a.Brawler.localeCompare(b.Brawler);
      return b["Pick Rate"] - a["Pick Rate"];
    });
}
