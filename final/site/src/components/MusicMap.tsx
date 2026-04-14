import { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import type { Song } from "@/types/song";

type Props = {
  data: Song[];
  colorMode: "cluster" | "genre";
};

export default function MusicMap({ data, colorMode }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    setSelectedGroup(null);
  }, [colorMode]);

  const uniqueGroups = Array.from(
    new Set(
      data.map((d) => (colorMode === "cluster" ? d.cluster : d.track_genre)),
    ),
  ).sort();

  const colors = [
    "#FF3B30",
    "#FF9F0A",
    "#FFCC00",
    "#34C759",
    "#00C7BE",
    "#32ADE6",
    "#007AFF",
    "#5856D6",
    "#AF52DE",
    "#FF2D55",
  ];

  const series = uniqueGroups.map((groupId, index) => {
    const groupData = data.filter((d) =>
      colorMode === "cluster"
        ? d.cluster === groupId
        : d.track_genre === groupId,
    );

    // Dim non-selected groups when a group is selected
    const isDimmed =
      selectedGroup !== null && selectedGroup !== String(groupId);
    const activeColor = colors[index % colors.length];

    return {
      type: "scatter",
      id: `group-${index}`,
      name: `${colorMode === "cluster" ? "Cluster" : "Genre"} ${groupId}`,
      data: groupData.map((d) => [
        d.x,
        d.y,
        d.track_name,
        d.cluster,
        d.artists,
        d.album_name,
        d.track_genre,
      ]),
      symbolSize: 10,
      large: true,
      largeThreshold: 2000,
      universalTransition: true,
      itemStyle: {
        color: isDimmed ? "#CECECE" : activeColor,
        opacity: isDimmed ? 0.15 : 0.8,
      },
      emphasis: {
        scale: true,
        itemStyle: { opacity: 1 },
      },
    };
  });

  const options: echarts.EChartsOption = {
    animation: false,
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: 0,
      padding: 0,
      extraCssText:
        "box-shadow: none; border: none; pointer-events: none; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 12px;",
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
            <div class="flex flex-row items-start gap-1">
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
    xAxis: { type: "value", show: false, scale: true },
    yAxis: { type: "value", show: false, scale: true },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        filterMode: "none",
      },
      {
        type: "inside",
        yAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        filterMode: "none",
      },
    ],
    series: series,
    grid: { top: 0, left: 0, right: 0, bottom: 0 },
  };

  // 4. Handle clicks on the data points
  const onEvents = {
    click: (params: any) => {
      if (params.componentType === "series") {
        const clickedData = params.data;
        const clickedGroupId =
          colorMode === "cluster" ? clickedData[3] : clickedData[6];

        setSelectedGroup((prev) =>
          prev === String(clickedGroupId) ? null : String(clickedGroupId),
        );
      }
    },
  };

  const handleChartReady = (echartsInstance: any) => {
    echartsInstance.setOption({
      dataZoom: [
        { start: 30, end: 50 },
        { start: 30, end: 50 },
      ],
    });

    // Allow users to clear the selection by clicking the empty background
    echartsInstance.getZr().on("click", (event: any) => {
      // If event.target is undefined, the user clicked empty canvas space
      if (!event.target) {
        setSelectedGroup(null);
      }
    });
  };

  return (
    <div className="w-full h-full">
      <ReactECharts
        option={options}
        onEvents={onEvents}
        onChartReady={handleChartReady}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
