import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import type { Song } from "@/types/song";

type Props = {
  data: Song[];
};

export default function MusicMap({ data }: Props) {
  // 1. Find all unique clusters in the dataset
  const uniqueClusters = Array.from(new Set(data.map((d) => d.cluster))).sort();

  // A premium, Apple-inspired color palette for the clusters
  const colors = [
    "#5E5CE6", // Indigo
    "#FFD60A", // Yellow
    "#FF375F", // Pink
    "#32D74B", // Green
    "#64D2FF", // Light Blue
    "#FF9F0A", // Orange
    "#BF5AF2", // Purple
  ];

  // 2. Generate a separate ECharts series for every cluster to keep high performance
  const series = uniqueClusters.map((clusterId, index) => {
    // Filter data to only include songs in this cluster
    const clusterData = data.filter((d) => d.cluster === clusterId);

    return {
      type: "scatter",
      name: `Cluster ${clusterId}`,
      // Format: [x, y, track_name, cluster, artists, album_name]
      data: clusterData.map((d) => [
        d.x,
        d.y,
        d.track_name,
        d.cluster,
        d.artists,
        d.album_name,
        d.track_genre,
      ]),
      symbolSize: 20,
      large: true, // 🔥 Keeps the 10k points rendering at 60fps
      largeThreshold: 2000,
      itemStyle: {
        color: colors[index % colors.length],
        opacity: 0.6,
      },
      emphasis: {
        scale: true,
        itemStyle: {
          opacity: 1,
        },
      },
    };
  });

  const options: echarts.EChartsOption = {
    animation: false, // Ensures zooming feels like a solid map, not floating points
    backgroundColor: "transparent", // Lets the background from App.tsx show through
    tooltip: {
      trigger: "item",
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: 0,
      padding: 0,
      extraCssText:
        "box-shadow: none; border: none; pointer-events: none; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); ",
      formatter: (params: any) => {
        const item = params.data;
        return `
          <div class="flex flex-col gap-1.5 p-3 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-300" style="pointer-events: auto;">
            <h3 class="text-sm font-semibold text-gray-900 tracking-tight leading-none">
              ${item[2]}
            </h3>
            <p class="text-xs text-gray-600 font-medium leading-none">
              ${item[4]} &mdash; ${item[5]}
            </p>
            <div class=""flex flex-row items-start>
              <div class="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-black/5 w-fit">
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Cluster ${item[3]}
                </span>
              </div>
              <div class="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-black/5 w-fit">
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  ${item[6]}
                </span>
              </div>
            </div>
          </div>
        `;
      },
    },
    xAxis: {
      type: "value",
      show: false,
      scale: true,
    },
    yAxis: {
      type: "value",
      show: false,
      scale: true,
    },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        filterMode: "none",
        start: 30,
        end: 50,
      },
      {
        type: "inside",
        yAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        filterMode: "none",
        start: 30,
        end: 50,
      },
    ],
    series: series,
    grid: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  };

  return (
    <div className="w-full h-full">
      <ReactECharts
        option={options}
        style={{ height: "100%", width: "100%" }}
        notMerge={true}
      />
    </div>
  );
}
