import brawlerIcons from "../../brawlerIcons";

type BrawlerCardProps = {
  brawler: {
    Brawler: string;
    "Pick Rate": number;
    "Win Rate": number;
  };
  type: string | null;
  width?: string;
  height?: string;
  typeIconSize?: string;
  className?: string; // 👈 ajout
};

export default function BrawlerCard({
  brawler,
  type,
  width = "200px",
  height = "auto",
  typeIconSize = "24px",
  className = "" // 👈 ajout
}: BrawlerCardProps) {
  const name = brawler.Brawler.trim().toLowerCase();
  const imgId = name.replaceAll(" ", "").replaceAll(".", "");
  const typeIcon = type ? brawlerIcons[type.toLowerCase()] : null;

  return (
    <div
      className={`bg-gray-800 rounded shadow p-4 text-gray-100 flex items-center gap-4 border border-gray-700 ${className}`}
      style={{
        width,
        height,
        minHeight: height,
        display: "flex",
        alignItems: "center"
      }}
    >
      <div className="relative w-20 h-20 rounded overflow-hidden bg-transparent">

        <img
          src={`/brawlers/${imgId}.png`}
          alt={brawler.Brawler}
          className="w-full h-full object-contain"
        />
        {typeIcon && (
          <img
            src={typeIcon}
            alt={type || ""}
            title={type || ""}
            style={{ width: typeIconSize, height: typeIconSize }}
            className="absolute top-0 right-0 z-50"
          />
        )}
      </div>
      <div className="flex flex-col justify-center">
  <h2 className="text-base font-semibold">{brawler.Brawler}</h2>
  <p className="text-sm">
    Pick Rate: <span className="float-right">{(brawler["Pick Rate"] * 100).toFixed(2)}%</span>
  </p>
  <p className="text-sm">
    Win Rate: <span className="float-right">{(brawler["Win Rate"] * 100).toFixed(2)}%</span>
  </p>
</div>

    </div>
  );
}
