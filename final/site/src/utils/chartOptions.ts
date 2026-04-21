import * as echarts from "echarts";
import type { Song } from "@/types/types";

const COLORS = [
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

export function getChartConfigs(
  data: Song[],
  colorMode: "cluster" | "genre",
  uniqueGroups: (string | number)[],
  selectedGroup: string | null,
  isMobile: boolean,
) {
  const series: echarts.ScatterSeriesOption[] = uniqueGroups.map(
    (groupId, index) => {
      const groupData = data.filter((d) =>
        colorMode === "cluster"
          ? d.cluster === groupId
          : d.track_genre === groupId,
      );

      const isDimmed =
        selectedGroup !== null && selectedGroup !== String(groupId);
      const activeColor = COLORS[index % COLORS.length];

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
          d.track_id,
        ]),
        symbolSize: 10,
        large: true,
        largeThreshold: 2000,
        itemStyle: {
          color: isDimmed ? "#313131" : activeColor,
          opacity: isDimmed ? 0.15 : 0.7,
        },
        emphasis: {
          scale: true,
          // focus: "self",
          itemStyle: {
            opacity: 1,
            borderColor: activeColor,
            borderWidth: 14,
            shadowBlur: 12,
            shadowColor: "rgba(0, 0, 0, 0.4)",
          },
        },
      };
    },
  );

  const mainOptions: echarts.EChartsOption = {
    animation: false,
    backgroundColor: "transparent",
    xAxis: { type: "value", show: false, scale: true },
    yAxis: { type: "value", show: false, scale: true },
    grid: {
      top: isMobile ? 50 : 0,
      left: isMobile ? 10 : 200,
      right: isMobile ? 10 : 360,
      bottom: isMobile ? 200 : 0,
    },
    dataZoom: [
      {
        id: "zoomX",
        type: "inside",
        xAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        filterMode: "none",
      },
      {
        id: "zoomY",
        type: "inside",
        yAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        filterMode: "none",
      },
    ],
    series: series,
  };

  const minimapOptions: echarts.EChartsOption = {
    animation: false,
    xAxis: { type: "value", show: false, scale: true },
    yAxis: { type: "value", show: false, scale: true },
    grid: { top: 0, left: 0, right: 0, bottom: 0 },
    series: series.map((s) => ({
      ...s,
      symbolSize: 2,
      itemStyle: { ...s.itemStyle, opacity: 0.4 },
      emphasis: { disabled: true },
    })),
  };

  return { mainOptions, minimapOptions, colors: COLORS };
}
