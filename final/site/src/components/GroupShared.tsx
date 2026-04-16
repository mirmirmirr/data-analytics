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
        <FeatureRow label="Energy" value={data.energy_mean} />
        <FeatureRow label="Danceability" value={data.danceability_mean} />
        <FeatureRow label="Valence" value={data.valence_mean} />
        <FeatureRow label="Acousticness" value={data.acousticness_mean} />
        <FeatureRow
          label="Instrumentalness"
          value={data.instrumentalness_mean}
        />
        <FeatureRow label="Tempo" value={data.tempo_mean} />
      </div>
    </section>
  );
}

// Helper to translate raw numbers into human-readable descriptions
function getFeatureDescriptor(label: string, value: number): string {
  switch (label) {
    case "Energy":
      if (value <= 0.1) return "calm";
      else if (value <= 0.4) return "low energy";
      else if (value <= 0.7) return "moderate";
      else if (value <= 0.9) return "energetic";
      else return "very intense";

    case "Danceability":
      if (value <= 0.3) return "irregular beat";
      else if (value <= 0.5) return "loose beat";
      else if (value <= 0.7) return "moderate";
      else if (value <= 0.9) return "steady beat";
      else return "very steady";

    case "Valence":
      if (value <= 0.2) return "sad";
      else if (value <= 0.4) return "moody";
      else if (value <= 0.6) return "neutral";
      else if (value <= 0.8) return "positive";
      else return "happy";

    case "Acousticness":
      if (value <= 0.2) return "electronic";
      else if (value <= 0.5) return "mostly electronic";
      else if (value <= 0.7) return "mixed";
      else if (value <= 0.9) return "mostly acoustic";
      else return "acoustic";

    case "Instrumentalness":
      if (value <= 0.1) return "strong vocals";
      else if (value <= 0.4) return "mostly vocal";
      else if (value <= 0.7) return "mixed";
      else if (value <= 0.9) return "mostly instrumental";
      else return "strong instrumental";

    case "Tempo":
      if (value < 90) return "very slow";
      else if (value <= 110) return "slow";
      else if (value <= 130) return "moderate";
      else if (value <= 150) return "fast";
      else return "very fast";

    default:
      return "Unknown";
  }
}

function FeatureRow({ label, value }: { label: string; value: number }) {
  const displayValue = getFeatureDescriptor(label, value);

  const rawDataText =
    label === "Tempo"
      ? `${value.toFixed(0)} BPM`
      : `Average: ${(value * 100).toFixed(0)} / 100`;

  return (
    <div className="flex justify-between items-center group">
      <div>
        <p className="text-[15px] text-white font-medium">{label}</p>
        <p className="text-[13px] text-[#A7A7A7]">{rawDataText}</p>
      </div>
      <div className="text-[13px] font-medium text-white px-3 py-1.5 bg-gray-4 rounded-md group-hover:bg-gray-6 transition-colors">
        {displayValue}
      </div>
    </div>
  );
}
