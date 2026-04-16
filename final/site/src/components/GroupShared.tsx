import type { Group } from "@/types/types";

export function GroupTags({
  data,
  type,
}: {
  data: Group;
  type: "cluster" | "genre";
}) {
  if (!data?.seen_in || data.seen_in.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-bold text-white mb-4">
        {type === "cluster"
          ? "Top 5 Prominent Genres"
          : "Top 5 Clusters Seen In"}
      </h3>
      <div className="flex flex-wrap gap-2">
        {data.seen_in.map((g) => (
          <span
            key={g}
            className="px-4 py-1.5 bg-gray-4 hover:bg-gray-6 transition-colors rounded-full text-[14px] font-medium text-white capitalize"
          >
            {g}
          </span>
        ))}
      </div>
    </section>
  );
}

export function GroupFeatures({ data }: { data: Group }) {
  return (
    <section>
      <h3 className="text-lg font-bold text-white mb-4">Audio Features</h3>
      <div className="space-y-4">
        <FeatureRow label="Energy" value={data.energy_mean} isPercentage />
        <FeatureRow
          label="Danceability"
          value={data.danceability_mean}
          isPercentage
        />
        <FeatureRow label="Valence" value={data.valence_mean} isPercentage />
        <FeatureRow
          label="Acousticness"
          value={data.acousticness_mean}
          isPercentage
        />
        <FeatureRow
          label="Instrumentalness"
          value={data.instrumentalness_mean}
          isPercentage
        />
        <FeatureRow label="Tempo" value={data.tempo_mean} suffix=" BPM" />
      </div>
    </section>
  );
}

function FeatureRow({
  label,
  value,
  isPercentage = false,
  suffix = "",
}: {
  label: string;
  value: number;
  isPercentage?: boolean;
  suffix?: string;
}) {
  const displayValue = isPercentage
    ? `${(value * 100).toFixed(0)}%`
    : `${value.toFixed(0)}${suffix}`;

  return (
    <div className="flex justify-between items-center group">
      <div>
        <p className="text-[15px] text-white font-medium">{label}</p>
        <p className="text-[14px] text-[#A7A7A7]">Mean Value</p>
      </div>
      <div className="text-[15px] font-medium text-white px-3 py-1 bg-gray-4 rounded-md group-hover:bg-gray-6 transition-colors">
        {displayValue}
      </div>
    </div>
  );
}
