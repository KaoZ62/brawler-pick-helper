// 5. SortAndFilterControls.tsx
export function SortAndFilterControls({ sortMode, setSortMode, filterType, setFilterType, allTypes }) {
  return (
    <div className="flex justify-end gap-2 mb-2">
      <select
        value={sortMode}
        onChange={(e) => setSortMode(e.target.value)}
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
  );
}
